import type Phaser from 'phaser'
import type { TreeColorVariations, LeafClusterType } from './TreeTypes'

export class TreeCrownRenderer {
  /**
   * Dibuja la copa del árbol según su tipo de forma
   */
  static draw(
    graphics: Phaser.GameObjects.Graphics,
    shapeType: number,
    crownSize: number,
    treeHeight: number,
    colorVariations: TreeColorVariations
  ): void {
    const crownBaseY = -treeHeight * 0.15
    
    switch (shapeType) {
      case 0: // Redondo/frondoso
        this.drawRoundCrown(graphics, crownBaseY, crownSize, colorVariations)
        break
      case 1: // Cónico/piramidal
        this.drawConicalCrown(graphics, crownBaseY, crownSize, colorVariations)
        break
      case 2: // Extendido/ancho
        this.drawWideCrown(graphics, crownBaseY, crownSize, colorVariations)
        break
      case 3: // Delgado/alto
        this.drawTallCrown(graphics, crownBaseY, crownSize, colorVariations)
        break
      case 4: // Irregular/asimétrico
        this.drawAsymmetricCrown(graphics, crownBaseY, crownSize, colorVariations)
        break
      case 5: // Multi-copa
        this.drawMultiCrown(graphics, crownBaseY, crownSize, colorVariations)
        break
      case 6: // Compacto/globular
        this.drawCompactCrown(graphics, crownBaseY, crownSize, colorVariations)
        break
      case 7: // Forma de nube suave
        this.drawCloudCrown(graphics, crownBaseY, crownSize, colorVariations)
        break
    }
  }

  /**
   * Dibuja un grupo/cluster de hojas con efecto 3D
   */
  static drawLeafCluster(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    size: number,
    colors: TreeColorVariations,
    type: LeafClusterType
  ): void {
    const depth = size * 0.12
    
    // Seleccionar color según el tipo
    let mainColor = colors.baseDark
    if (type === 'light' || type === 'top') {
      mainColor = colors.lightFace
    } else if (type === 'shadow') {
      mainColor = colors.darkFace
    } else if (type === 'mid') {
      mainColor = colors.baseDark
    }
    
    // Grupo de hojas formado por múltiples círculos superpuestos
    // Círculo principal
    graphics.fillStyle(mainColor, 0.95)
    graphics.fillCircle(x + depth * 0.2, y - depth * 0.1, size * 0.7)
    
    // Círculos secundarios para volumen
    graphics.fillStyle(mainColor, 0.85)
    graphics.fillCircle(x - size * 0.25, y, size * 0.5)
    graphics.fillCircle(x + size * 0.25, y - size * 0.15, size * 0.55)
    graphics.fillCircle(x, y - size * 0.2, size * 0.5)
    
    // Círculos pequeños para textura
    graphics.fillStyle(mainColor, 0.7)
    graphics.fillCircle(x - size * 0.15, y + size * 0.1, size * 0.35)
    graphics.fillCircle(x + size * 0.2, y + size * 0.05, size * 0.3)
    graphics.fillCircle(x + size * 0.05, y - size * 0.3, size * 0.4)
    
    // Resalte si es cara iluminada
    if (type === 'light' || type === 'top') {
      graphics.fillStyle(colors.highlightLight, 0.4)
      graphics.fillCircle(x + size * 0.15, y - size * 0.25, size * 0.35)
    }
  }

  /**
   * Forma redonda/frondosa mejorada con estructura más natural
   */
  private static drawRoundCrown(
    graphics: Phaser.GameObjects.Graphics,
    crownBaseY: number,
    crownSize: number,
    colors: TreeColorVariations
  ): void {
    const depth = crownSize * 0.15
    
    // Estructura de grupos de hojas más orgánica
    // Capa inferior (base de la copa) - más ancha
    this.drawLeafCluster(graphics, 0, crownBaseY, crownSize * 1.1, colors, 'base')
    this.drawLeafCluster(graphics, -crownSize * 0.4, crownBaseY - crownSize * 0.1, crownSize * 0.85, colors, 'shadow')
    this.drawLeafCluster(graphics, crownSize * 0.4, crownBaseY - crownSize * 0.1, crownSize * 0.9, colors, 'light')
    
    // Capa media - estructura principal
    this.drawLeafCluster(graphics, -crownSize * 0.2, crownBaseY - crownSize * 0.25, crownSize * 0.9, colors, 'shadow')
    this.drawLeafCluster(graphics, crownSize * 0.2, crownBaseY - crownSize * 0.3, crownSize * 0.95, colors, 'light')
    this.drawLeafCluster(graphics, 0, crownBaseY - crownSize * 0.35, crownSize * 0.85, colors, 'mid')
    
    // Capa superior - cimas
    this.drawLeafCluster(graphics, crownSize * 0.15, crownBaseY - crownSize * 0.55, crownSize * 0.7, colors, 'top')
    this.drawLeafCluster(graphics, -crownSize * 0.1, crownBaseY - crownSize * 0.5, crownSize * 0.65, colors, 'mid')
    this.drawLeafCluster(graphics, 0, crownBaseY - crownSize * 0.6, crownSize * 0.6, colors, 'top')
    
    // Resaltes finales
    this.addHighlightsAndShadows3D(graphics, crownBaseY, crownSize, colors, depth)
  }

