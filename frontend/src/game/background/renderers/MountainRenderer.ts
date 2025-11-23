import type Phaser from 'phaser'

export class MountainRenderer {
  constructor(
    private graphics: Phaser.GameObjects.Graphics,
    private width: number,
    private height: number,
    private horizonY: number
  ) {}

  /**
   * Renderiza las montañas en múltiples capas mejoradas
   */
  public render() {
    // Efecto de niebla atmosférica entre capas
    this.renderAtmosphericFog()
    
    // Montañas muy lejanas - capa 0 (atmosférica) - mejoradas
    this.graphics.fillStyle(0x6A5ACD, 0.6)
    this.drawMountainRange(this.horizonY - 50, 18, 10, 140)
    
    // Gradiente adicional en montañas muy lejanas
    this.graphics.fillStyle(0x8A7BC8, 0.3)
    this.drawMountainGradient(this.horizonY - 50, 18, 140, 'top')

    // Montañas lejanas - capa 1 - mejoradas
    this.graphics.fillStyle(0x6C5CE7, 0.8)
    this.drawMountainRange(this.horizonY - 30, 14, 15, 170)
    
    // Detalles sutiles en montañas lejanas (mejorados)
    this.graphics.fillStyle(0x5A4CD7, 0.5)
    this.drawMountainDetails(this.horizonY - 30, 14, 170)
    
    // Resaltes sutiles en montañas lejanas
    this.graphics.fillStyle(0x7D6CEF, 0.25)
    this.drawMountainHighlights(this.horizonY - 30, 14, 170)

    // Volcán nevado (Cotopaxi) - entre montañas lejanas y medias
    this.renderSnowVolcano()

    // Montañas medias - capa 2 - mejoradas
    this.graphics.fillStyle(0x8E44AD, 0.95)
    this.drawMountainRange(this.horizonY - 10, 12, 22, 120)
    
    // Sombra de las montañas medias (mejorada con gradiente)
    this.graphics.fillStyle(0x5B2C91, 0.75)
    this.drawMountainShadow(this.horizonY - 10, 12, 22)
    
    // Resaltes de luz en montañas medias (mejorados)
    this.graphics.fillStyle(0xA569BD, 0.4)
    this.drawMountainHighlights(this.horizonY - 10, 12, 120)
    
    // Gradiente de luz en montañas medias
    this.graphics.fillStyle(0xB87BCF, 0.25)
    this.drawMountainGradient(this.horizonY - 10, 12, 120, 'right')

    // Montañas cercanas - capa 3 - mejoradas
    this.graphics.fillStyle(0x2ECC71, 1)
    this.drawMountainRange(this.horizonY, 10, 30, 80)
    
    // Sombra de las montañas cercanas (mejorada)
    this.graphics.fillStyle(0x229954, 0.7)
    this.drawMountainShadow(this.horizonY, 10, 30)
    
    // Resaltes de luz en montañas cercanas (mejorados)
    this.graphics.fillStyle(0x52BE80, 0.5)
    this.drawMountainHighlights(this.horizonY, 10, 80)
    
    // Gradiente de luz en montañas cercanas
    this.graphics.fillStyle(0x6BCF8F, 0.3)
    this.drawMountainGradient(this.horizonY, 10, 80, 'right')
    
    // Detalles de textura en las montañas cercanas (mejorados)
    this.drawMountainTextures(this.horizonY, 10, 80)
    
    // Rocas y acantilados en montañas cercanas
    this.drawMountainCliffs(this.horizonY, 10, 80)
  }

  /**
   * Renderiza niebla atmosférica entre capas de montañas
   */
  private renderAtmosphericFog() {
    // Niebla entre montañas lejanas y medias
    this.graphics.fillStyle(0xFFFFFF, 0.15)
    this.graphics.fillRect(0, this.horizonY - 35, this.width, 25)
    
    // Niebla entre montañas medias y cercanas
    this.graphics.fillStyle(0xFFFFFF, 0.1)
    this.graphics.fillRect(0, this.horizonY - 5, this.width, 15)
    
    // Efecto de desvanecimiento suave
    for (let i = 0; i < 3; i++) {
      const fogY = this.horizonY - 20 + i * 10
      const alpha = 0.08 - i * 0.02
      this.graphics.fillStyle(0xE8E8E8, alpha)
      this.graphics.fillRect(0, fogY, this.width, 8)
    }
  }

