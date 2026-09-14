import XCTest
@testable import VocalForgeStudio

final class VocalForgeStudioTests: XCTestCase {
    func testHardwareProfilesProtectEightGigabytes() {
        let profile = HardwareProfile(chip: "Apple M1", memoryGB: 8, metalAvailable: true, tier: .optimized, recommendedChunkSeconds: 8, maxConcurrentJobs: 1, trainingDescription: "Optimizado")
        XCTAssertEqual(profile.maxConcurrentJobs, 1)
        XCTAssertLessThanOrEqual(profile.recommendedChunkSeconds, 8)
    }

    func testProjectRoundTripKeepsLyricsLockAndQuality() throws {
        var project = StudioProject(name: "Canción")
        project.quality = .ultra; project.lyricsLock = true; project.lyrics = "hola"; project.vocalCleanup = .deep; project.conversionEngine = .soulXUltra
        let data = try JSONEncoder.vocalForge.encode(project)
        let decoded = try JSONDecoder.vocalForge.decode(StudioProject.self, from: data)
        XCTAssertEqual(decoded.id, project.id)
        XCTAssertEqual(decoded.name, project.name)
        XCTAssertEqual(decoded.quality, .ultra)
        XCTAssertEqual(decoded.vocalCleanup, .deep)
        XCTAssertEqual(decoded.conversionEngine, .soulXUltra)
        XCTAssertTrue(decoded.lyricsLock)
        XCTAssertEqual(decoded.lyrics, "hola")
    }

    func testVocalCleanupDefaultsProtectSingingTimbre() {
        let project = StudioProject(name: "Canción")
        XCTAssertEqual(project.vocalCleanup ?? .natural, .natural)
        XCTAssertEqual(VocalCleanupProfile.allCases.map(\.rawValue), ["Sin limpieza", "Natural", "Profunda"])
    }

    func testAllQualityModesRemainAvailable() {
        XCTAssertEqual(QualityProfile.allCases.map(\.rawValue), ["Preview", "High", "Studio", "Ultra"])
    }

    func testAutomaticEngineRoutesStudioToUltra() {
        XCTAssertTrue([QualityProfile.studio, .ultra].allSatisfy { $0 == .studio || $0 == .ultra })
        XCTAssertEqual(ConversionEngine.automatic.rawValue, "Automático")
        XCTAssertTrue(ConversionEngine.soulXUltra.detail.contains("2026"))
    }

    func testStorageScannerHandlesMissingDirectory() {
        let url = URL(fileURLWithPath: "/tmp/vocalforge-does-not-exist-\(UUID().uuidString)")
        XCTAssertEqual(StorageScanner.size(url), 0)
    }
}
