import AppKit
import SwiftUI

struct RootView: View {
    @EnvironmentObject var store: StudioStore
    var body: some View {
        NavigationSplitView {
            List(StudioSection.allCases, selection: $store.section) { item in
                Label(item.rawValue, systemImage: item.symbol).tag(item)
            }
            .navigationTitle("VocalForge")
            .safeAreaInset(edge: .bottom) {
                VStack(alignment: .leading, spacing: 3) {
                    Text("APPLE SILICON").font(.caption2.bold()).foregroundStyle(.secondary)
                    Text("Todo permanece en este Mac").font(.caption).foregroundStyle(.secondary)
                }.padding()
            }
        } detail: {
            Group {
                switch store.section {
                case .projects: ProjectsView()
                case .convert: ConversionView()
                case .train: TrainingView()
                case .models: ModelsView()
                case .storage: StorageView()
                case .hardware: HardwareView()
                }
            }.background(Color(nsColor: .windowBackgroundColor))
        }
        .alert("VocalForge Studio", isPresented: Binding(get: { store.alertMessage != nil }, set: { if !$0 { store.alertMessage = nil } })) {
            Button("Aceptar", role: .cancel) { store.alertMessage = nil }
        } message: { Text(store.alertMessage ?? "") }
    }
}

struct PageHeader: View {
    let title: String, subtitle: String
    var body: some View { VStack(alignment: .leading, spacing: 5) { Text(title).font(.largeTitle.bold()); Text(subtitle).font(.title3).foregroundStyle(.secondary) }.frame(maxWidth: .infinity, alignment: .leading) }
}

struct ProjectsView: View {
    @EnvironmentObject var store: StudioStore
    var body: some View {
        VStack(alignment: .leading, spacing: 22) {
            HStack { PageHeader(title: "Proyectos", subtitle: "Sesiones locales con guardado automático"); Button("Nuevo proyecto", systemImage: "plus") { store.createProject() }.buttonStyle(.borderedProminent) }
            if store.projects.isEmpty { ContentUnavailableView("Sin proyectos", systemImage: "waveform", description: Text("Crea el primero para comenzar.")) }
            else {
                List(store.projects, selection: $store.selectedProjectID) { project in
                    HStack(spacing: 14) {
                        Image(systemName: "waveform.circle.fill").font(.title).foregroundStyle(.purple)
                        VStack(alignment: .leading) { Text(project.name).font(.headline); Text(project.status).foregroundStyle(.secondary) }
                        Spacer(); Text(project.modifiedAt, style: .relative).foregroundStyle(.secondary)
                    }.padding(.vertical, 7).tag(project.id)
                }.clipShape(RoundedRectangle(cornerRadius: 12))
            }
        }.padding(30)
    }
}