  /**
   * Dibuja gradientes de luz en las montañas
   */
  private drawMountainGradient(
    baseY: number,
    points: number,
    peakHeight: number,
    side: 'left' | 'right' | 'top'
  ) {
    const seed = baseY * 0.1
    
    for (let i = 0; i < points; i++) {
      const x = (this.width / points) * i + (this.width / points) / 2
      const varAmount = Math.sin(i * 0.5 + seed) * 22
      const currentBaseY = baseY + varAmount
      const peakVariation = 0.6 + Math.sin(i * 0.8 + seed) * 0.4
      const currentPeakY = baseY - peakHeight * peakVariation - Math.abs(varAmount) * 1.8
      
      if (side === 'right') {
        // Gradiente de luz desde la derecha (luz del sol)
        const gradientX = x + 20
        const gradientY = currentBaseY - (currentBaseY - currentPeakY) * (0.3 + Math.random() * 0.4)
        this.graphics.fillCircle(gradientX, gradientY, 15 + Math.random() * 10)
      } else if (side === 'top') {
        // Gradiente de luz desde arriba
        const gradientY = currentPeakY + 10
        this.graphics.fillCircle(x, gradientY, 12 + Math.random() * 8)
      }
    }
  }

  /**
   * Dibuja acantilados y formaciones rocosas en las montañas
   */
  private drawMountainCliffs(
    baseY: number,
    points: number,
    peakHeight: number
  ) {
    const seed = baseY * 0.1
    
    for (let i = 0; i < points * 2; i++) {
      if (Math.random() > 0.6) {
        const x = (this.width / points) * (i / 2) + Math.random() * (this.width / points)
        const varAmount = Math.sin((i / 2) * 0.5 + seed) * 30
        const currentBaseY = baseY + varAmount
        const peakVariation = 0.6 + Math.sin((i / 2) * 0.8 + seed) * 0.4
        const currentPeakY = baseY - peakHeight * peakVariation - Math.abs(varAmount) * 1.8
        
        const cliffY = currentBaseY - (currentBaseY - currentPeakY) * (0.2 + Math.random() * 0.5)
        
        // Acantilado vertical
        this.graphics.fillStyle(0x34495E, 0.6)
        const cliffWidth = 8 + Math.random() * 12
        const cliffHeight = 15 + Math.random() * 25
        
        this.graphics.beginPath()
        this.graphics.moveTo(x, cliffY)
        this.graphics.lineTo(x + cliffWidth, cliffY)
        this.graphics.lineTo(x + cliffWidth * 0.7, cliffY + cliffHeight)
        this.graphics.lineTo(x + cliffWidth * 0.3, cliffY + cliffHeight)
        this.graphics.closePath()
        this.graphics.fillPath()
        
        // Sombra del acantilado
        this.graphics.fillStyle(0x2C3E50, 0.4)
        this.graphics.fillRect(x, cliffY, cliffWidth * 0.4, cliffHeight)
        
        // Resalte en el acantilado
        this.graphics.fillStyle(0x5D6D7E, 0.3)
        this.graphics.fillRect(x + cliffWidth * 0.6, cliffY, cliffWidth * 0.2, cliffHeight * 0.6)
      }
    }
  }

