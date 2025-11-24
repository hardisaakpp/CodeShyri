import type Phaser from 'phaser'

export class GroundRenderer {
  // Seed para ruido determinístico (mejor rendimiento que Math.random)
  private readonly noiseSeed = 12345.6789

  constructor(
    private graphics: Phaser.GameObjects.Graphics,
    private width: number,
    private height: number,
    private horizonY: number
  ) {}

  /**
   * Renderiza el suelo con diseño elegante y textura mejorada
   */
  public render() {
    const groundHeight = this.height - this.horizonY
    
    // Base con gradiente sofisticado mejorado
    this.drawElegantGradient(groundHeight)
    
    // Variación de profundidad con sombras sutiles mejorada
    this.drawDepthVariation(groundHeight)
    
    // Textura mejorada con ruido procedural
    this.drawEnhancedTexture(groundHeight)
    
    // Línea del horizonte refinada
    this.graphics.lineStyle(2, 0x3A5A3A, 0.4)
    this.graphics.moveTo(0, this.horizonY)
    this.graphics.lineTo(this.width, this.horizonY)
    this.graphics.strokePath()
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

