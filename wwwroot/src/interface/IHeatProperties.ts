
export interface IHeatProperties {
    temperature: number; // Base "heat" of the tile (0..1)
    radius?: number; // Optional override for glow radius
    intensity?: number; // Multiplier for alpha/strength
    flickerSpeed?: number; // How fast the glow flickers
    decay?: number; // How fast heat fades (per second)
}