  /**
   * Renderiza un volcán nevado mejorado similar al Cotopaxi
   */
  private renderSnowVolcano() {
    // Posición del volcán (centro-derecha del fondo)
    const volcanoX = this.width * 0.65
    const volcanoBaseY = this.horizonY - 20
    const volcanoWidth = 200 // Ancho de la base (más ancho)
    const volcanoHeight = 240 // Altura total del volcán (más alto)
    const snowLine = volcanoHeight * 0.32 // Línea de nieve (32% desde la cima)
    
    // Cuerpo del volcán (forma cónica mejorada con curvas)
    this.graphics.fillStyle(0x4A4A4A, 0.85) // Gris oscuro para roca volcánica
    this.graphics.beginPath()
    
    // Base izquierda
    this.graphics.moveTo(volcanoX - volcanoWidth / 2, volcanoBaseY)
    
    // Lado izquierdo con curva suave hasta la línea de nieve (usando puntos intermedios)
    const leftSnowX = volcanoX - (volcanoWidth / 2) * (1 - snowLine / volcanoHeight)
    const leftSnowY = volcanoBaseY - snowLine
    
    // Aproximar curva con puntos intermedios
    const steps1 = 4
    for (let step = 1; step <= steps1; step++) {
      const t = step / steps1
      const interpX = volcanoX - volcanoWidth / 2 + (leftSnowX - (volcanoX - volcanoWidth / 2)) * (t * t)
      const interpY = volcanoBaseY - (volcanoBaseY - leftSnowY) * (t * t)
      this.graphics.lineTo(interpX, interpY)
    }
    
    // Lado izquierdo desde la línea de nieve hasta la cima
    const steps2 = 4
    for (let step = 1; step <= steps2; step++) {
      const t = step / steps2
      const interpX = leftSnowX + (volcanoX - leftSnowX) * (t * t)
      const interpY = leftSnowY - (leftSnowY - (volcanoBaseY - volcanoHeight)) * (t * t)
      this.graphics.lineTo(interpX, interpY)
    }
    
    // Lado derecho desde la cima hasta la línea de nieve
    const rightSnowX = volcanoX + (volcanoWidth / 2) * (1 - snowLine / volcanoHeight)
    const rightSnowY = volcanoBaseY - snowLine
    const steps3 = 4
    for (let step = 1; step <= steps3; step++) {
      const t = step / steps3
      const interpX = volcanoX + (rightSnowX - volcanoX) * (t * t)
      const interpY = (volcanoBaseY - volcanoHeight) + (rightSnowY - (volcanoBaseY - volcanoHeight)) * (t * t)
      this.graphics.lineTo(interpX, interpY)
    }
    
    // Lado derecho desde la línea de nieve hasta la base
    const steps4 = 4
    for (let step = 1; step <= steps4; step++) {
      const t = step / steps4
      const interpX = rightSnowX + (volcanoX + volcanoWidth / 2 - rightSnowX) * (t * t)
      const interpY = rightSnowY + (volcanoBaseY - rightSnowY) * (t * t)
      this.graphics.lineTo(interpX, interpY)
    }
    
    // Cerrar la base
    this.graphics.closePath()
    this.graphics.fillPath()
    
    // Sombra mejorada en el lado izquierdo del volcán
    this.graphics.fillStyle(0x2C2C2C, 0.7)
    this.graphics.beginPath()
    this.graphics.moveTo(volcanoX - volcanoWidth / 2, volcanoBaseY)
    const shadowSteps = 4
    for (let step = 1; step <= shadowSteps; step++) {
      const t = step / shadowSteps
      const interpX = volcanoX - volcanoWidth / 2 + (leftSnowX - (volcanoX - volcanoWidth / 2)) * (t * t)
      const interpY = volcanoBaseY - (volcanoBaseY - leftSnowY) * (t * t)
      this.graphics.lineTo(interpX, interpY)
    }
    this.graphics.lineTo(volcanoX - volcanoWidth / 3, volcanoBaseY - snowLine * 0.6)
    this.graphics.lineTo(volcanoX - volcanoWidth / 2, volcanoBaseY)
    this.graphics.closePath()
    this.graphics.fillPath()
    
    // Capa de nieve en la cima mejorada (blanca con gradiente)
    this.graphics.fillStyle(0xFFFFFF, 0.98)
    this.graphics.beginPath()
    this.graphics.moveTo(leftSnowX, leftSnowY)
    const snowSteps1 = 4
    for (let step = 1; step <= snowSteps1; step++) {
      const t = step / snowSteps1
      const interpX = leftSnowX + (volcanoX - leftSnowX) * (t * t)
      const interpY = leftSnowY - (leftSnowY - (volcanoBaseY - volcanoHeight)) * (t * t)
      this.graphics.lineTo(interpX, interpY)
    }
    const snowSteps2 = 4
    for (let step = 1; step <= snowSteps2; step++) {
      const t = step / snowSteps2
      const interpX = volcanoX + (rightSnowX - volcanoX) * (t * t)
      const interpY = (volcanoBaseY - volcanoHeight) + (rightSnowY - (volcanoBaseY - volcanoHeight)) * (t * t)
      this.graphics.lineTo(interpX, interpY)
    }
    
    // Borde inferior de la nieve con forma más irregular y natural
    const snowPoints = 12
    for (let i = 0; i <= snowPoints; i++) {
      const t = i / snowPoints
      const x = leftSnowX + (rightSnowX - leftSnowX) * t
      // Usar múltiples ondas sinusoidales para crear una forma más natural
      const y = leftSnowY + Math.sin(t * Math.PI) * 10 + 
                Math.sin(t * Math.PI * 3) * 4 + 
                Math.sin(t * Math.PI * 5) * 2
      this.graphics.lineTo(x, y)
    }
    
    this.graphics.closePath()
    this.graphics.fillPath()
    
    // Detalles de nieve más brillante en la cima (mejorados)
    this.graphics.fillStyle(0xE8F4F8, 0.9)
    this.graphics.fillCircle(volcanoX, volcanoBaseY - volcanoHeight + 12, 28)
    this.graphics.fillCircle(volcanoX - 12, volcanoBaseY - volcanoHeight + 18, 18)
    this.graphics.fillCircle(volcanoX + 12, volcanoBaseY - volcanoHeight + 18, 18)
    this.graphics.fillCircle(volcanoX - 6, volcanoBaseY - volcanoHeight + 8, 12)
    this.graphics.fillCircle(volcanoX + 6, volcanoBaseY - volcanoHeight + 8, 12)
    
    // Resaltes de luz mejorados en el lado derecho (efecto de sol)
    this.graphics.fillStyle(0x6A6A6A, 0.6)
    this.graphics.beginPath()
    this.graphics.moveTo(volcanoX + volcanoWidth / 3, volcanoBaseY - snowLine * 0.4)
    const highlightSteps1 = 4
    for (let step = 1; step <= highlightSteps1; step++) {
      const t = step / highlightSteps1
      const interpX = volcanoX + volcanoWidth / 3 + (rightSnowX - (volcanoX + volcanoWidth / 3)) * (t * t)
      const interpY = volcanoBaseY - snowLine * 0.4 - (volcanoBaseY - snowLine * 0.4 - rightSnowY) * (t * t)
      this.graphics.lineTo(interpX, interpY)
    }
    const highlightSteps2 = 4
    for (let step = 1; step <= highlightSteps2; step++) {
      const t = step / highlightSteps2
      const interpX = rightSnowX + (volcanoX - rightSnowX) * (t * t)
      const interpY = rightSnowY - (rightSnowY - (volcanoBaseY - volcanoHeight)) * (t * t)
      this.graphics.lineTo(interpX, interpY)
    }
    this.graphics.lineTo(volcanoX + volcanoWidth / 3, volcanoBaseY - snowLine * 0.4)
    this.graphics.closePath()
    this.graphics.fillPath()
    
    // Detalles de textura en el volcán (grietas, rocas)
    this.graphics.fillStyle(0x3A3A3A, 0.4)
    for (let i = 0; i < 8; i++) {
      const detailX = volcanoX - volcanoWidth / 4 + Math.random() * (volcanoWidth / 2)
      const detailY = volcanoBaseY - snowLine - Math.random() * (volcanoHeight - snowLine) * 0.5
      this.graphics.fillCircle(detailX, detailY, 3 + Math.random() * 5)
    }
  }