struct ConversionView: View {
    @EnvironmentObject var store: StudioStore
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 22) {
                PageHeader(title: "Convertir voz", subtitle: "Flujo de producción local, estable y recuperable")
                if let project = store.selectedProject {
                    HStack(spacing: 18) {
                        FileWell(title: "Voz fuente", filename: project.sourceFilename, icon: "waveform", action: store.chooseSource)
                        FileWell(title: "Referencia de timbre", filename: project.referenceFilename, icon: "person.wave.2", action: store.chooseReference)
                    }
                    GroupBox("Configuración automática") {
                        VStack(alignment: .leading, spacing: 16) {
                            HStack { Text("Calidad"); Spacer(); Picker("", selection: qualityBinding) { ForEach(QualityProfile.allCases) { Text($0.rawValue).tag($0) } }.pickerStyle(.segmented).frame(width: 440) }
                            Text(project.quality.detail).foregroundStyle(.secondary)
                            Toggle("Lyrics Lock — conservar pronunciación y texto", isOn: lyricsLockBinding)
                            TextEditor(text: lyricsBinding).font(.body.monospaced()).frame(minHeight: 92).overlay(RoundedRectangle(cornerRadius: 6).stroke(.quaternary))
                            HStack { Text("Transposición"); Slider(value: transposeBinding, in: -12...12, step: 1); Text("\(Int(project.transpose)) st").monospacedDigit().frame(width: 50) }
                        }.padding(8)
                    }
                    HStack {
                        VStack(alignment: .leading, spacing: 6) { Text(project.status).font(.headline); ProgressView(value: project.progress).frame(width: 360) }
                        Spacer()
                        if project.outputFilename != nil { Button("Mostrar resultado", systemImage: "folder") { store.revealOutput() } }
                        Button(store.isRendering ? "Procesando…" : "Crear preview local", systemImage: "play.fill") { store.renderPreview() }.buttonStyle(.borderedProminent).disabled(store.isRendering)
                    }
                    Label("El preview incluido procesa audio realmente por chunks con AVFoundation/Accelerate, pero no se presenta como clonación de timbre. El módulo SVC profesional aparece separado hasta superar validación acústica.", systemImage: "checkmark.shield").font(.callout).foregroundStyle(.secondary)
                } else { ContentUnavailableView("Selecciona un proyecto", systemImage: "rectangle.stack") }
            }.padding(30)
        }
    }
    private var qualityBinding: Binding<QualityProfile> { .init(get: { store.selectedProject?.quality ?? .high }, set: { v in store.updateProject { $0.quality = v } }) }
    private var lyricsLockBinding: Binding<Bool> { .init(get: { store.selectedProject?.lyricsLock ?? true }, set: { v in store.updateProject { $0.lyricsLock = v } }) }
    private var lyricsBinding: Binding<String> { .init(get: { store.selectedProject?.lyrics ?? "" }, set: { v in store.updateProject { $0.lyrics = v } }) }
    private var transposeBinding: Binding<Double> { .init(get: { store.selectedProject?.transpose ?? 0 }, set: { v in store.updateProject { $0.transpose = v } }) }
}

struct FileWell: View {
    let title: String, filename: String?, icon: String, action: () -> Void
    var body: some View { Button(action: action) { VStack(spacing: 12) { Image(systemName: filename == nil ? "arrow.down.doc" : icon).font(.system(size: 34)).foregroundStyle(.purple); Text(title).font(.headline); Text(filename ?? "Seleccionar audio…").lineLimit(1).foregroundStyle(filename == nil ? .secondary : .primary) }.frame(maxWidth: .infinity, minHeight: 135).contentShape(Rectangle()) }.buttonStyle(.plain).background(.background.secondary, in: RoundedRectangle(cornerRadius: 14)).overlay(RoundedRectangle(cornerRadius: 14).stroke(style: StrokeStyle(lineWidth: 1, dash: [6])).foregroundStyle(.quaternary)) }
}

struct TrainingView: View {
    @EnvironmentObject var store: StudioStore
    var body: some View {
        VStack(alignment: .leading, spacing: 24) {
            PageHeader(title: "Entrenar voz", subtitle: "Fine-tuning local con consentimiento documentado")
            GroupBox("Preparación del dataset") {
                VStack(alignment: .leading, spacing: 14) {
                    Label("Grabaciones limpias, una sola voz y sin efectos", systemImage: "1.circle.fill")
                    Label("Análisis de clipping, ruido, silencio y rango vocal", systemImage: "2.circle.fill")
                    Label("Segmentación y checkpoints adaptados a \(store.hardware.memoryGB) GB", systemImage: "3.circle.fill")
                    Divider()
                    Label("El entrenamiento neuronal permanece bloqueado en esta build hasta integrar y validar el runtime MLX SVC. No se simula entrenamiento.", systemImage: "lock.shield").foregroundStyle(.orange)
                }.padding(10)
            }
            Spacer()
        }.padding(30)
    }
}