  /**
   * Forma cónica/piramidal mejorada (tipo abeto/pino)
   */
  private static drawConicalCrown(
    graphics: Phaser.GameObjects.Graphics,
    crownBaseY: number,
    crownSize: number,
    colors: TreeColorVariations
  ): void {
    // Estructura de niveles desde abajo hacia arriba (más natural)
    // Nivel base (ancho)
    this.drawLeafCluster(graphics, -crownSize * 0.25, crownBaseY, crownSize * 0.85, colors, 'shadow')
    this.drawLeafCluster(graphics, crownSize * 0.25, crownBaseY - crownSize * 0.1, crownSize * 0.9, colors, 'light')
    this.drawLeafCluster(graphics, 0, crownBaseY - crownSize * 0.05, crownSize * 0.8, colors, 'base')
    
    // Nivel medio
    this.drawLeafCluster(graphics, -crownSize * 0.15, crownBaseY - crownSize * 0.3, crownSize * 0.75, colors, 'shadow')
    this.drawLeafCluster(graphics, crownSize * 0.2, crownBaseY - crownSize * 0.35, crownSize * 0.8, colors, 'light')
    this.drawLeafCluster(graphics, 0, crownBaseY - crownSize * 0.4, crownSize * 0.7, colors, 'mid')
    
    // Nivel superior
    this.drawLeafCluster(graphics, crownSize * 0.1, crownBaseY - crownSize * 0.6, crownSize * 0.65, colors, 'light')
    this.drawLeafCluster(graphics, 0, crownBaseY - crownSize * 0.65, crownSize * 0.6, colors, 'mid')
    
    // Cima
    this.drawLeafCluster(graphics, 0, crownBaseY - crownSize * 0.85, crownSize * 0.5, colors, 'top')
    
    this.addHighlightsAndShadows(graphics, crownBaseY, crownSize, colors, true)
  }

  /**
   * Forma extendida/ancha
   */
  private static drawWideCrown(
    graphics: Phaser.GameObjects.Graphics,
    crownBaseY: number,
    crownSize: number,
    colors: TreeColorVariations
  ): void {
    const widthFactor = 1.4
    graphics.fillStyle(colors.baseDark, 0.95)
    graphics.fillEllipse(0, crownBaseY, crownSize * widthFactor, crownSize * 0.8)
    
    graphics.fillCircle(crownSize * 0.6, crownBaseY - crownSize * 0.15, crownSize * 0.7)
    graphics.fillCircle(-crownSize * 0.6, crownBaseY - crownSize * 0.15, crownSize * 0.7)
    graphics.fillCircle(0, crownBaseY - crownSize * 0.3, crownSize * 0.6)
    
    graphics.fillStyle(colors.mediumDark, 0.8)
    graphics.fillCircle(crownSize * 0.4, crownBaseY - crownSize * 0.2, crownSize * 0.5)
    graphics.fillCircle(-crownSize * 0.4, crownBaseY - crownSize * 0.2, crownSize * 0.5)
    
    this.addHighlightsAndShadows(graphics, crownBaseY, crownSize, colors)
  }

  /**
   * Forma delgada/alta
   */
  private static drawTallCrown(
    graphics: Phaser.GameObjects.Graphics,
    crownBaseY: number,
    crownSize: number,
    colors: TreeColorVariations
  ): void {
    const heightFactor = 1.3
    graphics.fillStyle(colors.baseDark, 0.95)
    graphics.fillEllipse(0, crownBaseY - crownSize * 0.3, crownSize * 0.7, crownSize * heightFactor)
    
    graphics.fillCircle(0, crownBaseY - crownSize * 0.4, crownSize * 0.75)
    graphics.fillCircle(0, crownBaseY - crownSize * 0.7, crownSize * 0.65)
    graphics.fillCircle(0, crownBaseY - crownSize * 1.0, crownSize * 0.5)
    
    graphics.fillStyle(colors.mediumDark, 0.8)
    graphics.fillCircle(0, crownBaseY - crownSize * 0.5, crownSize * 0.6)
    graphics.fillCircle(0, crownBaseY - crownSize * 0.8, crownSize * 0.5)
    
    this.addHighlightsAndShadows(graphics, crownBaseY, crownSize, colors, true)
  }

