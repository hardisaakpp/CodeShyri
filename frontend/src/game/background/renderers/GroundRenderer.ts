import type Phaser from 'phaser'
import { GridRenderer } from './GridRenderer'

export class GroundRenderer {
  // Seed para ruido determinístico (mejor rendimiento que Math.random)
  private readonly noiseSeed = 12345.6789
  private cellSize: number = 60 // Tamaño de celda del grid (debe coincidir con GridRenderer)

  constructor(
    private graphics: Phaser.GameObjects.Graphics,
    private width: number,
    private height: number,
    private horizonY: number,
    private gridRenderer?: GridRenderer
  ) {
    if (gridRenderer) {
      this.cellSize = gridRenderer.getCellSize()
    }
  }

  /**
   * Renderiza el suelo con diseño elegante y textura mejorada
   */
  public render() {
    const groundHeight = this.height - this.horizonY
    
    // Si tenemos grid, dibujar bloques tipo Minecraft
    if (this.gridRenderer) {
      this.drawBlockGrid(groundHeight)
    } else {
      // Fallback al diseño original
      this.drawElegantGradient(groundHeight)
      this.drawDepthVariation(groundHeight)
      this.drawEnhancedTexture(groundHeight)
    }
    
    // Línea del horizonte refinada
    this.graphics.lineStyle(2, 0x3A5A3A, 0.4)
    this.graphics.moveTo(0, this.horizonY)
    this.graphics.lineTo(this.width, this.horizonY)
    this.graphics.strokePath()
  }

  /**
   * Mapa de bloques: true = sendero (café), false = pasto (verde)
   * Esto se puede configurar por nivel
   */
  private pathBlocks: Map<string, boolean> = new Map()

  /**
   * Define qué bloques son sendero (cafés) para un nivel
   */
  public setPathBlocks(pathCoordinates: Array<{ x: number; y: number }>) {
    this.pathBlocks.clear()
    pathCoordinates.forEach(coord => {
      const key = `${coord.x},${coord.y}`
      this.pathBlocks.set(key, true)
    })
  }

  /**
   * Verifica si un bloque es parte del sendero (por coordenadas de grid)
   */
  public isPathBlock(gridX: number, gridY: number): boolean {
    const key = `${gridX},${gridY}`
    return this.pathBlocks.get(key) === true
  }

  /**
   * Verifica si una posición en píxeles está sobre el sendero (camino café)
   * @param pixelX Coordenada X en píxeles
   * @param pixelY Coordenada Y en píxeles
   * @param gridRenderer Renderer del grid para convertir coordenadas
   */
  public isPixelOnPath(pixelX: number, pixelY: number, gridRenderer?: GridRenderer): boolean {
    if (!gridRenderer) return false
    const grid = gridRenderer.pixelToGrid(pixelX, pixelY)
    return this.isPathBlock(grid.gridX, grid.gridY)
  }