  /**
   * Dibuja una cadena de montañas mejorada con formas más naturales y variadas
   */
  private drawMountainRange(
    baseY: number,
    points: number,
    variation: number,
    peakHeight: number
  ) {
    this.graphics.beginPath()
    this.graphics.moveTo(0, baseY)
    
    const mountainPoints: { x: number, y: number }[] = []
    mountainPoints.push({ x: 0, y: baseY })
    
    // Semilla para variación consistente pero aleatoria
    const seed = baseY * 0.1
    
    for (let i = 0; i <= points; i++) {
      const x = (this.width / points) * i
      // Variación más natural usando múltiples ondas con diferentes frecuencias
      const varAmount = Math.sin(i * 0.5 + seed) * variation + 
                       Math.cos(i * 0.3 + seed * 0.7) * (variation * 0.6) +
                       Math.sin(i * 1.2 + seed * 1.3) * (variation * 0.4) +
                       Math.cos(i * 2.1 + seed * 0.5) * (variation * 0.2)
      const currentBaseY = baseY + varAmount
      
      // Altura variable de picos para más realismo (más variación)
      const peakVariation = 0.6 + Math.sin(i * 0.8 + seed) * 0.4
      const secondaryPeak = Math.sin(i * 1.5 + seed * 2) * 0.15
      const currentPeakY = baseY - peakHeight * (peakVariation + secondaryPeak) - Math.abs(varAmount) * 1.8
      const midX = x + (this.width / points) / 2
      
      if (i < points) {
        // Crear picos más suaves y naturales con múltiples puntos intermedios
        if (i > 0) {
          const prevPoint = mountainPoints[mountainPoints.length - 1]
          
          // Subida al pico con curva más natural (usando easing)
          const steps = 4
          for (let step = 1; step <= steps; step++) {
            const t = step / steps
            // Easing cuadrático para subida más natural
            const easedT = t * t
            const interpX = prevPoint.x + (midX - prevPoint.x) * easedT
            // Variación en la altura para crear formas más interesantes
            const heightVariation = Math.sin(t * Math.PI) * 3
            const interpY = prevPoint.y + (currentPeakY - prevPoint.y) * easedT - heightVariation
            this.graphics.lineTo(interpX, interpY)
          }
          
          // Descenso desde el pico con variación natural
          const nextX = x + (this.width / points)
          const nextVar = Math.sin((i + 1) * 0.5 + seed) * variation + 
                         Math.cos((i + 1) * 0.3 + seed * 0.7) * (variation * 0.6)
          const nextBaseY = baseY + nextVar
          
          for (let step = 1; step <= steps; step++) {
            const t = step / steps
            // Easing para descenso más suave
            const easedT = 1 - (1 - t) * (1 - t)
            const interpX = midX + (nextX - midX) * easedT
            // Pequeña variación para hacer el descenso más interesante
            const descentVariation = Math.sin(t * Math.PI * 0.5) * 2
            const interpY = currentPeakY + (nextBaseY - currentPeakY) * easedT + descentVariation
            this.graphics.lineTo(interpX, interpY)
          }
        } else {
          this.graphics.lineTo(midX, currentPeakY)
          this.graphics.lineTo(x + (this.width / points), currentBaseY)
        }
        
        mountainPoints.push({ x: midX, y: currentPeakY })
        mountainPoints.push({ x: x + (this.width / points), y: currentBaseY })
      }
    }
    
    if (baseY === this.horizonY) {
      this.graphics.lineTo(this.width, this.height)
      this.graphics.lineTo(0, this.height)
    } else {
      this.graphics.lineTo(this.width, baseY)
    }
    
    this.graphics.closePath()
    this.graphics.fillPath()
  }
  
