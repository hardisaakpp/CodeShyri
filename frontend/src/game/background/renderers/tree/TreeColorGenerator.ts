import type { TreeColorVariations } from './TreeTypes'

export class TreeColorGenerator {
  /**
   * Paleta de colores vibrantes y variados para los árboles
   */
  private static readonly COLOR_PALETTE = [
    // Verdes naturales
    0x2D5A2D, 0x3D6B3D, 0x4D7B4D, 0x5D8B5D,
    // Verdes esmeralda
    0x2D8B5D, 0x3D9B6D, 0x4DAB7D, 0x5DBB8D,
    // Azules verdes
    0x2D7B8B, 0x3D8B9B, 0x4D9BAB,
    // Púrpuras y magentas
    0x6B4D8B, 0x7B5D9B, 0x8B6DAB,
    // Naranjas y rojos otoñales
    0xAB6B4D, 0xBB7B5D, 0xCB8B6D,
    // Amarillos dorados
    0xAB9B4D, 0xBBAB5D,
    // Azules y turquesas
    0x4D8BAB, 0x5D9BBB, 0x6DABCB,
    // Rosas y magentas
    0xAB6D8B, 0xBB7D9B,
    // Verdes azulados
    0x4D7B8B, 0x5D8B9B, 0x6D9BAB,
  ]

  /**
   * Obtiene un color único para cada árbol basado en su índice y posición
   */
  static getTreeColor(treeIndex: number, treeX: number): number {
    const colorSeed = (treeIndex * 7 + treeX * 3.7) % this.COLOR_PALETTE.length
    return this.COLOR_PALETTE[Math.floor(colorSeed)]
  }

  /**
   * Genera variaciones de color para las diferentes capas del árbol (Flat Shaded 3D)
   */
  static getTreeColorVariations(baseColor: number): TreeColorVariations {
    // Extraer componentes RGB
    const r = (baseColor >> 16) & 0xFF
    const g = (baseColor >> 8) & 0xFF
    const b = baseColor & 0xFF
    
    // Crear variaciones más oscuras y más claras
    const darken = (component: number, factor: number) => Math.max(0, Math.floor(component * factor))
    const lighten = (component: number, factor: number) => Math.min(255, Math.floor(component + (255 - component) * factor))
    
    // Base oscura (80% del color original) - cara frontal media
    const baseDark = (darken(r, 0.8) << 16) | (darken(g, 0.8) << 8) | darken(b, 0.8)
    
    // Medio oscuro (85% del color original) - cara frontal más oscura
    const mediumDark = (darken(r, 0.85) << 16) | (darken(g, 0.85) << 8) | darken(b, 0.85)
    
    // Sombra muy oscura (55% del color original) - cara en sombra profunda
    const shadowDark = (darken(r, 0.55) << 16) | (darken(g, 0.55) << 8) | darken(b, 0.55)
    
    // Cara muy iluminada (130% del color original) - cara derecha 3D
    const lightR = lighten(r, 0.35)
    const lightG = lighten(g, 0.3)
    const lightB = lighten(b, 0.25)
    const lightFace = (lightR << 16) | (lightG << 8) | lightB
    
    // Cara en sombra profunda (50% del color original) - cara izquierda 3D
    const darkFace = (darken(r, 0.5) << 16) | (darken(g, 0.5) << 8) | darken(b, 0.5)
    
    // Cara superior (110% del color original) - cara superior 3D
    const topR = lighten(r, 0.2)
    const topG = lighten(g, 0.18)
    const topB = lighten(b, 0.15)
    const topFace = (topR << 16) | (topG << 8) | topB
    
    // Resalte claro (120% del color original con saturación) - puntos de luz
    const highlightR = lighten(r, 0.3)
    const highlightG = lighten(g, 0.25)
    const highlightB = lighten(b, 0.2)
    const highlightLight = (highlightR << 16) | (highlightG << 8) | highlightB
    
    return {
      baseDark,
      mediumDark,
      shadowDark,
      highlightLight,
      lightFace,
      darkFace,
      topFace
    }
  }

  /**
   * Genera variaciones de color para las hojas que caen
   */
  static getLeafColorVariations(treeColor: number): number[] {
    const r = (treeColor >> 16) & 0xFF
    const g = (treeColor >> 8) & 0xFF
    const b = treeColor & 0xFF
    
    const variations: number[] = []
    
    // Crear 3-4 variaciones del color base
    for (let i = 0; i < 4; i++) {
      const factor = 0.7 + (i * 0.1) // De 70% a 100%
      const leafR = Math.floor(r * factor)
      const leafG = Math.floor(g * factor)
      const leafB = Math.floor(b * factor)
      variations.push((leafR << 16) | (leafG << 8) | leafB)
    }
    
    return variations
  }

  /**
   * Obtiene el tipo de forma para cada árbol basado en su índice y posición
   */
  static getTreeShapeType(treeIndex: number, treeX: number): number {
    // 8 tipos diferentes de formas
    const shapeSeed = (treeIndex * 11 + treeX * 5.3) % 8
    return Math.floor(shapeSeed)
  }
}

