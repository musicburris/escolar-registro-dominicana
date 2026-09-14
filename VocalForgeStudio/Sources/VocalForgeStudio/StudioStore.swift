import AppKit
import Foundation
import UniformTypeIdentifiers

@MainActor
final class StudioStore: ObservableObject {
    @Published var section: StudioSection = .projects
    @Published var projects: [StudioProject] = []
    @Published var selectedProjectID: UUID?
    @Published var voices: [VoiceModelManifest] = []
    @Published var hardware = HardwareAnalyzer.analyze()
    @Published var alertMessage: String?
    @Published var isRendering = false
    @Published var storage = StorageSnapshot.empty

    let paths: StudioPaths
    let engines: [EngineDescriptor] = EngineRegistry.discover()
    private var saveTask: Task<Void, Never>?

    init(paths: StudioPaths = .live) {
        self.paths = paths
        try? paths.prepare()
        load()
        refreshStorage()
        if projects.isEmpty { createProject() }
    }

    var selectedIndex: Int? { projects.firstIndex { $0.id == selectedProjectID } }
    var selectedProject: StudioProject? { selectedIndex.map { projects[$0] } }

    func createProject() {
        let number = projects.count + 1
        let project = StudioProject(name: "Proyecto \(number)")
        projects.insert(project, at: 0)
        selectedProjectID = project.id
        section = .convert
        save()
    }

    func updateProject(_ mutate: (inout StudioProject) -> Void) {
        guard let index = selectedIndex else { return }
        mutate(&projects[index]); projects[index].modifiedAt = Date(); scheduleSave()
    }

    func chooseSource() { chooseAudio(isReference: false) }
    func chooseReference() { chooseAudio(isReference: true) }

    private func chooseAudio(isReference: Bool) {
        let panel = NSOpenPanel()
        panel.allowedContentTypes = [.audio, .wav, .mpeg4Audio, .mp3]
        panel.allowsMultipleSelection = false
        panel.message = isReference ? "Elige una referencia vocal limpia" : "Elige la voz cantada que deseas convertir"
        guard panel.runModal() == .OK, let url = panel.url else { return }
        do {
            let bookmark = try url.bookmarkData(options: .withSecurityScope,
                                                includingResourceValuesForKeys: nil,
                                                relativeTo: nil)
            updateProject {
                if isReference { $0.referenceBookmark = bookmark; $0.referenceFilename = url.lastPathComponent }
                else { $0.sourceBookmark = bookmark; $0.sourceFilename = url.lastPathComponent }
            }
        } catch { alertMessage = "No se pudo conservar acceso al archivo: \(error.localizedDescription)" }
    }

    func renderPreview() {
        guard !isRendering, let index = selectedIndex,
              let bookmark = projects[index].sourceBookmark else {
            alertMessage = "Primero selecciona una pista vocal."
            return
        }
        isRendering = true
        projects[index].status = "Preparando audio local…"
        let projectID = projects[index].id
        let quality = projects[index].quality
        let paths = paths
        Task {
            do {
                let input = try Self.resolve(bookmark)
                let output = paths.renders.appendingPathComponent("\(projectID.uuidString)-preview.wav")
                try await LocalPreviewEngine.render(input: input, output: output, quality: quality) { progress in
                    Task { @MainActor in
                        guard let i = self.projects.firstIndex(where: { $0.id == projectID }) else { return }
                        self.projects[i].progress = progress
                        self.projects[i].status = "Procesando por segmentos…"
                    }
                }
                if let i = projects.firstIndex(where: { $0.id == projectID }) {
                    projects[i].outputFilename = output.lastPathComponent
                    projects[i].status = "Preview local completado"
                    projects[i].progress = 1
                }
                save(); refreshStorage()
            } catch { alertMessage = error.localizedDescription }
            isRendering = false
        }
    }