  /**
   * Forma irregular/asimétrica
   */
  private static drawAsymmetricCrown(
    graphics: Phaser.GameObjects.Graphics,
    crownBaseY: number,
    crownSize: number,
    colors: TreeColorVariations
  ): void {
    graphics.fillStyle(colors.baseDark, 0.95)
    // Copa principal desplazada a la derecha
    graphics.fillCircle(crownSize * 0.2, crownBaseY - crownSize * 0.2, crownSize)
    
    // Copas secundarias asimétricas
    graphics.fillCircle(-crownSize * 0.4, crownBaseY - crownSize * 0.1, crownSize * 0.7)
    graphics.fillCircle(crownSize * 0.5, crownBaseY - crownSize * 0.5, crownSize * 0.6)
    graphics.fillCircle(-crownSize * 0.3, crownBaseY - crownSize * 0.4, crownSize * 0.5)
    
    graphics.fillStyle(colors.mediumDark, 0.8)
    graphics.fillCircle(crownSize * 0.1, crownBaseY - crownSize * 0.3, crownSize * 0.65)
    graphics.fillCircle(-crownSize * 0.3, crownBaseY - crownSize * 0.2, crownSize * 0.5)
    
    this.addHighlightsAndShadows(graphics, crownBaseY, crownSize, colors)
  }

  /**
   * Forma multi-copa (múltiples copas)
   */
  private static drawMultiCrown(
    graphics: Phaser.GameObjects.Graphics,
    crownBaseY: number,
    crownSize: number,
    colors: TreeColorVariations
  ): void {
    graphics.fillStyle(colors.baseDark, 0.95)
    // Copas múltiples en diferentes niveles
    graphics.fillCircle(-crownSize * 0.3, crownBaseY - crownSize * 0.1, crownSize * 0.65)
    graphics.fillCircle(crownSize * 0.3, crownBaseY - crownSize * 0.2, crownSize * 0.7)
    graphics.fillCircle(0, crownBaseY - crownSize * 0.5, crownSize * 0.6)
    graphics.fillCircle(crownSize * 0.25, crownBaseY - crownSize * 0.7, crownSize * 0.5)
    graphics.fillCircle(-crownSize * 0.2, crownBaseY - crownSize * 0.75, crownSize * 0.45)
    
    graphics.fillStyle(colors.mediumDark, 0.8)
    graphics.fillCircle(-crownSize * 0.25, crownBaseY - crownSize * 0.15, crownSize * 0.5)
    graphics.fillCircle(crownSize * 0.25, crownBaseY - crownSize * 0.25, crownSize * 0.55)
    graphics.fillCircle(0, crownBaseY - crownSize * 0.55, crownSize * 0.45)
    
    this.addHighlightsAndShadows(graphics, crownBaseY, crownSize, colors)
  }

  /**
   * Forma compacta/globular
   */
  private static drawCompactCrown(
    graphics: Phaser.GameObjects.Graphics,
    crownBaseY: number,
    crownSize: number,
    colors: TreeColorVariations
  ): void {
    const compactSize = crownSize * 0.85
    graphics.fillStyle(colors.baseDark, 0.95)
    graphics.fillCircle(0, crownBaseY, compactSize)
    
    graphics.fillCircle(0, crownBaseY - compactSize * 0.2, compactSize * 0.9)
    graphics.fillCircle(compactSize * 0.3, crownBaseY - compactSize * 0.1, compactSize * 0.7)
    graphics.fillCircle(-compactSize * 0.3, crownBaseY - compactSize * 0.1, compactSize * 0.7)
    
    graphics.fillStyle(colors.mediumDark, 0.8)
    graphics.fillCircle(0, crownBaseY - compactSize * 0.15, compactSize * 0.75)
    
    this.addHighlightsAndShadows(graphics, crownBaseY, compactSize, colors)
  }

