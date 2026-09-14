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
    private var ultraSourceRoot: URL { engineRoot.appendingPathComponent("soulx-singer") }
    private var ultraVenv: URL { engineRoot.appendingPathComponent("ultra-venv") }
    private var ultraPython: URL { ultraVenv.appendingPathComponent("bin/python") }
    private var versionFile: URL { engineRoot.appendingPathComponent("runtime-version.txt") }
    private static let requiredRuntimeVersion = "0.4.0"
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
        let installedVersion = try? String(contentsOf: versionFile, encoding: .utf8).trimmingCharacters(in: .whitespacesAndNewlines)
        state = FileManager.default.isExecutableFile(atPath: python.path) && installedVersion == Self.requiredRuntimeVersion ? .ready(Self.backendLabel) : .notInstalled
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
                guard let bundledUltra = Bundle.main.resourceURL?.appendingPathComponent("soulx-singer"), fm.fileExists(atPath: bundledUltra.path) else { throw NeuralEngineError.missingResource("SoulX Singer Ultra") }
                if fm.fileExists(atPath: sourceRoot.path) { try fm.removeItem(at: sourceRoot) }
                try fm.copyItem(at: bundledSource, to: sourceRoot)
                if fm.fileExists(atPath: ultraSourceRoot.path) { try fm.removeItem(at: ultraSourceRoot) }
                try fm.copyItem(at: bundledUltra, to: ultraSourceRoot)

                append(try await Self.run(uv, ["python", "install", "3.10.16"], cwd: engineRoot, env: environment))
                progress = 0.22; state = .installing("Creando runtime aislado…")
                append(try await Self.run(uv, ["venv", "--python", "3.10.16", "--seed", venv.path], cwd: engineRoot, env: environment))
                progress = 0.32; state = .installing("Instalando motor neuronal…")
                guard let requirements = Bundle.main.resourceURL?.appendingPathComponent("engine-requirements.txt") else { throw NeuralEngineError.missingResource("dependencias") }
                append(try await Self.run(uv, ["pip", "install", "--python", python.path, "-r", requirements.path], cwd: engineRoot, env: environment))
                progress = 0.9; state = .installing("Comprobando Metal…")
                let probe = try await Self.run(python, ["-c", "import torch,torchaudio,librosa,transformers,df; assert torch.backends.mps.is_available(); print('MPS_READY', torch.__version__, 'CLEANUP_READY')"], cwd: sourceRoot, env: environment)
                append(probe)
                progress = 0.55; state = .installing("Instalando SoulX Singer Ultra…")
                append(try await Self.run(uv, ["venv", "--python", "3.10.16", "--seed", ultraVenv.path], cwd: engineRoot, env: environment))
                guard let ultraRequirements = Bundle.main.resourceURL?.appendingPathComponent("soulx-macos-requirements.txt") else { throw NeuralEngineError.missingResource("dependencias SoulX") }
                append(try await Self.run(uv, ["pip", "install", "--python", ultraPython.path, "-r", ultraRequirements.path], cwd: engineRoot, env: environment))
                progress = 0.72; state = .installing("Descargando modelos Ultra verificados…")
                let hf = ultraVenv.appendingPathComponent("bin/hf")
                append(try await Self.run(hf, ["download", "Soul-AILab/SoulX-Singer", "--local-dir", ultraSourceRoot.appendingPathComponent("pretrained_models/SoulX-Singer").path], cwd: ultraSourceRoot, env: environment))
                append(try await Self.run(hf, ["download", "Soul-AILab/SoulX-Singer-Preprocess", "--local-dir", ultraSourceRoot.appendingPathComponent("pretrained_models/SoulX-Singer-Preprocess").path], cwd: ultraSourceRoot, env: environment))
                progress = 0.96; state = .installing("Validando SoulX en Apple Silicon…")
                append(try await Self.run(ultraPython, ["-c", "import torch; from soulxsinger.models.soulxsinger_svc import SoulXSingerSVC; print('SOULX_READY', 'mps' if torch.backends.mps.is_available() else 'cpu')"], cwd: ultraSourceRoot, env: environment))
                try Self.requiredRuntimeVersion.write(to: versionFile, atomically: true, encoding: .utf8)
                progress = 1; state = .ready(Self.backendLabel)
            } catch { state = .failed(error.localizedDescription); append(error.localizedDescription) }
        }
    }

    func convert(source: URL, reference: URL, checkpoint: URL?, engine: ConversionEngine, quality: QualityProfile, semitones: Int, cleanup: VocalCleanupProfile, outputDirectory: URL) async throws -> URL {
        guard FileManager.default.isExecutableFile(atPath: python.path) else { throw NeuralEngineError.missingResource("motor profesional") }
        let useUltra = engine == .soulXUltra || (engine == .automatic && (quality == .studio || quality == .ultra))
        if useUltra { return try await convertUltra(source: source, reference: reference, quality: quality, semitones: semitones, cleanup: cleanup, outputDirectory: outputDirectory) }
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
            let renderID = String(UUID().uuidString.prefix(8))
            let original = outputDirectory.appendingPathComponent("VocalForge-\(renderID)-original.wav")
            try FileManager.default.moveItem(at: result, to: original)
            var destination = original
            if cleanup != .off {
                state = .running("Limpiando ruido y ambiente con IA…"); progress = 0.96
                let cleanDirectory = job.appendingPathComponent("clean")
                try FileManager.default.createDirectory(at: cleanDirectory, withIntermediateDirectories: true)
                var cleanArguments = ["-m", "df.enhance", "--output-dir", cleanDirectory.path, "--no-suffix", "--atten-lim", cleanup == .natural ? "12" : "24", "--log-level", "INFO"]
                if cleanup == .deep { cleanArguments.append("--pf") }
                cleanArguments.append(original.path)
                append(try await Self.run(python, cleanArguments, cwd: sourceRoot, env: environment))
                let enhanced = cleanDirectory.appendingPathComponent(original.lastPathComponent)
                guard FileManager.default.fileExists(atPath: enhanced.path) else { throw NeuralEngineError.noOutput }
                destination = outputDirectory.appendingPathComponent("VocalForge-\(renderID)-clean.wav")
                try FileManager.default.moveItem(at: enhanced, to: destination)
            }
            try? FileManager.default.removeItem(at: job)
            progress = 1; state = .ready(Self.backendLabel)
            return destination
        } catch { state = .failed(error.localizedDescription); throw error }
    }

    private func convertUltra(source: URL, reference: URL, quality: QualityProfile, semitones: Int, cleanup: VocalCleanupProfile, outputDirectory: URL) async throws -> URL {
        guard FileManager.default.isExecutableFile(atPath: ultraPython.path) else { throw NeuralEngineError.missingResource("SoulX Singer Ultra") }
        state = .running("Generando interpretación con SoulX Ultra…"); progress = 0.08
        let job = outputDirectory.appendingPathComponent("ultra-\(UUID().uuidString)")
        try FileManager.default.createDirectory(at: job, withIntermediateDirectories: true)
        let steps = quality == .ultra ? 64 : 40
        do {
            append(try await Self.run(ultraPython, ["vocalforge_runner.py", "--source", source.path, "--reference", reference.path, "--output", job.path, "--steps", "\(steps)", "--cfg", "2.0", "--transpose", "\(semitones)"], cwd: ultraSourceRoot, env: environment))
            let generated = job.appendingPathComponent("generated/generated.wav")
            guard FileManager.default.fileExists(atPath: generated.path) else { throw NeuralEngineError.noOutput }
            let id = String(UUID().uuidString.prefix(8))
            let original = outputDirectory.appendingPathComponent("VocalForge-Ultra-\(id)-original.wav")
            try FileManager.default.moveItem(at: generated, to: original)
            var destination = original
            if cleanup != .off {
                state = .running("Finalizando voz limpia de estudio…"); progress = 0.96
                let clean = job.appendingPathComponent("clean")
                try FileManager.default.createDirectory(at: clean, withIntermediateDirectories: true)
                var args = ["-m", "df.enhance", "--output-dir", clean.path, "--no-suffix", "--atten-lim", cleanup == .natural ? "12" : "24", "--log-level", "INFO"]
                if cleanup == .deep { args.append("--pf") }; args.append(original.path)
                append(try await Self.run(python, args, cwd: sourceRoot, env: environment))
                let result = clean.appendingPathComponent(original.lastPathComponent)
                guard FileManager.default.fileExists(atPath: result.path) else { throw NeuralEngineError.noOutput }
                destination = outputDirectory.appendingPathComponent("VocalForge-Ultra-\(id)-clean.wav")
                try FileManager.default.moveItem(at: result, to: destination)
            }
            try? FileManager.default.removeItem(at: job)
            progress = 1; state = .ready("SoulX Ultra + Seed-VC · Apple Silicon")
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
        if let reference = Self.firstAudio(in: datasetURL) {
            try FileManager.default.copyItem(at: reference, to: package.appendingPathComponent("reference.\(reference.pathExtension.lowercased())"))
        }
        let hash = SHA256.hash(data: try Data(contentsOf: weights)).map { String(format: "%02x", $0) }.joined()
        let manifest = VoiceModelManifest(id: id, formatVersion: 2, displayName: name, architecture: "Seed-VC entrenada + referencia SoulX Ultra", engineID: "vocalforge-dual", sampleRate: 44100, checksumSHA256: hash, createdAt: Date(), vocalRange: nil, consentConfirmed: true, sourceNotice: "Entrenada localmente con autorización confirmada")
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
    private static func firstAudio(in folder: URL?) -> URL? {
        guard let folder, let e = FileManager.default.enumerator(at: folder, includingPropertiesForKeys: nil) else { return nil }
        let allowed = Set(["wav", "aif", "aiff", "flac", "mp3", "m4a"])
        return (e.allObjects as? [URL])?.first { allowed.contains($0.pathExtension.lowercased()) }
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