    func renderNeural(using engine: NeuralEngineManager) {
        guard !isRendering, let index = selectedIndex,
              let sourceBookmark = projects[index].sourceBookmark,
              let referenceBookmark = projects[index].referenceBookmark else {
            alertMessage = "Selecciona la voz fuente y una referencia vocal."
            return
        }
        isRendering = true
        let projectID = projects[index].id
        let quality = projects[index].quality
        let semitones = Int(projects[index].transpose)
        projects[index].status = "Clonación neuronal en Metal…"
        Task {
            do {
                let source = try Self.resolve(sourceBookmark)
                let reference = try Self.resolve(referenceBookmark)
                let output = try await engine.convert(source: source, reference: reference, quality: quality, semitones: semitones, outputDirectory: paths.renders)
                if let i = projects.firstIndex(where: { $0.id == projectID }) {
                    projects[i].outputFilename = output.lastPathComponent
                    projects[i].status = "Clonación neuronal completada"
                    projects[i].progress = 1
                }
                save(); refreshStorage()
            } catch { alertMessage = error.localizedDescription; if let i = projects.firstIndex(where: { $0.id == projectID }) { projects[i].status = "La conversión falló; el proyecto está guardado" } }
            isRendering = false
        }
    }

    func revealOutput() {
        guard let name = selectedProject?.outputFilename else { return }
        NSWorkspace.shared.activateFileViewerSelecting([paths.renders.appendingPathComponent(name)])
    }

    func importVoiceModel() {
        let panel = NSOpenPanel(); panel.allowedContentTypes = [UTType(filenameExtension: "vfvoice") ?? .package]
        guard panel.runModal() == .OK, let url = panel.url else { return }
        do {
            let manifest = try VoicePackage.importPackage(from: url, into: paths.voiceModels)
            voices.removeAll { $0.id == manifest.id }; voices.append(manifest); saveVoices(); refreshStorage()
        } catch { alertMessage = "Modelo rechazado: \(error.localizedDescription)" }
    }

    func clearCache() {
        do { try FileManager.default.removeItem(at: paths.cache); try FileManager.default.createDirectory(at: paths.cache, withIntermediateDirectories: true); refreshStorage() }
        catch { alertMessage = error.localizedDescription }
    }

    func save() {
        do {
            let data = try JSONEncoder.vocalForge.encode(projects)
            try data.write(to: paths.projectsFile, options: .atomic)
            saveVoices()
        } catch { alertMessage = "No se pudo guardar: \(error.localizedDescription)" }
    }

    private func saveVoices() { if let data = try? JSONEncoder.vocalForge.encode(voices) { try? data.write(to: paths.voicesFile, options: .atomic) } }
    private func scheduleSave() { saveTask?.cancel(); saveTask = Task { try? await Task.sleep(for: .milliseconds(350)); if !Task.isCancelled { save() } } }
    private func load() {
        if let data = try? Data(contentsOf: paths.projectsFile), let value = try? JSONDecoder.vocalForge.decode([StudioProject].self, from: data) { projects = value; selectedProjectID = value.first?.id }
        if let data = try? Data(contentsOf: paths.voicesFile), let value = try? JSONDecoder.vocalForge.decode([VoiceModelManifest].self, from: data) { voices = value }
    }
    func refreshStorage() { storage = StorageScanner.snapshot(paths: paths) }
    static func resolve(_ bookmark: Data) throws -> URL {
        var stale = false
        let url = try URL(resolvingBookmarkData: bookmark, options: .withSecurityScope, relativeTo: nil, bookmarkDataIsStale: &stale)
        _ = url.startAccessingSecurityScopedResource(); return url
    }
}

extension JSONEncoder { static var vocalForge: JSONEncoder { let e = JSONEncoder(); e.outputFormatting = [.prettyPrinted, .sortedKeys]; e.dateEncodingStrategy = .iso8601; return e } }
extension JSONDecoder { static var vocalForge: JSONDecoder { let d = JSONDecoder(); d.dateDecodingStrategy = .iso8601; return d } }