  /**
   * Forma de nube suave
   */
  private static drawCloudCrown(
    graphics: Phaser.GameObjects.Graphics,
    crownBaseY: number,
    crownSize: number,
    colors: TreeColorVariations
  ): void {
    graphics.fillStyle(colors.baseDark, 0.95)
    // Múltiples círculos suaves superpuestos
    graphics.fillCircle(0, crownBaseY, crownSize * 0.9)
    graphics.fillCircle(crownSize * 0.4, crownBaseY - crownSize * 0.15, crownSize * 0.75)
    graphics.fillCircle(-crownSize * 0.4, crownBaseY - crownSize * 0.15, crownSize * 0.75)
    graphics.fillCircle(0, crownBaseY - crownSize * 0.35, crownSize * 0.7)
    graphics.fillCircle(crownSize * 0.35, crownBaseY - crownSize * 0.4, crownSize * 0.6)
    graphics.fillCircle(-crownSize * 0.35, crownBaseY - crownSize * 0.4, crownSize * 0.6)
    
    graphics.fillStyle(colors.mediumDark, 0.8)
    graphics.fillCircle(crownSize * 0.25, crownBaseY - crownSize * 0.25, crownSize * 0.5)
    graphics.fillCircle(-crownSize * 0.25, crownBaseY - crownSize * 0.25, crownSize * 0.5)
    
    this.addHighlightsAndShadows(graphics, crownBaseY, crownSize, colors)
  }

  /**
   * Añade resaltes y sombras comunes a todas las formas
   */
  private static addHighlightsAndShadows(
    graphics: Phaser.GameObjects.Graphics,
    crownBaseY: number,
    crownSize: number,
    colors: TreeColorVariations,
    isConical: boolean = false
  ): void {
    // Sombras
    graphics.fillStyle(colors.darkFace, 0.8)
    if (isConical) {
      graphics.fillCircle(-crownSize * 0.2, crownBaseY - crownSize * 0.2, crownSize * 0.5)
      graphics.fillCircle(-crownSize * 0.15, crownBaseY - crownSize * 0.5, crownSize * 0.4)
    } else {
      graphics.fillCircle(-crownSize * 0.3, crownBaseY - crownSize * 0.1, crownSize * 0.6)
      graphics.fillCircle(-crownSize * 0.2, crownBaseY - crownSize * 0.4, crownSize * 0.5)
    }
    
    // Resaltes
    graphics.fillStyle(colors.lightFace, 0.6)
    if (isConical) {
      graphics.fillCircle(crownSize * 0.2, crownBaseY - crownSize * 0.3, crownSize * 0.4)
      graphics.fillCircle(crownSize * 0.15, crownBaseY - crownSize * 0.6, crownSize * 0.3)
    } else {
      graphics.fillCircle(crownSize * 0.3, crownBaseY - crownSize * 0.2, crownSize * 0.4)
      graphics.fillCircle(crownSize * 0.25, crownBaseY - crownSize * 0.5, crownSize * 0.35)
    }
    
    // Detalles de textura (hojas)
    graphics.fillStyle(colors.baseDark, 0.6)
    const numLeaves = isConical ? 6 : 8
    for (let i = 0; i < numLeaves; i++) {
      const angle = (i / numLeaves) * Math.PI * 2
      const dist = crownSize * (0.4 + Math.random() * 0.3)
      const leafX = Math.cos(angle) * dist
      const leafY = crownBaseY + Math.sin(angle) * dist * 0.6
      graphics.fillCircle(leafX, leafY, 3 + Math.random() * 2)
    }
  }

  /**
   * Añade resaltes y sombras 3D mejoradas
   */
  private static addHighlightsAndShadows3D(
    graphics: Phaser.GameObjects.Graphics,
    crownBaseY: number,
    crownSize: number,
    colors: TreeColorVariations,
    depth: number
  ): void {
    // Puntos de luz en caras iluminadas
    graphics.fillStyle(colors.highlightLight, 0.5)
    graphics.fillCircle(crownSize * 0.3 + depth * 0.3, crownBaseY - crownSize * 0.2, crownSize * 0.35)
    graphics.fillCircle(crownSize * 0.2, crownBaseY - crownSize * 0.5, crownSize * 0.3)
    
    // Sombras profundas en caras en sombra
    graphics.fillStyle(colors.shadowDark, 0.7)
    graphics.fillCircle(-crownSize * 0.3 - depth * 0.3, crownBaseY - crownSize * 0.15, crownSize * 0.5)
    
    // Detalles de textura (hojas pequeñas)
    graphics.fillStyle(colors.baseDark, 0.5)
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2
      const dist = crownSize * (0.3 + Math.random() * 0.4)
      const leafX = Math.cos(angle) * dist
      const leafY = crownBaseY + Math.sin(angle) * dist * 0.6
      graphics.fillCircle(leafX, leafY, 2 + Math.random() * 2)
    }
  }
}

