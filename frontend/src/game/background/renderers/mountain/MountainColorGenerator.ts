import type { MountainColorVariations } from './MountainTypes'

export class MountainColorGenerator {
  /**
   * Paleta de colores vibrantes variados para las montañas
   */
  static readonly COLOR_PALETTE = [
    0x8A6BA8, 0x9A7BB8, 0x6A9BCC, 0x7AABDC, 0x4A9CBC, 
    0x5AAC8C, 0x6ABC9C, 0x4A9C7C, 0x3A8C6C, 0x7A8BAC,
    0x8A7BAC, 0x5AACAC, 0x4A9C9C, 0x9A6BA8, 0x5A8BBC
  ]

  /**
   * Genera variaciones de color para las diferentes caras 3D de la montaña
   */
  static getMountainColorVariations(baseColor: number): MountainColorVariations {
    // Extraer componentes RGB
    const r = (baseColor >> 16) & 0xFF
    const g = (baseColor >> 8) & 0xFF
    const b = baseColor & 0xFF
    
    // Funciones auxiliares
    const darken = (component: number, factor: number) => Math.max(0, Math.floor(component * factor))
    const lighten = (component: number, factor: number) => Math.min(255, Math.floor(component + (255 - component) * factor))
    
    // Cara iluminada (frontal) - 110% del color original
    const lightR = lighten(r, 0.15)
    const lightG = lighten(g, 0.12)
    const lightB = lighten(b, 0.1)
    const lightFace = (lightR << 16) | (lightG << 8) | lightB
    
    // Cara media (base) - color original
    const midFace = baseColor
    
    // Cara en sombra (izquierda) - 70% del color original
    const darkR = darken(r, 0.7)
    const darkG = darken(g, 0.7)
    const darkB = darken(b, 0.7)
    const darkFace = (darkR << 16) | (darkG << 8) | darkB
    
    // Cara superior/derecha (muy iluminada) - 125% del color original
    const topR = lighten(r, 0.25)
    const topG = lighten(g, 0.22)
    const topB = lighten(b, 0.2)
    const topFace = (topR << 16) | (topG << 8) | topB
    
    return {
      lightFace,
      midFace,
      darkFace,
      topFace
    }
  }

  /**
   * Selecciona un color de la paleta para una montaña
   */
  static getMountainColor(index: number, seed: number): number {
    const colorIndex = Math.floor((index * 2.3 + seed * 5) % this.COLOR_PALETTE.length)
    return this.COLOR_PALETTE[colorIndex]
  }
}

