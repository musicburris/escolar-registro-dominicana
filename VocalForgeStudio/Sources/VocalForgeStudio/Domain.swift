import Foundation

enum QualityProfile: String, Codable, CaseIterable, Identifiable {
    case preview = "Preview", high = "High", studio = "Studio", ultra = "Ultra"
    var id: String { rawValue }
    var detail: String {
        switch self {
        case .preview: "Edición rápida y comprobación local"
        case .high: "Conversión equilibrada para producción"
        case .studio: "Máxima fidelidad práctica"
        case .ultra: "Calidad prioritaria, procesamiento secuencial"
        }
    }
}

struct StudioProject: Codable, Identifiable, Equatable {
    var id = UUID()
    var name: String
    var createdAt = Date()
    var modifiedAt = Date()
    var sourceBookmark: Data?
    var sourceFilename: String?
    var referenceBookmark: Data?
    var referenceFilename: String?
    var voiceModelID: UUID?
    var quality: QualityProfile = .high
    var lyrics = ""
    var lyricsLock = true
    var transpose = 0.0
    var outputFilename: String?
    var progress = 0.0
    var status = "Listo"
}

struct VoiceModelManifest: Codable, Identifiable, Equatable {
    var id: UUID
    var formatVersion: Int
    var displayName: String
    var architecture: String
    var engineID: String
    var sampleRate: Int
    var checksumSHA256: String
    var createdAt: Date
    var vocalRange: String?
    var consentConfirmed: Bool
    var sourceNotice: String
}

struct HardwareProfile: Equatable {
    enum Tier: String { case optimized = "Optimized", performance = "Performance", extreme = "Extreme" }
    var chip: String
    var memoryGB: Int
    var metalAvailable: Bool
    var tier: Tier
    var recommendedChunkSeconds: Double
    var maxConcurrentJobs: Int
    var trainingDescription: String
}

struct EngineDescriptor: Identifiable, Equatable {
    enum State: Equatable { case ready, optional, unavailable(String) }
    var id: String
    var name: String
    var backend: String
    var purpose: String
    var state: State
}

enum StudioSection: String, CaseIterable, Identifiable {
    case projects = "Proyectos", convert = "Convertir", train = "Entrenar voz"
    case models = "Voces", storage = "Almacenamiento", hardware = "Este Mac"
    var id: String { rawValue }
    var symbol: String {
        switch self {
        case .projects: "rectangle.stack"
        case .convert: "waveform.badge.mic"
        case .train: "brain.head.profile"
        case .models: "person.wave.2"
        case .storage: "internaldrive"
        case .hardware: "cpu"
        }
    }
}
