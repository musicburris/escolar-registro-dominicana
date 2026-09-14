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
        project.quality = .ultra; project.lyricsLock = true; project.lyrics = "hola"
        let data = try JSONEncoder.vocalForge.encode(project)
        let decoded = try JSONDecoder.vocalForge.decode(StudioProject.self, from: data)
        XCTAssertEqual(decoded.id, project.id)
        XCTAssertEqual(decoded.name, project.name)
        XCTAssertEqual(decoded.quality, .ultra)
        XCTAssertTrue(decoded.lyricsLock)
        XCTAssertEqual(decoded.lyrics, "hola")
    }

    func testAllQualityModesRemainAvailable() {
        XCTAssertEqual(QualityProfile.allCases.map(\.rawValue), ["Preview", "High", "Studio", "Ultra"])
    }

    func testStorageScannerHandlesMissingDirectory() {
        let url = URL(fileURLWithPath: "/tmp/vocalforge-does-not-exist-\(UUID().uuidString)")
        XCTAssertEqual(StorageScanner.size(url), 0)
    }
}
