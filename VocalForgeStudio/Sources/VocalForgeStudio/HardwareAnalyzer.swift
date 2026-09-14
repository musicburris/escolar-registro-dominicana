import Foundation
import Metal

enum HardwareAnalyzer {
    static func analyze() -> HardwareProfile {
        let bytes = ProcessInfo.processInfo.physicalMemory
        let gb = max(1, Int((Double(bytes) / 1_073_741_824).rounded()))
        let chip = sysctlString("machdep.cpu.brand_string") ?? "Apple Silicon"
        let metal = MTLCreateSystemDefaultDevice() != nil
        if gb <= 8 {
            return .init(chip: chip, memoryGB: gb, metalAvailable: metal, tier: .optimized,
                         recommendedChunkSeconds: 8, maxConcurrentJobs: 1,
                         trainingDescription: "Optimizado por segmentos y checkpoints")
        } else if gb < 32 {
            return .init(chip: chip, memoryGB: gb, metalAvailable: metal, tier: .performance,
                         recommendedChunkSeconds: 18, maxConcurrentJobs: 1,
                         trainingDescription: "Fine-tuning local acelerado")
        } else {
            return .init(chip: chip, memoryGB: gb, metalAvailable: metal, tier: .extreme,
                         recommendedChunkSeconds: 32, maxConcurrentJobs: 2,
                         trainingDescription: "Entrenamiento local de alta capacidad")
        }
    }

    static var thermalLabel: String {
        switch ProcessInfo.processInfo.thermalState {
        case .nominal: "Normal"
        case .fair: "Moderado"
        case .serious: "Alto — reduciendo concurrencia"
        case .critical: "Crítico — protegiendo el render"
        @unknown default: "Desconocido"
        }
    }

    private static func sysctlString(_ key: String) -> String? {
        var size = 0
        guard sysctlbyname(key, nil, &size, nil, 0) == 0, size > 0 else { return nil }
        var chars = [CChar](repeating: 0, count: size)
        guard sysctlbyname(key, &chars, &size, nil, 0) == 0 else { return nil }
        return String(cString: chars).trimmingCharacters(in: .whitespacesAndNewlines)
    }
}
