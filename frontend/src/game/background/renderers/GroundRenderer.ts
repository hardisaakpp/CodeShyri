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
   * Verifica si un bloque es parte del sendero
   */
  public isPathBlock(gridX: number, gridY: number): boolean {
    const key = `${gridX},${gridY}`
    return this.pathBlocks.get(key) === true
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
    const dirtColor = 0x6A5A3A        // Marrón tierra oscuro
    const borderColor = 0x3A4A3A      // Borde oscuro
    const borderLightColor = 0x6A7A6A // Borde claro (highlight)

    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        const blockX = col * this.cellSize
        const blockY = this.horizonY + row * this.cellSize
        const blockWidth = Math.min(this.cellSize, this.width - blockX)
        const blockHeight = Math.min(this.cellSize, this.height - blockY)

        // Determinar tipo de bloque: sendero, hierba o tierra
        const isPathBlock = this.isPathBlock(col, row)
        
        // Combinación de las 4 propuestas para distribución de bloques verdes/cafés:
        // 1. Probabilidad base
        // 2. Ruido para parches naturales
        // 3. Gradiente vertical (más verde arriba)
        // 4. Parches distribuidos
        
        // Calcular ruido para parches naturales (propuesta 2 y 4)
        const noiseValue = this.fbm(blockX * 0.08, blockY * 0.08, 2)
        
        // Gradiente vertical: factor que decrece con la fila (propuesta 3)
        const maxGrassRows = 5
        const grassDecayFactor = row < maxGrassRows 
          ? Math.max(0, 1 - (row / maxGrassRows)) 
          : 0
        
        // Threshold basado en gradiente y ruido (combina propuesta 2, 3 y 4)
        const baseThreshold = 0.5
        const gradientBonus = grassDecayFactor * 0.25 // Hasta +25% arriba
        const noiseThreshold = baseThreshold + gradientBonus
        
        // Probabilidad adicional para distribución más uniforme (propuesta 1)
        const probabilityBonus = row < 3 ? 0.15 : 0 // Bonus en primeras filas
        
        // Determinar si es bloque de hierba
        const isGrassBlock = !isPathBlock && (
          row === 0 || // Primera fila siempre verde (100%)
          (row < maxGrassRows && (
            noiseValue > noiseThreshold || // Parches basados en ruido
            Math.random() < probabilityBonus // Probabilidad adicional
          ))
        )
        
        let baseColor: number
        if (isPathBlock) {
          baseColor = pathColor // Bloque de sendero (café)
        } else if (isGrassBlock) {
          baseColor = grassTopColor // Bloque de hierba (verde)
        } else {
          baseColor = dirtColor // Bloque de tierra (marrón oscuro)
        }

        // Variación sutil de color usando ruido para hacer más orgánico
        const colorVariation = Math.floor((noiseValue - 0.5) * 8) // -4 a +4

        // Aplicar variación de color
        const r = Math.max(0, Math.min(255, ((baseColor >> 16) & 0xFF) + colorVariation))
        const g = Math.max(0, Math.min(255, ((baseColor >> 8) & 0xFF) + colorVariation))
        const b = Math.max(0, Math.min(255, (baseColor & 0xFF) + colorVariation))
        const finalColor = (r << 16) | (g << 8) | b

        // Dibujar bloque principal
        this.graphics.fillStyle(finalColor, 1)
        this.graphics.fillRect(blockX, blockY, blockWidth, blockHeight)

        // Si es bloque de hierba, agregar textura de hierba en la parte superior
        if (isGrassBlock) {
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