  /**
   * Dibuja detalles sutiles mejorados en las montañas (grietas, rocas, formaciones)
   */
  private drawMountainDetails(
    baseY: number,
    points: number,
    peakHeight: number
  ) {
    const seed = baseY * 0.1
    
    for (let i = 0; i < points; i++) {
      const x = (this.width / points) * i + (this.width / points) / 2
      const varAmount = Math.sin(i * 0.5 + seed) * 15
      const peakVariation = 0.6 + Math.sin(i * 0.8 + seed) * 0.4
      const currentBaseY = baseY + varAmount
      const currentPeakY = baseY - peakHeight * peakVariation - Math.abs(varAmount) * 1.8
      
      // Dibujar líneas de detalle (grietas) mejoradas
      if (Math.random() > 0.65) {
        const detailY = currentBaseY - (currentBaseY - currentPeakY) * (0.25 + Math.random() * 0.45)
        const crackLength = 8 + Math.random() * 12
        const crackAngle = (Math.random() - 0.5) * 0.5
        
        this.graphics.lineStyle(1.2, 0x4A4A4A, 0.25)
        this.graphics.moveTo(x - crackLength * 0.5, detailY)
        this.graphics.lineTo(x + crackLength * 0.5, detailY + crackLength * Math.sin(crackAngle))
        this.graphics.strokePath()
        
        // Pequeñas ramificaciones de la grieta
        if (Math.random() > 0.5) {
          this.graphics.lineStyle(0.8, 0x4A4A4A, 0.15)
          this.graphics.moveTo(x, detailY + crackLength * 0.3 * Math.sin(crackAngle))
          this.graphics.lineTo(x + (Math.random() - 0.5) * 6, detailY + crackLength * 0.5 * Math.sin(crackAngle))
          this.graphics.strokePath()
        }
      }
      
      // Pequeñas formaciones rocosas
      if (Math.random() > 0.8) {
        const rockY = currentBaseY - (currentBaseY - currentPeakY) * (0.2 + Math.random() * 0.6)
        this.graphics.fillStyle(0x5A5A5A, 0.3)
        this.graphics.fillCircle(x + (Math.random() - 0.5) * 15, rockY, 2 + Math.random() * 4)
      }
    }
  }
  