  /**
   * Dibuja bloques tipo Minecraft que representan el grid
   */
  private drawBlockGrid(groundHeight: number) {
    const numCols = Math.ceil(this.width / this.cellSize)
    const numRows = Math.ceil(groundHeight / this.cellSize)

    // Colores base para los bloques (tierra/hierba andina)
    const grassTopColor = 0x5A8A5A    // Verde hierba claro
    const pathColor = 0x8B6F47        // Café/marrón sendero (más claro que tierra)
    const borderColor = 0x3A4A3A      // Borde oscuro
    const borderLightColor = 0x6A7A6A // Borde claro (highlight)

    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        const blockX = col * this.cellSize
        const blockY = this.horizonY + row * this.cellSize
        const blockWidth = Math.min(this.cellSize, this.width - blockX)
        const blockHeight = Math.min(this.cellSize, this.height - blockY)

        // Determinar tipo de bloque: sendero (café) o hierba (verde)
        const isPathBlock = this.isPathBlock(col, row)
        
        // Lógica simplificada: path = café, resto = verde (sin aleatoriedad)
        let baseColor: number
        if (isPathBlock) {
          baseColor = pathColor // Bloque de sendero (café)
        } else {
          baseColor = grassTopColor // Todos los demás bloques son verdes
        }

        // Variación sutil de color para hacer más orgánico (usando ruido determinístico)
        const noiseValue = this.fbm(blockX * 0.08, blockY * 0.08, 2)
        const colorVariation = Math.floor((noiseValue - 0.5) * 6) // -3 a +3 (variación más sutil)

        // Aplicar variación de color
        const r = Math.max(0, Math.min(255, ((baseColor >> 16) & 0xFF) + colorVariation))
        const g = Math.max(0, Math.min(255, ((baseColor >> 8) & 0xFF) + colorVariation))
        const b = Math.max(0, Math.min(255, (baseColor & 0xFF) + colorVariation))
        const finalColor = (r << 16) | (g << 8) | b

        // Dibujar bloque principal
        this.graphics.fillStyle(finalColor, 1)
        this.graphics.fillRect(blockX, blockY, blockWidth, blockHeight)

        // Si es bloque de sendero (café), agregar diferentes patrones de diseño
        if (isPathBlock) {
          this.drawPathPattern(blockX, blockY, blockWidth, blockHeight, col, row, pathColor)
        } else {
          // Si es bloque de hierba (verde), agregar textura de hierba en la parte superior
          this.drawGrassTexture(blockX, blockY, blockWidth, blockHeight)
        }

        // Bordes del bloque para efecto 3D tipo Minecraft
        const borderWidth = 2

        // Borde superior (más claro - luz)
        this.graphics.lineStyle(borderWidth, borderLightColor, 0.6)
        this.graphics.strokeRect(blockX, blockY, blockWidth, borderWidth)

        // Borde izquierdo (más claro - luz)
        this.graphics.lineStyle(borderWidth, borderLightColor, 0.5)
        this.graphics.strokeRect(blockX, blockY, borderWidth, blockHeight)

        // Borde inferior (más oscuro - sombra)
        this.graphics.lineStyle(borderWidth, borderColor, 0.7)
        this.graphics.strokeRect(blockX, blockY + blockHeight - borderWidth, blockWidth, borderWidth)

        // Borde derecho (más oscuro - sombra)
        this.graphics.lineStyle(borderWidth, borderColor, 0.6)
        this.graphics.strokeRect(blockX + blockWidth - borderWidth, blockY, borderWidth, blockHeight)

        // Sombra interna sutil en la esquina inferior derecha
        this.graphics.fillStyle(0x000000, 0.15)
        this.graphics.fillRect(
          blockX + blockWidth * 0.7,
          blockY + blockHeight * 0.7,
          blockWidth * 0.3,
          blockHeight * 0.3
        )

        // Highlight sutil en la esquina superior izquierda
        this.graphics.fillStyle(0xFFFFFF, 0.1)
        this.graphics.fillRect(
          blockX,
          blockY,
          blockWidth * 0.3,
          blockHeight * 0.3
        )
      }
    }
  }

  /**
   * Genera una paleta única de 3 colores café basada en la posición del bloque
   * Usa el mismo color base del bloque principal (pathColor) con variaciones
   */
  private generateUniqueColorPalette(col: number, row: number, basePathColor: number): { primary: number; secondary: number; accent: number } {
    // Función hash determinística para generar valores únicos
    const hash1 = ((col * 73856093) ^ (row * 19349663)) % 100
    const hash2 = ((col * 19349663) ^ (row * 73856093)) % 100
    const hash3 = ((col * 8349271) ^ (row * 2837492)) % 100
    
    // Usar el color base del bloque café como referencia
    // Generar variaciones de brillo y saturación dentro de la misma escala café
    
    // Primary: variación más clara del color base
    const primaryVariation = 8 + (hash1 % 12) // +8 a +20 (más claro)
    const primary = this.adjustColorBrightness(basePathColor, primaryVariation)
    
    // Secondary: variación media del color base
    const secondaryVariation = -4 + (hash2 % 8) // -4 a +4 (similar al base)
    const secondary = this.adjustColorBrightness(basePathColor, secondaryVariation)
    
    // Accent: variación más oscura del color base
    const accentVariation = -12 - (hash3 % 8) // -12 a -20 (más oscuro)
    const accent = this.adjustColorBrightness(basePathColor, accentVariation)
    
    return { primary, secondary, accent }
  }

  /**
   * Ajusta el brillo de un color RGB
   */
  private adjustColorBrightness(color: number, adjustment: number): number {
    const r = Math.max(0, Math.min(255, ((color >> 16) & 0xFF) + adjustment))
    const g = Math.max(0, Math.min(255, ((color >> 8) & 0xFF) + adjustment))
    const b = Math.max(0, Math.min(255, (color & 0xFF) + adjustment))
    return (r << 16) | (g << 8) | b
  }

  /**
   * Dibuja diferentes patrones de diseño para bloques de sendero (café)
   * Usa una función hash determinística basada en la posición para seleccionar el patrón
   */
  private drawPathPattern(blockX: number, blockY: number, blockWidth: number, blockHeight: number, col: number, row: number, basePathColor: number) {
    // Generar paleta única de 3 colores para este bloque usando el color base
    const colors = this.generateUniqueColorPalette(col, row, basePathColor)
    
    // Función hash simple y determinística para seleccionar patrón
    const hash = ((col * 73856093) ^ (row * 19349663)) % 7
    
    switch (hash) {
      case 0:
        this.drawPatternLines(blockX, blockY, blockWidth, blockHeight, colors)
        break
      case 1:
        this.drawPatternDots(blockX, blockY, blockWidth, blockHeight, colors)
        break
      case 2:
        this.drawPatternBricks(blockX, blockY, blockWidth, blockHeight, colors)
        break
      case 3:
        this.drawPatternDiagonal(blockX, blockY, blockWidth, blockHeight, colors)
        break
      case 4:
        this.drawPatternStones(blockX, blockY, blockWidth, blockHeight, colors)
        break
      case 5:
        this.drawPatternWaves(blockX, blockY, blockWidth, blockHeight, colors)
        break
      case 6:
        this.drawPatternGrid(blockX, blockY, blockWidth, blockHeight, colors)
        break
    }
  }

  /**
   * Dibuja un bloque simple en 2D
   */
  private draw2DBlock(x: number, y: number, width: number, height: number, color: number, alpha: number = 0.8) {
    this.graphics.fillStyle(color, alpha)
    this.graphics.fillRect(x, y, width, height)
    
    // Borde sutil
    this.graphics.lineStyle(1, 0x000000, 0.2)
    this.graphics.strokeRect(x, y, width, height)
  }

  /**
   * Dibuja un ladrillo simple en 2D con línea de mortero
   */
  private draw2DBrick(x: number, y: number, width: number, height: number, color: number, alpha: number = 0.8) {
    // Dibujar el bloque base
    this.draw2DBlock(x, y, width, height, color, alpha)
    
    // Línea de mortero horizontal (centro)
    this.graphics.lineStyle(1, 0x000000, 0.15)
    this.graphics.moveTo(x, y + height * 0.5)
    this.graphics.lineTo(x + width, y + height * 0.5)
    this.graphics.strokePath()
  }

  /**
   * Patrón 1: Dos mini-bloques horizontales tipo ladrillo (arriba y abajo)
   */
  private drawPatternLines(blockX: number, blockY: number, blockWidth: number, blockHeight: number, colors: { primary: number; secondary: number; accent: number }) {
    const padding = blockWidth * 0.1
    const miniHeight = blockHeight * 0.35
    
    // Mini-bloque superior: ladrillo horizontal con color primary
    this.draw2DBrick(blockX + padding, blockY + padding, blockWidth - padding * 2, miniHeight, colors.primary, 0.8)
    
    // Mini-bloque inferior: ladrillo horizontal con color secondary
    this.draw2DBrick(blockX + padding, blockY + blockHeight - miniHeight - padding, blockWidth - padding * 2, miniHeight, colors.secondary, 0.8)
    
    // Acento: pequeño bloque central con color accent
    const accentWidth = (blockWidth - padding * 2) * 0.3
    const accentHeight = blockHeight * 0.1
    this.draw2DBlock(
      blockX + blockWidth * 0.5 - accentWidth * 0.5,
      blockY + blockHeight * 0.5 - accentHeight * 0.5,
      accentWidth,
      accentHeight,
      colors.accent,
      0.7
    )
  }

  /**
   * Patrón 2: Dos bloques cuadrados tipo piedra (izquierda y derecha)
   */
  private drawPatternDots(blockX: number, blockY: number, blockWidth: number, blockHeight: number, colors: { primary: number; secondary: number; accent: number }) {
    const padding = blockWidth * 0.15
    const blockSize = Math.min(blockWidth, blockHeight) * 0.35
    
    // Mini-bloque izquierdo: bloque cuadrado con color primary
    this.draw2DBlock(blockX + padding, blockY + blockHeight * 0.5 - blockSize * 0.5, blockSize, blockSize, colors.primary, 0.8)
    
    // Mini-bloque derecho: bloque cuadrado con color secondary
    this.draw2DBlock(blockX + blockWidth - blockSize - padding, blockY + blockHeight * 0.5 - blockSize * 0.5, blockSize, blockSize, colors.secondary, 0.8)
    
    // Acento: pequeño bloque central con color accent
    const accentSize = blockSize * 0.5
    this.draw2DBlock(
      blockX + blockWidth * 0.5 - accentSize * 0.5,
      blockY + blockHeight * 0.5 - accentSize * 0.5,
      accentSize,
      accentSize,
      colors.accent,
      0.7
    )
  }

  /**
   * Patrón 3: Dos ladrillos en esquinas opuestas
   */
  private drawPatternBricks(blockX: number, blockY: number, blockWidth: number, blockHeight: number, colors: { primary: number; secondary: number; accent: number }) {
    const padding = blockWidth * 0.15
    const brickSize = Math.min(blockWidth, blockHeight) * 0.35
    
    // Ladrillo superior izquierdo con color primary
    this.draw2DBrick(blockX + padding, blockY + padding, brickSize, brickSize, colors.primary, 0.8)
    
    // Ladrillo inferior derecho con color secondary
    this.draw2DBrick(blockX + blockWidth - brickSize - padding, blockY + blockHeight - brickSize - padding, brickSize, brickSize, colors.secondary, 0.8)
    
    // Acento: pequeño bloque central con color accent
    const accentSize = brickSize * 0.5
    this.draw2DBlock(
      blockX + blockWidth * 0.5 - accentSize * 0.5,
      blockY + blockHeight * 0.5 - accentSize * 0.5,
      accentSize,
      accentSize,
      colors.accent,
      0.7
    )
  }

  /**
   * Patrón 4: Dos bloques rectangulares en diagonal
   */
  private drawPatternDiagonal(blockX: number, blockY: number, blockWidth: number, blockHeight: number, colors: { primary: number; secondary: number; accent: number }) {
    const padding = blockWidth * 0.1
    const blockWidth_size = blockWidth * 0.35
    const blockHeight_size = blockHeight * 0.35
    
    // Bloque superior derecho con color primary
    this.draw2DBlock(
      blockX + blockWidth - blockWidth_size - padding,
      blockY + padding,
      blockWidth_size,
      blockHeight_size,
      colors.primary,
      0.8
    )
    
    // Bloque inferior izquierdo con color secondary
    this.draw2DBlock(
      blockX + padding,
      blockY + blockHeight - blockHeight_size - padding,
      blockWidth_size,
      blockHeight_size,
      colors.secondary,
      0.8
    )
    
    // Acento: pequeño bloque central con color accent
    const accentSize = Math.min(blockWidth_size, blockHeight_size) * 0.5
    this.draw2DBlock(
      blockX + blockWidth * 0.5 - accentSize * 0.5,
      blockY + blockHeight * 0.5 - accentSize * 0.5,
      accentSize,
      accentSize,
      colors.accent,
      0.7
    )
  }

  /**
   * Patrón 5: Dos bloques verticales tipo columna (lados)
   */
  private drawPatternStones(blockX: number, blockY: number, blockWidth: number, blockHeight: number, colors: { primary: number; secondary: number; accent: number }) {
    const padding = blockWidth * 0.1
    const columnWidth = blockWidth * 0.25
    
    // Columna izquierda con color primary
    this.draw2DBlock(blockX + padding, blockY + padding, columnWidth, blockHeight - padding * 2, colors.primary, 0.8)
    
    // Columna derecha con color secondary
    this.draw2DBlock(blockX + blockWidth - columnWidth - padding, blockY + padding, columnWidth, blockHeight - padding * 2, colors.secondary, 0.8)
    
    // Acento: bloque horizontal central con color accent
    const accentHeight = blockHeight * 0.15
    this.draw2DBlock(
      blockX + padding + columnWidth,
      blockY + blockHeight * 0.5 - accentHeight * 0.5,
      blockWidth - (padding + columnWidth) * 2,
      accentHeight,
      colors.accent,
      0.7
    )
  }

  /**
   * Patrón 6: Dos bloques horizontales tipo losa (arriba y abajo)
   */
  private drawPatternWaves(blockX: number, blockY: number, blockWidth: number, blockHeight: number, colors: { primary: number; secondary: number; accent: number }) {
    const padding = blockWidth * 0.1
    const slabHeight = blockHeight * 0.35
    
    // Losa superior con color primary
    this.draw2DBlock(blockX + padding, blockY + padding, blockWidth - padding * 2, slabHeight, colors.primary, 0.8)
    
    // Losa inferior con color secondary
    this.draw2DBlock(blockX + padding, blockY + blockHeight - slabHeight - padding, blockWidth - padding * 2, slabHeight, colors.secondary, 0.8)
    
    // Acento: pequeño bloque central con color accent
    const accentWidth = (blockWidth - padding * 2) * 0.4
    const accentHeight = blockHeight * 0.1
    this.draw2DBlock(
      blockX + blockWidth * 0.5 - accentWidth * 0.5,
      blockY + blockHeight * 0.5 - accentHeight * 0.5,
      accentWidth,
      accentHeight,
      colors.accent,
      0.7
    )
  }

  /**
   * Patrón 7: Dos bloques cuadrados tipo adoquín (esquinas)
   */
  private drawPatternGrid(blockX: number, blockY: number, blockWidth: number, blockHeight: number, colors: { primary: number; secondary: number; accent: number }) {
    const padding = blockWidth * 0.15
    const cobbleSize = Math.min(blockWidth, blockHeight) * 0.35
    
    // Adoquín superior izquierdo con color primary
    this.draw2DBlock(blockX + padding, blockY + padding, cobbleSize, cobbleSize, colors.primary, 0.8)
    
    // Adoquín inferior derecho con color secondary
    this.draw2DBlock(blockX + blockWidth - cobbleSize - padding, blockY + blockHeight - cobbleSize - padding, cobbleSize, cobbleSize, colors.secondary, 0.8)
    
    // Acento: pequeño bloque central con color accent
    const accentSize = cobbleSize * 0.5
    this.draw2DBlock(
      blockX + blockWidth * 0.5 - accentSize * 0.5,
      blockY + blockHeight * 0.5 - accentSize * 0.5,
      accentSize,
      accentSize,
      colors.accent,
      0.7
    )
  }

  /**
   * Dibuja textura de hierba en la parte superior del bloque
   */
  private drawGrassTexture(blockX: number, blockY: number, blockWidth: number, blockHeight: number) {
    const grassColor = 0x6A9A6A
    const grassAlpha = 0.3

    // Dibujar pequeñas manchas de hierba en la parte superior
    const numGrassSpots = 3 + Math.floor(this.fbm(blockX * 0.1, blockY * 0.1, 1) * 3)
    
    for (let i = 0; i < numGrassSpots; i++) {
      const spotX = blockX + (i / numGrassSpots) * blockWidth + (this.fbm(blockX + i, blockY, 1) - 0.5) * blockWidth * 0.3
      const spotY = blockY + (this.fbm(blockX + i * 2, blockY, 1) - 0.5) * blockHeight * 0.2
      const spotSize = 2 + this.fbm(blockX + i * 3, blockY, 1) * 3

      this.graphics.fillStyle(grassColor, grassAlpha)
      this.graphics.fillCircle(spotX, spotY, spotSize)
    }
  }

  /**
   * Función de ruido determinístico simple y eficiente
   * Usa funciones trigonométricas para crear patrones orgánicos
   */
  private noise(x: number, y: number, scale: number = 1): number {
    return (Math.sin(x * scale + this.noiseSeed) * Math.cos(y * scale + this.noiseSeed * 0.7) + 1) * 0.5
  }

  /**
   * Ruido fraccional simple (más suave y orgánico)
   */
  private fbm(x: number, y: number, octaves: number = 2): number {
    let value = 0
    let amplitude = 0.5
    let frequency = 0.02
    
    for (let i = 0; i < octaves; i++) {
      value += this.noise(x, y, frequency) * amplitude
      amplitude *= 0.5
      frequency *= 2
    }
    
    return value
  }

  /**
   * Dibuja gradiente elegante y sofisticado con variación procedural
   */
  private drawElegantGradient(groundHeight: number) {
    // Gradiente vertical suave con variación horizontal sutil
    const steps = 16
    const topColor = 0x4A7A5A    // Verde terroso claro
    const midColor = 0x3A6A4A    // Verde terroso medio
    const bottomColor = 0x2A5A3A  // Verde terroso oscuro
    
    // Usar ruido para variación horizontal sutil (más eficiente que múltiples rectángulos)
    const horizontalVariation = 8 // Número de segmentos horizontales para variación
    
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1)
      const stepHeight = groundHeight / steps
      const stepY = this.horizonY + i * stepHeight
      
      // Interpolación de color base con punto medio
      let baseColor: number
      if (t < 0.5) {
        const localT = t * 2
        const r1 = (topColor >> 16) & 0xFF
        const g1 = (topColor >> 8) & 0xFF
        const b1 = topColor & 0xFF
        const r2 = (midColor >> 16) & 0xFF
        const g2 = (midColor >> 8) & 0xFF
        const b2 = midColor & 0xFF
        
        const r = Math.floor(r1 + (r2 - r1) * localT)
        const g = Math.floor(g1 + (g2 - g1) * localT)
        const b = Math.floor(b1 + (b2 - b1) * localT)
        baseColor = (r << 16) | (g << 8) | b
      } else {
        const localT = (t - 0.5) * 2
        const r1 = (midColor >> 16) & 0xFF
        const g1 = (midColor >> 8) & 0xFF
        const b1 = midColor & 0xFF
        const r2 = (bottomColor >> 16) & 0xFF
        const g2 = (bottomColor >> 8) & 0xFF
        const b2 = bottomColor & 0xFF
        
        const r = Math.floor(r1 + (r2 - r1) * localT)
        const g = Math.floor(g1 + (g2 - g1) * localT)
        const b = Math.floor(b1 + (b2 - b1) * localT)
        baseColor = (r << 16) | (g << 8) | b
      }
      
      // Agregar variación horizontal sutil usando ruido procedural
      const segmentWidth = this.width / horizontalVariation
      for (let seg = 0; seg < horizontalVariation; seg++) {
        const segX = seg * segmentWidth
        const centerX = segX + segmentWidth * 0.5
        const centerY = stepY + stepHeight * 0.5
        
        // Variación sutil basada en ruido (máximo ±5 en cada canal RGB)
        const noiseValue = this.fbm(centerX, centerY, 2) - 0.5 // -0.5 a 0.5
        const variation = Math.floor(noiseValue * 5)
        
        const r = Math.max(0, Math.min(255, ((baseColor >> 16) & 0xFF) + variation))
        const g = Math.max(0, Math.min(255, ((baseColor >> 8) & 0xFF) + variation))
        const b = Math.max(0, Math.min(255, (baseColor & 0xFF) + variation))
        const color = (r << 16) | (g << 8) | b
        
        this.graphics.fillStyle(color, 1)
        this.graphics.fillRect(segX, stepY, segmentWidth + 1, stepHeight + 1)
      }
    }
  }

  /**
   * Dibuja variación de profundidad con sombras elegantes usando ruido procedural
   */
  private drawDepthVariation(groundHeight: number) {
    // Parches grandes de variación sutil usando ruido determinístico
    const variations = [
      { color: 0x3A6A4A, alpha: 0.12 }, // Variación verde medio
      { color: 0x4A7A5A, alpha: 0.1 },  // Variación verde claro
      { color: 0x2A5A3A, alpha: 0.15 }  // Variación verde oscuro
    ]
    
    // Usar ruido para posicionar parches de forma determinística pero orgánica
    const numPatches = 5
    const patchSpacing = this.width / (numPatches + 1)
    
    for (let i = 0; i < numPatches; i++) {
      const baseX = patchSpacing * (i + 1)
      const baseY = this.horizonY + groundHeight * 0.5
      
      // Usar ruido para variar posición y tamaño de forma orgánica
      const noiseX = this.fbm(baseX * 0.01, baseY * 0.01, 2)
      const noiseY = this.fbm(baseX * 0.015, baseY * 0.015, 2)
      const noiseSize = this.fbm(baseX * 0.02, baseY * 0.02, 2)
      
      const centerX = baseX + (noiseX - 0.5) * this.width * 0.3
      const centerY = baseY + (noiseY - 0.5) * groundHeight * 0.4
      const patchWidth = this.width * (0.2 + noiseSize * 0.15)
      const patchHeight = patchWidth * (0.6 + noiseSize * 0.2)
      
      // Seleccionar variación basada en posición (determinístico)
      const variationIndex = Math.floor((noiseX + noiseY) * variations.length) % variations.length
      const variation = variations[variationIndex]
      
      // Parche principal con forma orgánica suave
      this.graphics.fillStyle(variation.color, variation.alpha)
      this.graphics.fillEllipse(centerX, centerY, patchWidth, patchHeight)
      
      // Sombra interna para profundidad (muy sutil)
      this.graphics.fillStyle(variation.color, variation.alpha * 0.4)
      this.graphics.fillEllipse(
        centerX - patchWidth * 0.15,
        centerY + patchHeight * 0.1,
        patchWidth * 0.4,
        patchHeight * 0.4
      )
    }
    
    // Sombra general cerca del horizonte para profundidad con gradiente suave
    const shadowSteps = 4
    const shadowHeight = groundHeight * 0.15
    for (let s = 0; s < shadowSteps; s++) {
      const shadowAlpha = 0.2 * (1 - s / shadowSteps)
      this.graphics.fillStyle(0x2A4A2A, shadowAlpha)
      this.graphics.fillRect(0, this.horizonY + (shadowHeight / shadowSteps) * s, this.width, shadowHeight / shadowSteps)
    }
  }

  /**
   * Dibuja textura mejorada usando ruido procedural para mayor realismo
   */
  private drawEnhancedTexture(groundHeight: number) {
    // Textura de hierba mejorada con ruido procedural
    const grassColor = 0x4A8A5A
    const grassAlpha = 0.18
    
    // Usar grid optimizado con ruido para determinar dónde dibujar
    const gridCols = 10
    const gridRows = 8
    const cellWidth = this.width / gridCols
    const cellHeight = groundHeight / gridRows
    
    // Primera pasada: textura de hierba usando ruido
    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        const baseX = col * cellWidth
        const baseY = this.horizonY + row * cellHeight
        const centerX = baseX + cellWidth * 0.5
        const centerY = baseY + cellHeight * 0.5
        
        // Usar ruido para determinar si esta celda tiene hierba (más orgánico que random)
        const noiseValue = this.fbm(centerX * 0.05, centerY * 0.05, 2)
        if (noiseValue < 0.35) continue // Solo ~35% de celdas tienen hierba
        
        // Variar intensidad basada en ruido
        const intensity = (noiseValue - 0.35) / 0.65 // Normalizar a 0-1
        this.graphics.fillStyle(grassColor, grassAlpha * intensity)
        
        // Crear cluster de hierba usando ruido para posicionamiento
        const clusterSize = 2 + Math.floor(noiseValue * 2)
        for (let c = 0; c < clusterSize; c++) {
          const angle = (c / clusterSize) * Math.PI * 2
          const noiseAngle = this.fbm(centerX * 0.1 + c, centerY * 0.1 + c, 1) * Math.PI * 2
          const distance = this.fbm(centerX * 0.15 + c * 2, centerY * 0.15 + c * 2, 1) * Math.min(cellWidth, cellHeight) * 0.3
          
          const spotX = centerX + Math.cos(angle + noiseAngle) * distance
          const spotY = centerY + Math.sin(angle + noiseAngle) * distance
          const spotSize = 3 + noiseValue * 4
          
          // Elipse con variación sutil
          this.graphics.fillEllipse(spotX, spotY, spotSize, spotSize * (0.7 + noiseValue * 0.1))
        }
      }
    }
    
    // Textura granular usando ruido procedural (más eficiente que líneas individuales)
    const granularSteps = Math.floor(groundHeight / 6)
    this.graphics.fillStyle(0x3A6A4A, 0.08)
    
    for (let step = 0; step < granularSteps; step++) {
      const y = this.horizonY + (groundHeight / granularSteps) * step
      const horizontalSteps = Math.floor(this.width / 12)
      
      for (let h = 0; h < horizontalSteps; h++) {
        const x = (this.width / horizontalSteps) * h
        const noiseValue = this.fbm(x * 0.1, y * 0.1, 1)
        
        // Solo dibujar granos donde el ruido es alto
        if (noiseValue > 0.6) {
          const size = 1 + noiseValue * 1.5
          this.graphics.fillCircle(x, y, size)
        }
      }
    }
    
    // Líneas horizontales sutiles con variación procedural
    this.graphics.lineStyle(0.5, 0x4A7A5A, 0.05)
    const lineSpacing = 10
    for (let y = this.horizonY + 10; y < this.height - 5; y += lineSpacing) {
      // Usar ruido para determinar si dibujar la línea (más orgánico)
      const noiseValue = this.fbm(0, y * 0.05, 1)
      if (noiseValue < 0.4) continue
      
      // Variación de onda más orgánica usando ruido
      const waveOffset = Math.sin(y * 0.03) * 1.5 + this.fbm(y * 0.1, 0, 1) * 2
      this.graphics.moveTo(waveOffset, y)
      this.graphics.lineTo(this.width + waveOffset, y)
      this.graphics.strokePath()
    }
    
    // Detalles orgánicos usando ruido procedural (más distribuidos)
    this.graphics.fillStyle(0x3A6A4A, 0.12)
    const detailDensity = 20
    const detailSpacing = Math.sqrt((this.width * groundHeight) / detailDensity)
    
    for (let row = 0; row < Math.floor(groundHeight / detailSpacing); row++) {
      for (let col = 0; col < Math.floor(this.width / detailSpacing); col++) {
        const x = col * detailSpacing
        const y = this.horizonY + row * detailSpacing
        
        const noiseValue = this.fbm(x * 0.08, y * 0.08, 2)
        if (noiseValue > 0.65) {
          const size = 1.5 + noiseValue * 2
          this.graphics.fillCircle(x, y, size)
        }
      }
    }
  }
}

