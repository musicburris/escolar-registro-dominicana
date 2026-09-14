import Foundation
import CryptoKit

struct StudioPaths {
    let root: URL
    var projectsFile: URL { root.appendingPathComponent("projects.json") }
    var voicesFile: URL { root.appendingPathComponent("voices.json") }
    var projects: URL { root.appendingPathComponent("Projects") }
    var voiceModels: URL { root.appendingPathComponent("Voice Models") }
    var aiModels: URL { root.appendingPathComponent("AI Models") }
    var cache: URL { root.appendingPathComponent("Cache") }
    var renders: URL { root.appendingPathComponent("Renders") }
    var recovery: URL { root.appendingPathComponent("Recovery") }
    func prepare() throws { for url in [root, projects, voiceModels, aiModels, cache, renders, recovery] { try FileManager.default.createDirectory(at: url, withIntermediateDirectories: true) } }
    static var live: StudioPaths {
        let base = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first!
        return StudioPaths(root: base.appendingPathComponent("VocalForge Studio", isDirectory: true))
    }
}

struct StorageSnapshot {
    var application, aiModels, voiceModels, projects, cache, renders: Int64
    static let empty = StorageSnapshot(application: 0, aiModels: 0, voiceModels: 0, projects: 0, cache: 0, renders: 0)
}

enum StorageScanner {
    static func snapshot(paths: StudioPaths) -> StorageSnapshot {
        .init(application: bundleSize(), aiModels: size(paths.aiModels), voiceModels: size(paths.voiceModels), projects: size(paths.projects), cache: size(paths.cache), renders: size(paths.renders))
    }
    static func size(_ url: URL) -> Int64 {
        let keys: Set<URLResourceKey> = [.isRegularFileKey, .fileSizeKey]
        guard let files = FileManager.default.enumerator(at: url, includingPropertiesForKeys: Array(keys)) else { return 0 }
        return files.compactMap { item -> URLResourceValues? in
            guard let url = item as? URL else { return nil }
            return try? url.resourceValues(forKeys: keys)
        }.filter { $0.isRegularFile == true }.reduce(0) { $0 + Int64($1.fileSize ?? 0) }
    }
    static func bundleSize() -> Int64 { size(Bundle.main.bundleURL) }
}

enum VoicePackageError: LocalizedError { case missingManifest, invalidFormat, checksumMismatch, consentMissing
    var errorDescription: String? { switch self { case .missingManifest: "Falta manifest.json"; case .invalidFormat: "Formato .vfvoice incompatible"; case .checksumMismatch: "El checksum no coincide"; case .consentMissing: "Falta confirmación de consentimiento y derechos" } }
}

enum VoicePackage {
    static func importPackage(from source: URL, into folder: URL) throws -> VoiceModelManifest {
        let manifestURL = source.appendingPathComponent("manifest.json")
        guard let data = try? Data(contentsOf: manifestURL), let manifest = try? JSONDecoder.vocalForge.decode(VoiceModelManifest.self, from: data) else { throw VoicePackageError.missingManifest }
        guard manifest.formatVersion == 1 else { throw VoicePackageError.invalidFormat }
        guard manifest.consentConfirmed else { throw VoicePackageError.consentMissing }
        let weights = source.appendingPathComponent("weights.safetensors")
        let digest = SHA256.hash(data: try Data(contentsOf: weights)).map { String(format: "%02x", $0) }.joined()
        guard digest == manifest.checksumSHA256.lowercased() else { throw VoicePackageError.checksumMismatch }
        let destination = folder.appendingPathComponent("\(manifest.id.uuidString).vfvoice")
        if FileManager.default.fileExists(atPath: destination.path) { try FileManager.default.removeItem(at: destination) }
        try FileManager.default.copyItem(at: source, to: destination)
        return manifest
    }
}

enum EngineRegistry {
    static func discover() -> [EngineDescriptor] {
        [
            .init(id: "native-preview", name: "VocalForge Native Preview", backend: "AVFoundation + Accelerate", purpose: "Audio local por chunks; no clona timbre", state: .ready),
            .init(id: "mlx-svc", name: "VocalForge MLX SVC", backend: "MLX / Metal", purpose: "Motor profesional en validación acústica", state: .optional),
            .init(id: "seed-vc", name: "Seed-VC Compatibility", backend: "PyTorch MPS", purpose: "Compatibilidad experimental GPL-3.0", state: .unavailable("No se distribuye integrado: repositorio archivado"))
        ]
    }
}