  /**
   * Dibuja resaltes de luz en las montañas
   */
  private drawMountainHighlights(
    baseY: number,
    points: number,
    peakHeight: number
  ) {
    for (let i = 0; i < points; i++) {
      const x = (this.width / points) * i + (this.width / points) / 2
      const varAmount = Math.sin(i * 0.5) * 18
      const currentBaseY = baseY + varAmount
      const currentPeakY = baseY - peakHeight - Math.abs(varAmount) * 1.5
      
      // Resaltes en el lado derecho (luz del sol)
      const highlightX = x + 15
      const highlightY = currentBaseY - (currentBaseY - currentPeakY) * (0.4 + Math.random() * 0.3)
      
      this.graphics.fillCircle(highlightX, highlightY, 8 + Math.random() * 12)
    }
  }
  
  /**
   * Dibuja texturas mejoradas en las montañas cercanas
   */
  private drawMountainTextures(
    baseY: number,
    points: number,
    peakHeight: number
  ) {
    const seed = baseY * 0.1
    
    // Texturas de rocas mejoradas
    for (let i = 0; i < 35; i++) {
      const x = Math.random() * this.width
      const varAmount = Math.sin((x / this.width) * points * 0.5 + seed) * 30
      const currentBaseY = baseY + varAmount
      const peakVariation = 0.6 + Math.sin((x / this.width) * points * 0.8 + seed) * 0.4
      const currentPeakY = baseY - peakHeight * peakVariation - Math.abs(varAmount) * 1.8
      
      if (x >= 0 && x <= this.width) {
        const y = currentBaseY - (currentBaseY - currentPeakY) * (0.15 + Math.random() * 0.65)
        
        // Rocas con más variación
        if (Math.random() > 0.4) {
          const rockSize = 3 + Math.random() * 8
          this.graphics.fillStyle(0x34495E, 0.6)
          this.graphics.fillCircle(x, y, rockSize)
          
          // Sombra de la roca
          this.graphics.fillStyle(0x2C3E50, 0.4)
          this.graphics.fillCircle(x - rockSize * 0.3, y + rockSize * 0.2, rockSize * 0.7)
          
          // Resalte de la roca
          this.graphics.fillStyle(0x5D6D7E, 0.3)
          this.graphics.fillCircle(x + rockSize * 0.2, y - rockSize * 0.2, rockSize * 0.5)
        } else {
          // Vegetación mejorada
          const vegSize = 2 + Math.random() * 6
          const vegColors = [0x27AE60, 0x229954, 0x1E8449, 0x2ECC71]
          const vegColor = vegColors[Math.floor(Math.random() * vegColors.length)]
          
          this.graphics.fillStyle(vegColor, 0.4)
          this.graphics.fillCircle(x, y, vegSize)
          
          // Variación en la vegetación (múltiples círculos para arbustos)
          if (Math.random() > 0.7) {
            this.graphics.fillCircle(x + vegSize * 0.5, y, vegSize * 0.8)
            this.graphics.fillCircle(x - vegSize * 0.5, y, vegSize * 0.8)
            this.graphics.fillCircle(x, y - vegSize * 0.5, vegSize * 0.7)
          }
        }
      }
    }
    
    // Líneas de grietas y formaciones geológicas
    for (let i = 0; i < 8; i++) {
      const startX = Math.random() * this.width
      const varAmount = Math.sin((startX / this.width) * points * 0.5 + seed) * 30
      const currentBaseY = baseY + varAmount
      const peakVariation = 0.6 + Math.sin((startX / this.width) * points * 0.8 + seed) * 0.4
      const currentPeakY = baseY - peakHeight * peakVariation - Math.abs(varAmount) * 1.8
      
      const startY = currentBaseY - (currentBaseY - currentPeakY) * (0.3 + Math.random() * 0.5)
      const endX = startX + (Math.random() - 0.5) * 40
      const endY = startY + 10 + Math.random() * 20
      
      this.graphics.lineStyle(1.5, 0x2C3E50, 0.3)
      this.graphics.moveTo(startX, startY)
      this.graphics.lineTo(endX, endY)
      this.graphics.strokePath()
    }
  }

