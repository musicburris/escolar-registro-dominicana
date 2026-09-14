import AppKit
import CryptoKit
import Foundation

enum NeuralEngineState: Equatable {
    case notInstalled, installing(String), ready(String), running(String), failed(String)
    var title: String {
        switch self {
        case .notInstalled: "Motor profesional no instalado"
        case .installing(let text), .running(let text): text
        case .ready(let backend): "Motor listo · \(backend)"
        case .failed(let text): "Error · \(text)"
        }
    }
    var isBusy: Bool { if case .installing = self { return true }; if case .running = self { return true }; return false }
}

enum NeuralEngineError: LocalizedError {
    case missingResource(String), processFailed(String), noOutput, noCheckpoint, consentRequired
    var errorDescription: String? {
        switch self {
        case .missingResource(let name): "Falta el componente interno \(name)."
        case .processFailed(let log): String(log.suffix(1800))
        case .noOutput: "El motor terminó sin crear audio."
        case .noCheckpoint: "El entrenamiento terminó sin producir pesos."
        case .consentRequired: "Debes confirmar que tienes permiso para entrenar esta voz."
        }
    }
}

@MainActor
final class NeuralEngineManager: ObservableObject {
    @Published var state: NeuralEngineState = .notInstalled
    @Published var log = ""
    @Published var progress = 0.0
    @Published var datasetURL: URL?
    @Published var voiceName = "Nueva voz"
    @Published var consentConfirmed = false

    private let paths: StudioPaths
    private var engineRoot: URL { paths.root.appendingPathComponent("Professional Engine") }
    private var sourceRoot: URL { engineRoot.appendingPathComponent("seed-vc") }
    private var venv: URL { engineRoot.appendingPathComponent("venv") }
    private var python: URL { venv.appendingPathComponent("bin/python") }
    private var environment: [String: String] {
        var env = ProcessInfo.processInfo.environment
        env["PYTHONUNBUFFERED"] = "1"
        env["PYTORCH_ENABLE_MPS_FALLBACK"] = "1"
        env["HF_HOME"] = paths.aiModels.appendingPathComponent("HuggingFace").path
        env["HF_HUB_CACHE"] = paths.aiModels.appendingPathComponent("HuggingFace/hub").path
        env["UV_CACHE_DIR"] = paths.cache.appendingPathComponent("uv").path
        env["UV_PYTHON_INSTALL_DIR"] = engineRoot.appendingPathComponent("python").path
        env["VOCALFORGE_DEVICE"] = HardwareAnalyzer.analyze().memoryGB <= 8 ? "cpu" : "mps"
        return env
    }

    init(paths: StudioPaths = .live) {
        self.paths = paths
        state = FileManager.default.isExecutableFile(atPath: python.path) ? .ready(Self.backendLabel) : .notInstalled
    }

    func chooseDataset() {
        let panel = NSOpenPanel(); panel.canChooseDirectories = true; panel.canChooseFiles = false
        panel.message = "Selecciona una carpeta con grabaciones autorizadas"
        if panel.runModal() == .OK { datasetURL = panel.url }
    }

    func install() {
        guard !state.isBusy else { return }
        state = .installing("Preparando Python ARM64…"); progress = 0.05; log = ""
        Task {
            do {
                let fm = FileManager.default
                try fm.createDirectory(at: engineRoot, withIntermediateDirectories: true)
                guard let uv = Bundle.main.resourceURL?.appendingPathComponent("tools/uv"), fm.isExecutableFile(atPath: uv.path) else { throw NeuralEngineError.missingResource("uv ARM64") }
                guard let bundledSource = Bundle.main.resourceURL?.appendingPathComponent("seed-vc"), fm.fileExists(atPath: bundledSource.path) else { throw NeuralEngineError.missingResource("Seed-VC") }
                if fm.fileExists(atPath: sourceRoot.path) { try fm.removeItem(at: sourceRoot) }
                try fm.copyItem(at: bundledSource, to: sourceRoot)

                append(try await Self.run(uv, ["python", "install", "3.10.16"], cwd: engineRoot, env: environment))
                progress = 0.22; state = .installing("Creando runtime aislado…")
                append(try await Self.run(uv, ["venv", "--python", "3.10.16", "--seed", venv.path], cwd: engineRoot, env: environment))
                progress = 0.32; state = .installing("Instalando motor neuronal…")
                guard let requirements = Bundle.main.resourceURL?.appendingPathComponent("engine-requirements.txt") else { throw NeuralEngineError.missingResource("dependencias") }
                append(try await Self.run(uv, ["pip", "install", "--python", python.path, "-r", requirements.path], cwd: engineRoot, env: environment))
                progress = 0.9; state = .installing("Comprobando Metal…")
                let probe = try await Self.run(python, ["-c", "import torch,torchaudio,librosa,transformers; assert torch.backends.mps.is_available(); print('MPS_READY', torch.__version__)"], cwd: sourceRoot, env: environment)
                append(probe); progress = 1; state = .ready(Self.backendLabel)
            } catch { state = .failed(error.localizedDescription); append(error.localizedDescription) }
        }
    }

