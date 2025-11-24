export interface MountainPoint {
  x: number
  y: number
  baseY: number
  peakY: number
  color: number
}

export interface MountainColorVariations {
  lightFace: number
  midFace: number
  darkFace: number
  topFace: number
}

export interface ExcludeZone {
  centerX: number
  width: number
}

export interface MountainRangeOptions {
  excludeZone?: ExcludeZone
  baseColor?: number
}

export interface MountainLayerConfig {
  baseY: number
  points: number
  variation: number
  peakHeight: number
  options?: MountainRangeOptions
}