  /**
   * Dibuja la sombra de las montañas mejorada
   */
  private drawMountainShadow(
    baseY: number,
    points: number,
    variation: number
  ) {
    this.graphics.beginPath()
    this.graphics.moveTo(0, baseY)
    
    for (let i = 0; i <= points; i++) {
      const x = (this.width / points) * i
      const varAmount = Math.sin(i * 0.8) * variation + 
                       Math.cos(i * 0.3) * (variation * 0.5) +
                       Math.sin(i * 1.2) * (variation * 0.3)
      const currentBaseY = baseY + varAmount
      
      // Sombra más realista con gradiente de profundidad
      const shadowDepth = 12 + Math.abs(varAmount) * 0.3
      const shadowY = currentBaseY + shadowDepth
      const midX = x + (this.width / points) / 2
      
      if (i === 0) {
        this.graphics.lineTo(x, shadowY)
      }
      if (i < points) {
        // Usar múltiples puntos para crear sombra suave
        if (i > 0) {
          const prevX = (this.width / points) * (i - 1) + (this.width / points) / 2
          const prevVar = Math.sin((i - 1) * 0.8) * variation + 
                         Math.cos((i - 1) * 0.3) * (variation * 0.5) +
                         Math.sin((i - 1) * 1.2) * (variation * 0.3)
          const prevShadowY = baseY + prevVar + 12 + Math.abs(prevVar) * 0.3
          
          // Puntos intermedios para suavidad
          const steps = 2
          for (let step = 1; step <= steps; step++) {
            const t = step / steps
            const interpX = prevX + (midX - prevX) * t
            const interpY = prevShadowY + (shadowY - prevShadowY) * t
            this.graphics.lineTo(interpX, interpY)
          }
        } else {
          this.graphics.lineTo(midX, shadowY)
        }
        
        const nextX = x + (this.width / points)
        const nextVar = Math.sin((i + 1) * 0.8) * variation + 
                       Math.cos((i + 1) * 0.3) * (variation * 0.5) +
                       Math.sin((i + 1) * 1.2) * (variation * 0.3)
        const nextShadowY = baseY + nextVar + 12 + Math.abs(nextVar) * 0.3
        
        const steps = 2
        for (let step = 1; step <= steps; step++) {
          const t = step / steps
          const interpX = midX + (nextX - midX) * t
          const interpY = shadowY + (nextShadowY - shadowY) * t
          this.graphics.lineTo(interpX, interpY)
        }
      }
    }
    
    this.graphics.lineTo(this.width, this.horizonY + 8)
    this.graphics.lineTo(this.width, baseY)
    this.graphics.closePath()
    this.graphics.fillPath()
  }
}

