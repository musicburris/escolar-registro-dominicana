// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "VocalForgeStudio",
    platforms: [.macOS(.v14)],
    products: [.executable(name: "VocalForgeStudio", targets: ["VocalForgeStudio"])],
    targets: [
        .executableTarget(name: "VocalForgeStudio"),
        .testTarget(name: "VocalForgeStudioTests", dependencies: ["VocalForgeStudio"])
    ]
)
