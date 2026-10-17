import AppKit
import CryptoKit

struct Part: Codable { let name: String; let size: Int64; let sha256: String }
struct Manifest: Codable { let filename: String; let size: Int64; let sha256: String; let parts: [Part] }
enum InstallError: LocalizedError {
    case message(String)
    var errorDescription: String? { if case .message(let value) = self { return value }; return nil }
}
final class Cancellation {
    private let lock = NSLock(); private var value = false
    func cancel() { lock.lock(); value = true; lock.unlock() }
    func reset() { lock.lock(); value = false; lock.unlock() }
    func requested() -> Bool { lock.lock(); defer { lock.unlock() }; return value }
}
func hex(_ value: SHA256.Digest) -> String { value.map { String(format: "%02x", $0) }.joined() }
func hashFile(_ url: URL) throws -> String {
    let input = try FileHandle(forReadingFrom: url); defer { try? input.close() }; var hash = SHA256()
    while let data = try input.read(upToCount: 4 * 1024 * 1024), !data.isEmpty { hash.update(data: data) }
    return hex(hash.finalize())
}
func loadManifest() throws -> Manifest {
    let url = URL(fileURLWithPath: CommandLine.arguments[0]).deletingLastPathComponent().deletingLastPathComponent().appendingPathComponent("Resources/manifest.json")
    return try JSONDecoder().decode(Manifest.self, from: Data(contentsOf: url))
}
func assemble(folder: URL, manifest: Manifest, output: URL, progress: (Double) -> Void, cancelled: () -> Bool) throws {
    let fm = FileManager.default
    guard !fm.fileExists(atPath: output.path) else { throw InstallError.message("Ya existe un archivo con ese nombre. Elija otra carpeta.") }
    guard !manifest.parts.isEmpty, manifest.parts.reduce(Int64(0), {$0 + $1.size}) == manifest.size else { throw InstallError.message("El manifiesto de instalación no es válido.") }
    let missing = manifest.parts.filter { !fm.fileExists(atPath: folder.appendingPathComponent($0.name).path) }
    guard missing.isEmpty else { throw InstallError.message("Faltan estas partes en la carpeta seleccionada:\n" + missing.map(\.name).joined(separator: "\n") + "\n\nDescárguelas en esa misma carpeta y vuelva a intentarlo.") }
    if let free = try? folder.resourceValues(forKeys: [.volumeAvailableCapacityForImportantUsageKey]).volumeAvailableCapacityForImportantUsage, free < manifest.size + 100 * 1024 * 1024 {
        throw InstallError.message("Necesita al menos 3,5 GB libres para preparar el instalador completo.")
    }
    let temporary = output.deletingLastPathComponent().appendingPathComponent(".aulalocal-" + UUID().uuidString + ".partial")
    guard fm.createFile(atPath: temporary.path, contents: nil) else { throw InstallError.message("No se puede guardar en esa carpeta. Seleccione una carpeta de su Mac.") }
    var complete = false
    defer { if !complete { try? fm.removeItem(at: temporary) } }
    let destination = try FileHandle(forWritingTo: temporary); defer { try? destination.close() }
    var totalHash = SHA256(); var totalSize: Int64 = 0
    for part in manifest.parts {
        guard !cancelled() else { throw InstallError.message("Preparación cancelada. Puede volver a intentarlo cuando lo desee.") }
        let source = folder.appendingPathComponent(part.name)
        let attributes = try fm.attributesOfItem(atPath: source.path)
        guard (attributes[.size] as? NSNumber)?.int64Value == part.size else { throw InstallError.message("La descarga de \(part.name) está incompleta. Descargue esa parte de nuevo.") }
        let input = try FileHandle(forReadingFrom: source); defer { try? input.close() }
        var partHash = SHA256(); var partSize: Int64 = 0
        while let data = try input.read(upToCount: 4 * 1024 * 1024), !data.isEmpty {
            guard !cancelled() else { throw InstallError.message("Preparación cancelada. Puede volver a intentarlo cuando lo desee.") }
            partHash.update(data: data); totalHash.update(data: data); partSize += Int64(data.count); totalSize += Int64(data.count)
            try destination.write(contentsOf: data); progress(Double(totalSize) / Double(manifest.size))
        }
        guard partSize == part.size, hex(partHash.finalize()) == part.sha256 else { throw InstallError.message("La parte \(part.name) está dañada. Descargue esa parte de nuevo.") }
    }
    guard totalSize == manifest.size, hex(totalHash.finalize()) == manifest.sha256 else { throw InstallError.message("La comprobación final no coincide. Vuelva a descargar las partes.") }
    guard !cancelled() else { throw InstallError.message("Preparación cancelada.") }
    try destination.synchronize(); try destination.close(); try fm.moveItem(at: temporary, to: output); complete = true
}
func selfTest() throws {
    let fm = FileManager.default; let folder = fm.temporaryDirectory.appendingPathComponent(UUID().uuidString)
    try fm.createDirectory(at: folder, withIntermediateDirectories: true); defer { try? fm.removeItem(at: folder) }
    var parts: [Part] = []; var all = Data()
    for i in 1...8 {
        let bytes = Data(repeating: UInt8(i), count: 131072); let name = "parte-\(i).bin"
        try bytes.write(to: folder.appendingPathComponent(name)); all.append(bytes)
        parts.append(Part(name: name, size: Int64(bytes.count), sha256: hex(SHA256.hash(data: bytes))))
    }
    let manifest = Manifest(filename: "prueba.dmg", size: Int64(all.count), sha256: hex(SHA256.hash(data: all)), parts: parts)
    let output = folder.appendingPathComponent("correcto.dmg")
    try assemble(folder: folder, manifest: manifest, output: output, progress: {_ in}, cancelled: {false})
    guard try hashFile(output) == manifest.sha256 else { throw InstallError.message("Prueba de integridad fallida") }
    let first = folder.appendingPathComponent(parts[0].name); try fm.removeItem(at: first)
    var rejectedMissing = false
    do { try assemble(folder: folder, manifest: manifest, output: folder.appendingPathComponent("falta.dmg"), progress: {_ in}, cancelled: {false}) } catch { rejectedMissing = true }
    try Data(repeating: 99, count: 131072).write(to: first)
    var rejectedCorrupt = false
    do { try assemble(folder: folder, manifest: manifest, output: folder.appendingPathComponent("corrupto.dmg"), progress: {_ in}, cancelled: {false}) } catch { rejectedCorrupt = true }
    try Data(repeating: 1, count: 131072).write(to: first)
    var rejectedCancel = false
    do { try assemble(folder: folder, manifest: manifest, output: folder.appendingPathComponent("cancelado.dmg"), progress: {_ in}, cancelled: {true}) } catch { rejectedCancel = true }
    let remaining = try fm.contentsOfDirectory(atPath: folder.path)
    guard rejectedMissing && rejectedCorrupt && rejectedCancel && !remaining.contains(where: {$0.hasSuffix(".partial")}) else { throw InstallError.message("Prueba de recuperación fallida") }
    print("{\"status\":\"ok\",\"tests\":4,\"architecture\":\"arm64\"}")
}
final class InstallerController: NSViewController, NSWindowDelegate {
    let start = NSButton(title: "Elegir carpeta y preparar instalación", target: nil, action: nil)
    let cancelButton = NSButton(title: "Cancelar", target: nil, action: nil)
    let status = NSTextField(wrappingLabelWithString: "1. Descargue las ocho partes en una misma carpeta.\n2. Pulse el botón y seleccione esa carpeta.\n3. Al terminar, arrastre AulaLocal a Aplicaciones.")
    let bar = NSProgressIndicator(); let cancellation = Cancellation(); var working = false
    override func loadView() {
        view = NSView(frame: NSRect(x: 0, y: 0, width: 650, height: 420))
        let title = NSTextField(labelWithString: "Preparar AulaLocal con IA")
        title.font = NSFont.boldSystemFont(ofSize: 25)
        let intro = NSTextField(wrappingLabelWithString: "Este asistente prepara la aplicación completa a partir de sus ocho partes. Comprueba cada archivo automáticamente. El proceso es completamente local.")
        intro.font = NSFont.systemFont(ofSize: 15); intro.textColor = .secondaryLabelColor
        status.font = NSFont.systemFont(ofSize: 15); status.setContentCompressionResistancePriority(.defaultLow, for: .horizontal)
        bar.style = .bar; bar.isIndeterminate = false; bar.minValue = 0; bar.maxValue = 100
        start.target = self; start.action = #selector(selectFolder); start.keyEquivalent = "\r"; start.bezelStyle = .rounded
        cancelButton.target = self; cancelButton.action = #selector(cancel); cancelButton.isEnabled = false; cancelButton.bezelStyle = .rounded
        let buttons = NSStackView(views: [start, cancelButton]); buttons.spacing = 12
        let stack = NSStackView(views: [title, intro, NSBox(), status, bar, buttons]); stack.orientation = .vertical; stack.alignment = .leading; stack.spacing = 20
        stack.translatesAutoresizingMaskIntoConstraints = false; view.addSubview(stack)
        NSLayoutConstraint.activate([stack.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 30), stack.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -30), stack.topAnchor.constraint(equalTo: view.topAnchor, constant: 30), bar.widthAnchor.constraint(equalTo: stack.widthAnchor), status.widthAnchor.constraint(equalTo: stack.widthAnchor), intro.widthAnchor.constraint(equalTo: stack.widthAnchor)])
    }
    @objc func selectFolder() {
        guard let window = view.window else { return }
        let picker = NSOpenPanel(); picker.canChooseFiles = false; picker.canChooseDirectories = true; picker.allowsMultipleSelection = false
        picker.message = "Seleccione la carpeta donde guardó las ocho partes de AulaLocal."; picker.prompt = "Usar esta carpeta"
        picker.directoryURL = FileManager.default.urls(for: .downloadsDirectory, in: .userDomainMask).first
        picker.beginSheetModal(for: window) { response in if response == .OK, let folder = picker.url { self.prepare(folder) } }
    }
    @objc func cancel() { cancellation.cancel(); status.stringValue = "Cancelando de forma segura…" }
    func prepare(_ folder: URL) {
        working = true; cancellation.reset(); start.isEnabled = false; cancelButton.isEnabled = true; bar.doubleValue = 0; status.stringValue = "Comprobando las partes y preparando el instalador completo…"
        DispatchQueue.global(qos: .userInitiated).async {
            do {
                let manifest = try loadManifest(); var output = folder.appendingPathComponent(manifest.filename)
                if FileManager.default.fileExists(atPath: output.path) { output = folder.appendingPathComponent("AulaLocal-completa-" + String(UUID().uuidString.prefix(6)) + ".dmg") }
                try assemble(folder: folder, manifest: manifest, output: output, progress: { value in DispatchQueue.main.async { self.bar.doubleValue = value * 100 } }, cancelled: { self.cancellation.requested() })
                DispatchQueue.main.async {
                    self.working = false; self.start.isEnabled = true; self.cancelButton.isEnabled = false; self.bar.doubleValue = 100
                    self.status.stringValue = "¡Instalador completo verificado!\nSe abrirá la ventana de instalación. Arrastre AulaLocal a Aplicaciones y ábrala desde allí."
                    if !NSWorkspace.shared.open(output) { self.status.stringValue += "\nAbra el archivo DMG que se guardó en la carpeta seleccionada." }
                }
            } catch {
                let text = error.localizedDescription
                DispatchQueue.main.async { self.working = false; self.start.isEnabled = true; self.cancelButton.isEnabled = false; self.status.stringValue = text }
            }
        }
    }
    func windowShouldClose(_ sender: NSWindow) -> Bool { if working { cancellation.cancel(); return false }; return true }
}
final class AppDelegate: NSObject, NSApplicationDelegate {
    var window: NSWindow!; var controller: InstallerController!
    func applicationDidFinishLaunching(_ notification: Notification) {
        controller = InstallerController(); window = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 650, height: 420), styleMask: [.titled, .closable, .miniaturizable], backing: .buffered, defer: false)
        window.title = "Instalación de AulaLocal"; window.contentViewController = controller; window.delegate = controller; window.center(); window.makeKeyAndOrderFront(nil); NSApp.activate(ignoringOtherApps: true)
        let menu = NSMenu(); let item = NSMenuItem(); menu.addItem(item); let appMenu = NSMenu(); item.submenu = appMenu
        appMenu.addItem(withTitle: "Cerrar asistente", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q"); NSApp.mainMenu = menu
    }
    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { true }
    func applicationShouldTerminate(_ sender: NSApplication) -> NSApplication.TerminateReply { if controller?.working == true { controller.cancellation.cancel(); return .terminateCancel }; return .terminateNow }
}
do {
    if CommandLine.arguments.contains("--self-test") { try selfTest(); exit(0) }
    if CommandLine.arguments.count == 4 && CommandLine.arguments[1] == "--verify-parts" {
        let manifest = try loadManifest(); let output = URL(fileURLWithPath: CommandLine.arguments[3])
        try assemble(folder: URL(fileURLWithPath: CommandLine.arguments[2]), manifest: manifest, output: output, progress: {_ in}, cancelled: {false})
        guard try hashFile(output) == manifest.sha256 else { throw InstallError.message("Integridad final incorrecta") }
        print("{\"status\":\"ok\",\"real_dmg_sha256\":\"\(manifest.sha256)\"}"); exit(0)
    }
    let app = NSApplication.shared; let delegate = AppDelegate(); app.setActivationPolicy(.regular); app.delegate = delegate; app.run()
} catch { fputs(error.localizedDescription + "\n", stderr); exit(1) }