    func convert(source: URL, reference: URL, checkpoint: URL?, quality: QualityProfile, semitones: Int, outputDirectory: URL) async throws -> URL {
        guard FileManager.default.isExecutableFile(atPath: python.path) else { throw NeuralEngineError.missingResource("motor profesional") }
        state = .running("Clonando timbre con red neuronal…"); progress = 0.1
        let job = outputDirectory.appendingPathComponent("job-\(UUID().uuidString)")
        try FileManager.default.createDirectory(at: job, withIntermediateDirectories: true)
        let steps = quality == .preview ? 10 : quality == .high ? 25 : quality == .studio ? 35 : 50
        do {
            var arguments = ["inference.py", "--source", source.path, "--target", reference.path, "--output", job.path, "--diffusion-steps", "\(steps)", "--f0-condition", "True", "--auto-f0-adjust", "False", "--semi-tone-shift", "\(semitones)", "--fp16", "False"]
            if let checkpoint {
                arguments += ["--checkpoint", checkpoint.path, "--config", sourceRoot.appendingPathComponent("configs/presets/config_dit_mel_seed_uvit_whisper_base_f0_44k.yml").path]
            }
            let output = try await Self.run(python, arguments, cwd: sourceRoot, env: environment)
            append(output); progress = 0.95
            let result = try FileManager.default.contentsOfDirectory(at: job, includingPropertiesForKeys: nil).first { $0.pathExtension.lowercased() == "wav" }
            guard let result else { throw NeuralEngineError.noOutput }
            let destination = outputDirectory.appendingPathComponent("VocalForge-\(UUID().uuidString.prefix(8)).wav")
            try FileManager.default.moveItem(at: result, to: destination)
            try? FileManager.default.removeItem(at: job)
            progress = 1; state = .ready(Self.backendLabel)
            return destination
        } catch { state = .failed(error.localizedDescription); throw error }
    }

    func train() {
        guard let datasetURL else { state = .failed("Selecciona las grabaciones"); return }
        guard consentConfirmed else { state = .failed(NeuralEngineError.consentRequired.localizedDescription); return }
        guard FileManager.default.isExecutableFile(atPath: python.path) else { state = .failed("Instala primero el motor profesional"); return }
        state = .running("Entrenando voz localmente…"); progress = 0.05
        let name = voiceName.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? "Voz" : voiceName
        let run = "vf_\(UUID().uuidString.replacingOccurrences(of: "-", with: ""))"
        let steps = HardwareAnalyzer.analyze().memoryGB <= 8 ? 300 : 500
        Task {
            do {
                let output = try await Self.run(python, ["train.py", "--config", "configs/presets/config_dit_mel_seed_uvit_whisper_base_f0_44k.yml", "--dataset-dir", datasetURL.path, "--run-name", run, "--batch-size", "1", "--max-steps", "\(steps)", "--save-every", "\(steps)", "--num-workers", "0"], cwd: sourceRoot, env: environment)
                append(output); progress = 0.9
                let checkpoint = try Self.findNewestCheckpoint(in: sourceRoot, run: run)
                let package = try makeVoicePackage(name: name, checkpoint: checkpoint)
                append("Modelo creado: \(package.lastPathComponent)")
                progress = 1; state = .ready("Entrenamiento completado · \(Self.backendLabel)")
            } catch { state = .failed(error.localizedDescription); append(error.localizedDescription) }
        }
    }

    private func makeVoicePackage(name: String, checkpoint: URL) throws -> URL {
        let id = UUID(), package = paths.voiceModels.appendingPathComponent("\(id.uuidString).vfvoice")
        try FileManager.default.createDirectory(at: package, withIntermediateDirectories: true)
        let weights = package.appendingPathComponent("weights.pth")
        try FileManager.default.copyItem(at: checkpoint, to: weights)
        let hash = SHA256.hash(data: try Data(contentsOf: weights)).map { String(format: "%02x", $0) }.joined()
        let manifest = VoiceModelManifest(id: id, formatVersion: 1, displayName: name, architecture: "Seed-VC DiT F0 44.1k", engineID: "seed-vc-mps", sampleRate: 44100, checksumSHA256: hash, createdAt: Date(), vocalRange: nil, consentConfirmed: true, sourceNotice: "Entrenada localmente con autorización confirmada")
        try JSONEncoder.vocalForge.encode(manifest).write(to: package.appendingPathComponent("manifest.json"), options: .atomic)
        return package
    }

    private func append(_ text: String) { log += (log.isEmpty ? "" : "\n") + text }
    private static var backendLabel: String { HardwareAnalyzer.analyze().memoryGB <= 8 ? "ARM64 memoria segura" : "Metal / PyTorch MPS" }
    private static func findNewestCheckpoint(in root: URL, run: String) throws -> URL {
        let e = FileManager.default.enumerator(at: root, includingPropertiesForKeys: [.contentModificationDateKey])
        let files = (e?.allObjects as? [URL] ?? []).filter { $0.pathExtension == "pth" && $0.path.contains(run) }
        func date(_ url: URL) -> Date { (try? url.resourceValues(forKeys: [.contentModificationDateKey]).contentModificationDate) ?? .distantPast }
        guard let file = files.max(by: { date($0) < date($1) }) else { throw NeuralEngineError.noCheckpoint }
        return file
    }

    nonisolated private static func run(_ executable: URL, _ arguments: [String], cwd: URL, env: [String: String]) async throws -> String {
        try await Task.detached(priority: .userInitiated) {
            let p = Process(), pipe = Pipe(); p.executableURL = executable; p.arguments = arguments; p.currentDirectoryURL = cwd; p.environment = env; p.standardOutput = pipe; p.standardError = pipe
            try p.run(); let data = pipe.fileHandleForReading.readDataToEndOfFile(); p.waitUntilExit()
            let text = String(data: data, encoding: .utf8) ?? ""
            guard p.terminationStatus == 0 else { throw NeuralEngineError.processFailed(text) }
            return text
        }.value
    }
}
