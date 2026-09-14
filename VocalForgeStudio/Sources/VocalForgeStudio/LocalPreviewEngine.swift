import AVFoundation
import Accelerate
import Foundation

enum PreviewError: LocalizedError { case unsupportedAudio, cannotCreateBuffer
    var errorDescription: String? { switch self { case .unsupportedAudio: "El formato de audio no se pudo procesar"; case .cannotCreateBuffer: "No se pudo reservar el buffer de audio" } }
}

enum LocalPreviewEngine {
    static func render(input: URL, output: URL, quality: QualityProfile, progress: @escaping @Sendable (Double) -> Void) async throws {
        try await Task.detached(priority: .userInitiated) {
            let source = try AVAudioFile(forReading: input)
            let format = source.processingFormat
            guard format.commonFormat == .pcmFormatFloat32 else { throw PreviewError.unsupportedAudio }
            let writer = try AVAudioFile(forWriting: output, settings: format.settings, commonFormat: .pcmFormatFloat32, interleaved: false)
            let seconds: Double = quality == .ultra ? 4 : quality == .studio ? 8 : quality == .high ? 12 : 20
            let capacity = AVAudioFrameCount(max(2048, Int(format.sampleRate * seconds)))
            guard let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: capacity) else { throw PreviewError.cannotCreateBuffer }
            var processed: AVAudioFramePosition = 0
            while source.framePosition < source.length {
                try Task.checkCancellation()
                let count = AVAudioFrameCount(min(AVAudioFramePosition(capacity), source.length - source.framePosition))
                try source.read(into: buffer, frameCount: count)
                guard let channels = buffer.floatChannelData else { throw PreviewError.unsupportedAudio }
                let frames = vDSP_Length(buffer.frameLength)
                for channel in 0..<Int(format.channelCount) {
                    let samples = channels[channel]
                    var peak: Float = 0
                    vDSP_maxmgv(samples, 1, &peak, frames)
                    if peak > 0.0001 {
                        var gain = min(1.0, 0.92 / peak)
                        vDSP_vsmul(samples, 1, &gain, samples, 1, frames)
                        var drive: Float = quality == .preview ? 1.0 : 1.08
                        vDSP_vsmul(samples, 1, &drive, samples, 1, frames)
                        for i in 0..<Int(buffer.frameLength) { samples[i] = tanh(samples[i]) }
                    }
                }
                try writer.write(from: buffer)
                processed += AVAudioFramePosition(buffer.frameLength)
                progress(min(1, Double(processed) / Double(max(1, source.length))))
                if ProcessInfo.processInfo.thermalState == .critical { try await Task.sleep(for: .milliseconds(120)) }
                else if ProcessInfo.processInfo.thermalState == .serious { try await Task.sleep(for: .milliseconds(35)) }
            }
        }.value
    }
}
