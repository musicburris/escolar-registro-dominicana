import SwiftUI

@main
struct VocalForgeStudioApp: App {
    @StateObject private var store = StudioStore()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(store)
                .frame(minWidth: 1080, minHeight: 700)
        }
        .windowToolbarStyle(.unified)
        .commands {
            CommandGroup(replacing: .newItem) {
                Button("Nuevo proyecto") { store.createProject() }
                    .keyboardShortcut("n")
            }
            CommandMenu("Proyecto") {
                Button("Guardar") { store.save() }.keyboardShortcut("s")
                Button("Importar voz…") { store.importVoiceModel() }
            }
        }
        Settings { SettingsView().environmentObject(store) }
    }
}