struct ModelsView: View {
    @EnvironmentObject var store: StudioStore
    var body: some View {
        VStack(alignment: .leading, spacing: 22) {
            HStack { PageHeader(title: "Voces", subtitle: "Paquetes verificables .vfvoice"); Button("Importar .vfvoice", systemImage: "square.and.arrow.down") { store.importVoiceModel() } }
            if store.voices.isEmpty { ContentUnavailableView("Aún no hay voces", systemImage: "person.wave.2", description: Text("Los modelos originales nunca se eliminan al optimizarlos.")) }
            else { List(store.voices) { voice in HStack { Image(systemName: "person.wave.2.fill").foregroundStyle(.purple); VStack(alignment: .leading) { Text(voice.displayName).font(.headline); Text("\(voice.architecture) · \(voice.sampleRate) Hz").foregroundStyle(.secondary) }; Spacer(); Label("Verificado", systemImage: "checkmark.seal.fill").foregroundStyle(.green) }.padding(.vertical, 5) } }
        }.padding(30)
    }
}

struct HardwareView: View {
    @EnvironmentObject var store: StudioStore
    var body: some View {
        VStack(alignment: .leading, spacing: 24) {
            PageHeader(title: "VocalForge Hardware Analysis", subtitle: "Perfil elegido automáticamente")
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 15) {
                MetricCard(label: "Chip", value: store.hardware.chip, symbol: "cpu")
                MetricCard(label: "Memoria unificada", value: "\(store.hardware.memoryGB) GB", symbol: "memorychip")
                MetricCard(label: "Metal", value: store.hardware.metalAvailable ? "Disponible" : "No disponible", symbol: "sparkles")
                MetricCard(label: "Perfil", value: store.hardware.tier.rawValue, symbol: "gauge.with.dots.needle.67percent")
                MetricCard(label: "Estado térmico", value: HardwareAnalyzer.thermalLabel, symbol: "thermometer.medium")
                MetricCard(label: "Entrenamiento", value: store.hardware.trainingDescription, symbol: "brain")
            }
            Text("Ultra permanece disponible. En equipos con poca memoria se ejecuta por segmentos pequeños, secuencialmente y con pausas térmicas.").foregroundStyle(.secondary)
            Spacer()
        }.padding(30)
    }
}

struct MetricCard: View { let label, value, symbol: String
    var body: some View { HStack(spacing: 14) { Image(systemName: symbol).font(.title).foregroundStyle(.purple).frame(width: 38); VStack(alignment: .leading) { Text(label).font(.caption).foregroundStyle(.secondary); Text(value).font(.headline).lineLimit(2) }; Spacer() }.padding(18).frame(maxWidth: .infinity, minHeight: 82).background(.background.secondary, in: RoundedRectangle(cornerRadius: 12)) }
}

struct StorageView: View {
    @EnvironmentObject var store: StudioStore
    var body: some View {
        VStack(alignment: .leading, spacing: 22) {
            PageHeader(title: "Almacenamiento", subtitle: "Control local y seguro del espacio")
            ForEach(rows, id: \.0) { row in HStack { Label(row.0, systemImage: row.2); Spacer(); Text(ByteCountFormatter.string(fromByteCount: row.1, countStyle: .file)).monospacedDigit() }.font(.title3).padding(.vertical, 6); Divider() }
            HStack { Button("Actualizar", systemImage: "arrow.clockwise") { store.refreshStorage() }; Spacer(); Button("Limpiar caché", systemImage: "trash", role: .destructive) { store.clearCache() } }
            Label("Voces y proyectos nunca se borran con Limpiar caché.", systemImage: "lock.fill").foregroundStyle(.secondary)
            Spacer()
        }.padding(30)
    }
    private var rows: [(String, Int64, String)] { [("Aplicación", store.storage.application, "app"), ("Modelos de IA", store.storage.aiModels, "brain"), ("Voces", store.storage.voiceModels, "person.wave.2"), ("Proyectos", store.storage.projects, "rectangle.stack"), ("Caché", store.storage.cache, "archivebox"), ("Renders", store.storage.renders, "waveform")] }
}

struct SettingsView: View {
    @EnvironmentObject var store: StudioStore
    var body: some View { Form { Section("Privacidad") { LabeledContent("Procesamiento", value: "100 % local"); LabeledContent("Telemetría", value: "Desactivada") }; Section("Motores") { ForEach(store.engines) { engine in LabeledContent(engine.name, value: engine.backend) } } }.formStyle(.grouped).frame(width: 560, height: 370) }
}
