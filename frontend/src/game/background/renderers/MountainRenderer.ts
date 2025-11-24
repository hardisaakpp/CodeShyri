import type Phaser from 'phaser'

export class MountainRenderer {
  private cloudElements: Phaser.GameObjects.Graphics[] = []

  constructor(
    private graphics: Phaser.GameObjects.Graphics,
    private scene: Phaser.Scene,
    private width: number,
    private height: number,
    private horizonY: number
  ) {}

  /**
   * Renderiza las montañas en múltiples capas con diseño de bosque mágico
   * Versión mejorada con colores vibrantes y formas más variadas
   */
  public render() {
    // Efecto de niebla atmosférica entre capas (más sutil)
    this.renderAtmosphericFog()
    
    // Montañas muy lejanas - capa 0 - Púrpura violeta vibrante con toques rosa y azul
    this.graphics.fillStyle(0x7A5B9C, 0.75) // Púrpura vibrante
    this.drawAndeanMountainRange(this.horizonY - 28, 14, 8, 85)
    
    // Gradiente de color púrpura a rosa en montañas muy lejanas
    this.graphics.fillStyle(0x9A7BBC, 0.4) // Púrpura claro
    this.drawMountainGradient(this.horizonY - 28, 14, 85, 'top')
    
    // Gradiente adicional con toque rosa
    this.graphics.fillStyle(0xB899D8, 0.3) // Rosa púrpura
    this.drawMountainGradient(this.horizonY - 28, 14, 85, 'left')

    // Montañas lejanas - capa 1 - Azul turquesa vibrante con toques esmeralda
    this.graphics.fillStyle(0x4A8CBC, 0.9) // Azul turquesa brillante
    this.drawAndeanMountainRange(this.horizonY - 17, 12, 12, 100)
    
    // Gradiente azul cielo
    this.graphics.fillStyle(0x6AA8D4, 0.45) // Azul cielo claro
    this.drawMountainGradient(this.horizonY - 17, 12, 100, 'top')
    
    // Nubes mágicas animadas en montañas lejanas (con toque azulado)
    this.drawSnowCaps(this.horizonY - 17, 12, 100, 0xE4F0FF, 0.95)
    
    // Resaltes vibrantes en tonos esmeralda
    this.graphics.fillStyle(0x5AB8D4, 0.35)
    this.drawMountainHighlights(this.horizonY - 17, 12, 100)
    
    // Gradiente adicional con toque verde esmeralda
    this.graphics.fillStyle(0x4AC8BC, 0.25)
    this.drawMountainGradient(this.horizonY - 17, 12, 100, 'right')

    // Montañas medias - capa 2 - Verde esmeralda brillante con toques turquesa
    // Excluir zona del volcán (centro-derecha alrededor del 65% del ancho)
    // El color base ya no se usa, cada montaña tiene su propio color
    this.drawAndeanMountainRange(this.horizonY - 6, 10, 18, 72, {
      excludeZone: { centerX: this.width * 0.65, width: 220 }
    })
    
    // Capa de gradiente turquesa sobre verde
    this.graphics.fillStyle(0x4ABC8A, 0.5) // Turquesa esmeralda
    this.drawMountainGradient(this.horizonY - 6, 10, 72, 'top')
    
    // Sombra mágica de las montañas medias (más profunda)
    this.graphics.fillStyle(0x2A8C5A, 0.7)
    this.drawMountainShadow(this.horizonY - 6, 10, 18)
    
    // Nubes mágicas animadas en montañas medias
    this.drawSnowCaps(this.horizonY - 6, 10, 72, 0xF0F8FF, 0.98)
    
    // Resaltes de luz mágica en tonos verde claro
    this.graphics.fillStyle(0x5ACC9A, 0.5)
    this.drawMountainHighlights(this.horizonY - 6, 10, 72)
    
    // Gradiente de luz mágica con toque azul
    this.graphics.fillStyle(0x6ADCAA, 0.35)
    this.drawMountainGradient(this.horizonY - 6, 10, 72, 'right')
    
    // Gradiente adicional con toque amarillo verdoso
    this.graphics.fillStyle(0x7AECBA, 0.25)
    this.drawMountainGradient(this.horizonY - 6, 10, 72, 'left')

    // Volcán Cotopaxi nevado - colorido con tonos púrpura y azul (renderizado después de las montañas medias para que esté delante)
    this.renderMagicVolcano()

    // Montañas cercanas - capa 3 - Verde jade vibrante con toques púrpura y azul
    this.graphics.fillStyle(0x4AAC7B, 1) // Verde jade brillante
    this.drawAndeanMountainRange(this.horizonY, 8, 25, 50)
    
    // Capa de gradiente con toque púrpura
    this.graphics.fillStyle(0x6ACCAB, 0.45) // Verde jade claro
    this.drawMountainGradient(this.horizonY, 8, 50, 'top')
    
    // Gradiente con toque púrpura mágico
    this.graphics.fillStyle(0x8A9CD4, 0.3) // Púrpura azulado
    this.drawMountainGradient(this.horizonY, 8, 50, 'left')
    
    // Sombra mágica de las montañas cercanas (más profunda)
    this.graphics.fillStyle(0x3A9C6B, 0.75)
    this.drawMountainShadow(this.horizonY, 8, 25)
    
    // Resaltes de luz mágica en múltiples colores
    this.graphics.fillStyle(0x6AEC9B, 0.55) // Verde brillante
    this.drawMountainHighlights(this.horizonY, 8, 50)
    
    // Resaltes adicionales con toque azul
    this.graphics.fillStyle(0x7ACCF8, 0.3) // Azul claro
    this.drawMountainHighlights(this.horizonY, 8, 50)
    
    // Gradiente de luz mágica
    this.graphics.fillStyle(0x8AECCB, 0.4)
    this.drawMountainGradient(this.horizonY, 8, 50, 'right')
    
    // Detalles de textura mágica con colores vibrantes
    this.drawMagicMountainTextures(this.horizonY, 8, 50)
    
    return this.cloudElements
  }

  /**
   * Renderiza niebla atmosférica entre capas de montañas (más sutil)
   */
  private renderAtmosphericFog() {
    // Niebla entre montañas lejanas y medias (reducida y ajustada)
    this.graphics.fillStyle(0xFFFFFF, 0.08)
    this.graphics.fillRect(0, this.horizonY - 20, this.width, 12)
    
    // Niebla entre montañas medias y cercanas (reducida y ajustada)
    this.graphics.fillStyle(0xFFFFFF, 0.06)
    this.graphics.fillRect(0, this.horizonY - 3, this.width, 8)
    
    // Efecto de desvanecimiento suave (reducido y ajustado)
    for (let i = 0; i < 2; i++) {
      const fogY = this.horizonY - 12 + i * 8
      const alpha = 0.05 - i * 0.015
      this.graphics.fillStyle(0xE8E8E8, alpha)
      this.graphics.fillRect(0, fogY, this.width, 4)
    }
  }

  /**
   * Dibuja gradientes de luz en las montañas con mayor variedad
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
        // Gradiente de luz desde la derecha (luz del sol) - múltiples círculos
        const gradientX = x + 15 + Math.random() * 10
        const gradientY = currentBaseY - (currentBaseY - currentPeakY) * (0.25 + Math.random() * 0.5)
        // Círculo principal
        this.graphics.fillCircle(gradientX, gradientY, 18 + Math.random() * 12)
        // Círculo secundario para suavizar
        this.graphics.fillCircle(gradientX + 8, gradientY - 5, 10 + Math.random() * 8)
      } else if (side === 'top') {
        // Gradiente de luz desde arriba - múltiples círculos
        const gradientY = currentPeakY + 8 + Math.random() * 5
        this.graphics.fillCircle(x, gradientY, 15 + Math.random() * 10)
        // Círculo adicional para mayor suavidad
        this.graphics.fillCircle(x + (Math.random() - 0.5) * 12, gradientY + 5, 8 + Math.random() * 6)
      } else if (side === 'left') {
        // Gradiente de luz desde la izquierda
        const gradientX = x - 15 - Math.random() * 10
        const gradientY = currentBaseY - (currentBaseY - currentPeakY) * (0.3 + Math.random() * 0.4)
        this.graphics.fillCircle(gradientX, gradientY, 16 + Math.random() * 10)
        // Círculo secundario
        this.graphics.fillCircle(gradientX - 8, gradientY - 5, 9 + Math.random() * 7)
      }
    }
  }

  /**
   * Renderiza el volcán Cotopaxi nevado con colores vibrantes
   */
  private renderMagicVolcano() {
    // Posición del volcán (centro-derecha del fondo, reducido proporcionalmente)
    const volcanoX = this.width * 0.65
    const volcanoBaseY = this.horizonY - 12
    const volcanoWidth = 180 // Aumentado para hacerlo más grande
    const volcanoHeight = 190 // Aumentado para hacerlo más grande
    const snowLine = volcanoHeight * 0.32 // Línea de nieve (32% desde la cima)
    
    // Cuerpo del volcán con color púrpura oscuro y azul (roca volcánica mágica)
    this.graphics.fillStyle(0x5A4A7A, 0.9) // Púrpura oscuro
    this.graphics.beginPath()
    this.graphics.moveTo(volcanoX - volcanoWidth / 2, volcanoBaseY)
    
    const leftSnowX = volcanoX - (volcanoWidth / 2) * (1 - snowLine / volcanoHeight)
    const leftSnowY = volcanoBaseY - snowLine
    
    const steps1 = 4
    for (let step = 1; step <= steps1; step++) {
      const t = step / steps1
      const interpX = volcanoX - volcanoWidth / 2 + (leftSnowX - (volcanoX - volcanoWidth / 2)) * (t * t)
      const interpY = volcanoBaseY - (volcanoBaseY - leftSnowY) * (t * t)
      this.graphics.lineTo(interpX, interpY)
    }
    
    const steps2 = 4
    for (let step = 1; step <= steps2; step++) {
      const t = step / steps2
      const interpX = leftSnowX + (volcanoX - leftSnowX) * (t * t)
      const interpY = leftSnowY - (leftSnowY - (volcanoBaseY - volcanoHeight)) * (t * t)
      this.graphics.lineTo(interpX, interpY)
    }
    
    const rightSnowX = volcanoX + (volcanoWidth / 2) * (1 - snowLine / volcanoHeight)
    const rightSnowY = volcanoBaseY - snowLine
    const steps3 = 4
    for (let step = 1; step <= steps3; step++) {
      const t = step / steps3
      const interpX = volcanoX + (rightSnowX - volcanoX) * (t * t)
      const interpY = (volcanoBaseY - volcanoHeight) + (rightSnowY - (volcanoBaseY - volcanoHeight)) * (t * t)
      this.graphics.lineTo(interpX, interpY)
    }
    
    const steps4 = 4
    for (let step = 1; step <= steps4; step++) {
      const t = step / steps4
      const interpX = rightSnowX + (volcanoX + volcanoWidth / 2 - rightSnowX) * (t * t)
      const interpY = rightSnowY + (volcanoBaseY - rightSnowY) * (t * t)
      this.graphics.lineTo(interpX, interpY)
    }
    
    this.graphics.closePath()
    this.graphics.fillPath()
    
    // Capa de gradiente con toque azul
    this.graphics.fillStyle(0x6A5A9A, 0.6)
    this.graphics.beginPath()
    this.graphics.moveTo(volcanoX - volcanoWidth / 3, volcanoBaseY - snowLine * 0.3)
    const gradientSteps = 4
    for (let step = 1; step <= gradientSteps; step++) {
      const t = step / gradientSteps
      const interpX = volcanoX - volcanoWidth / 3 + (volcanoX + volcanoWidth / 3 - (volcanoX - volcanoWidth / 3)) * t
      const interpY = volcanoBaseY - snowLine * 0.3 - (volcanoBaseY - snowLine * 0.3 - (volcanoBaseY - volcanoHeight * 0.6)) * t
      this.graphics.lineTo(interpX, interpY)
    }
    this.graphics.lineTo(volcanoX - volcanoWidth / 3, volcanoBaseY - snowLine * 0.3)
    this.graphics.closePath()
    this.graphics.fillPath()
    
    // Sombra del volcán con toque púrpura
    this.graphics.fillStyle(0x3A2A5A, 0.7)
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
    
    // Capa de nieve en la cima del Cotopaxi (blanca con gradiente)
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
    
    // Borde inferior de la nieve con forma irregular y natural
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
    
    // Detalles de nieve más brillante en la cima (ajustados al tamaño mayor)
    this.graphics.fillStyle(0xE8F4F8, 0.9)
    this.graphics.fillCircle(volcanoX, volcanoBaseY - volcanoHeight + 15, 35)
    this.graphics.fillCircle(volcanoX - 15, volcanoBaseY - volcanoHeight + 22, 22)
    this.graphics.fillCircle(volcanoX + 15, volcanoBaseY - volcanoHeight + 22, 22)
    this.graphics.fillCircle(volcanoX - 8, volcanoBaseY - volcanoHeight + 10, 15)
    this.graphics.fillCircle(volcanoX + 8, volcanoBaseY - volcanoHeight + 10, 15)
    
    // Resaltes de luz en el lado derecho (efecto de sol) con toque azul
    this.graphics.fillStyle(0x7A8ABC, 0.65)
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
  }

  /**
   * Dibuja una cadena de montañas con estilo andino: picos más angulares y dramáticos
   * Cada montaña tiene un color diferente para mayor variedad visual
   * @param excludeZone Zona opcional a excluir (para evitar que montañas cubran elementos como el volcán)
   */
  private drawAndeanMountainRange(
    baseY: number,
    points: number,
    variation: number,
    peakHeight: number,
    options?: { excludeZone?: { centerX: number; width: number }; baseColor?: number }
  ) {
    const seed = baseY * 0.1
    const excludeZone = options?.excludeZone
    const excludeMinX = excludeZone ? excludeZone.centerX - excludeZone.width / 2 : -1
    const excludeMaxX = excludeZone ? excludeZone.centerX + excludeZone.width / 2 : -1
    
    // Paleta de colores vibrantes variados
    const colorPalette = [
      0x8A6BA8, 0x9A7BB8, 0x6A9BCC, 0x7AABDC, 0x4A9CBC, 
      0x5AAC8C, 0x6ABC9C, 0x4A9C7C, 0x3A8C6C, 0x7A8BAC,
      0x8A7BAC, 0x5AACAC, 0x4A9C9C, 0x9A6BA8, 0x5A8BBC
    ]
    
    // Calcular todos los puntos primero
    const mountainPoints: Array<{ x: number; y: number; baseY: number; peakY: number; color: number }> = []
    
    for (let i = 0; i <= points; i++) {
      const x = (this.width / points) * i
      const midX = x + (this.width / points) / 2
      
      const isInExcludeZone = excludeZone && (midX >= excludeMinX && midX <= excludeMaxX)
      let heightMultiplier = 1.0
      if (isInExcludeZone) {
        const distanceFromCenter = Math.abs(midX - excludeZone!.centerX)
        const normalizedDistance = distanceFromCenter / (excludeZone!.width / 2)
        heightMultiplier = Math.max(0.2, normalizedDistance * 0.8)
      }
      
      const varAmount = Math.sin(i * 0.5 + seed) * variation + 
                       Math.cos(i * 0.3 + seed * 0.7) * (variation * 0.6) +
                       Math.sin(i * 1.2 + seed * 1.3) * (variation * 0.4)
      const currentBaseY = baseY + varAmount
      
      const peakVariation = 0.4 + Math.sin(i * 0.7 + seed) * 0.6
      const secondaryPeak = Math.sin(i * 1.8 + seed * 2) * 0.25
      const tertiaryPeak = Math.cos(i * 2.5 + seed * 1.5) * 0.2
      const quaternaryPeak = Math.sin(i * 3.2 + seed * 0.8) * 0.15
      const adjustedPeakHeight = peakHeight * heightMultiplier
      const currentPeakY = baseY - adjustedPeakHeight * (peakVariation + secondaryPeak + tertiaryPeak + quaternaryPeak) - Math.abs(varAmount) * 2.5
      
      // Seleccionar color para este punto
      const colorIndex = Math.floor((i * 2.3 + seed * 5) % colorPalette.length)
      const mountainColor = colorPalette[colorIndex]
      
      mountainPoints.push({ x: midX, y: currentBaseY, baseY: currentBaseY, peakY: currentPeakY, color: mountainColor })
    }
    
    // Dibujar cada segmento de montaña con su color
    for (let i = 0; i < points; i++) {
      const current = mountainPoints[i]
      const next = mountainPoints[i + 1]
      
      this.graphics.fillStyle(current.color, 1)
      this.graphics.beginPath()
      
      const segmentStartX = i === 0 ? 0 : (current.x + mountainPoints[i - 1].x) / 2
      const segmentEndX = i === points - 1 ? this.width : (current.x + next.x) / 2
      
      this.graphics.moveTo(segmentStartX, current.baseY)
      
      // Subida hacia el pico
      const steps = 4
      for (let step = 1; step <= steps; step++) {
        const t = step / steps
        const easedT = t * t * t
        const interpX = segmentStartX + (current.x - segmentStartX) * easedT
        const heightVariation = Math.sin(t * Math.PI) * 6 + 
                              Math.sin(t * Math.PI * 3) * 2.5 + 
                              Math.sin(t * Math.PI * 5) * 1.2
        const interpY = current.baseY + (current.peakY - current.baseY) * easedT - heightVariation
        
        if ((step === Math.floor(steps / 3) || step === Math.floor(steps * 2 / 3)) && Math.random() > 0.7) {
          const ridgeHeight = 8 + Math.random() * 10
          const ridgeY = interpY - ridgeHeight
          this.graphics.lineTo(interpX - 1, ridgeY)
          this.graphics.lineTo(interpX + 1, interpY - ridgeHeight * 0.5)
          this.graphics.lineTo(interpX, interpY)
        }
        
        this.graphics.lineTo(interpX, interpY)
      }
      
      // Descenso desde el pico
      for (let step = 1; step <= steps; step++) {
        const t = step / steps
        const easedT = 1 - (1 - t) * (1 - t) * (1 - t)
        const interpX = current.x + (segmentEndX - current.x) * easedT
        const descentVariation = Math.sin(t * Math.PI * 0.5) * 3
        const interpY = current.peakY + (next.baseY - current.peakY) * easedT + descentVariation
        this.graphics.lineTo(interpX, interpY)
      }
      
      // Completar el polígono
      this.graphics.lineTo(segmentEndX, next.baseY)
      
      if (baseY === this.horizonY && i === points - 1) {
        this.graphics.lineTo(this.width, this.height)
        this.graphics.lineTo(0, this.height)
      } else {
        this.graphics.lineTo(segmentStartX, current.baseY)
      }
      
      this.graphics.closePath()
      this.graphics.fillPath()
    }
  }

  /**
   * Dibuja nubes animadas en las cimas de las montañas
   */
  private drawSnowCaps(
    baseY: number,
    points: number,
    peakHeight: number,
    cloudColor: number,
    cloudAlpha: number
  ) {
    const seed = baseY * 0.1
    
    for (let i = 0; i < points; i++) {
      const x = (this.width / points) * i + (this.width / points) / 2
      const varAmount = Math.sin(i * 0.5 + seed) * 18
      const peakVariation = 0.5 + Math.sin(i * 0.7 + seed) * 0.5
      const currentPeakY = baseY - peakHeight * peakVariation - Math.abs(varAmount) * 2.2
      
      // Solo dibujar nubes en picos altos
      if (currentPeakY < baseY - peakHeight * 0.4 && Math.random() > 0.4) {
        const cloudY = currentPeakY - 15 - Math.random() * 20
        const cloudBaseX = x + (Math.random() - 0.5) * 30
        
        // Crear nube mejorada como objeto Phaser animable
        const cloudGraphics = this.scene.add.graphics()
        const cloudSize = 20 + Math.random() * 25
        
        // Capa de sombra (base)
        cloudGraphics.fillStyle(cloudColor, cloudAlpha * 0.4)
        
        // Crear nube con múltiples círculos superpuestos para forma esponjosa mejorada
        const numClouds = 3 + Math.floor(Math.random() * 3)
        const cloudParts: { x: number; y: number; radius: number }[] = []
        
        for (let j = 0; j < numClouds; j++) {
          const cloudX = (Math.random() - 0.5) * cloudSize * 1.2
          const cloudYOffset = (Math.random() - 0.5) * cloudSize * 0.6
          const cloudRadius = cloudSize * (0.6 + Math.random() * 0.4)
          
          cloudParts.push({ x: cloudX, y: cloudYOffset, radius: cloudRadius })
          
          // Sombra base
          cloudGraphics.fillCircle(cloudX, cloudYOffset, cloudRadius)
        }
        
        // Capa principal
        cloudGraphics.fillStyle(cloudColor, cloudAlpha)
        for (const part of cloudParts) {
          cloudGraphics.fillCircle(part.x, part.y, part.radius * 0.95)
          
          // Círculos adicionales para volumen
          const numExtra = 1 + Math.floor(Math.random() * 2)
          for (let k = 0; k < numExtra; k++) {
            const offsetX = part.x + (Math.random() - 0.5) * part.radius * 0.7
            const offsetY = part.y + (Math.random() - 0.5) * part.radius * 0.5
            const extraRadius = part.radius * (0.4 + Math.random() * 0.3)
            cloudGraphics.fillCircle(offsetX, offsetY, extraRadius)
          }
        }
        
        // Resaltes de luz mejorados en las nubes
        cloudGraphics.fillStyle(0xFFFFFF, cloudAlpha * 0.8)
        for (const part of cloudParts) {
          const highlightX = part.x - part.radius * 0.3
          const highlightY = part.y - part.radius * 0.3
          const highlightRadius = part.radius * (0.3 + Math.random() * 0.2)
          cloudGraphics.fillCircle(highlightX, highlightY, highlightRadius)
        }
        
        // Posicionar la nube
        cloudGraphics.setPosition(cloudBaseX, cloudY)
        cloudGraphics.setDepth(2)
        
        // Animación discreta y suave (movimiento horizontal muy lento)
        const moveDistance = 15 + Math.random() * 20 // Distancia pequeña
        const moveSpeed = 8000 + Math.random() * 4000 // Muy lento (8-12 segundos)
        const direction = Math.random() > 0.5 ? 1 : -1
        
        this.scene.tweens.add({
          targets: cloudGraphics,
          x: cloudBaseX + (moveDistance * direction),
          duration: moveSpeed,
          ease: 'Sine.easeInOut',
          yoyo: true,
          repeat: -1
        })
        
        this.cloudElements.push(cloudGraphics)
      }
    }
  }

  /**
   * Dibuja resaltes de luz en las montañas con colores vibrantes
   */
  private drawMountainHighlights(
    baseY: number,
    points: number,
    peakHeight: number
  ) {
    const seed = baseY * 0.1
    
    for (let i = 0; i < points; i++) {
      const x = (this.width / points) * i + (this.width / points) / 2
      const varAmount = Math.sin(i * 0.5 + seed) * 18
      const currentBaseY = baseY + varAmount
      const peakVariation = 0.6 + Math.sin(i * 0.8 + seed) * 0.4
      const currentPeakY = baseY - peakHeight * peakVariation - Math.abs(varAmount) * 1.5
      
      // Resaltes en el lado derecho (luz del sol) - múltiples círculos
      const highlightX = x + 12 + Math.random() * 8
      const highlightY = currentBaseY - (currentBaseY - currentPeakY) * (0.35 + Math.random() * 0.4)
      
      // Círculo principal más grande
      this.graphics.fillCircle(highlightX, highlightY, 10 + Math.random() * 14)
      
      // Círculo secundario para suavizar y crear más profundidad
      if (Math.random() > 0.4) {
        const secondaryX = highlightX + 6 + Math.random() * 4
        const secondaryY = highlightY - 4 - Math.random() * 3
        this.graphics.fillCircle(secondaryX, secondaryY, 6 + Math.random() * 8)
      }
    }
  }
  
  /**
   * Dibuja texturas mágicas simplificadas en las montañas (menos elementos)
   */
  private drawMagicMountainTextures(
    baseY: number,
    points: number,
    peakHeight: number
  ) {
    const seed = baseY * 0.1
    
    // Texturas mágicas reducidas (solo 12 elementos en lugar de 35)
    for (let i = 0; i < 12; i++) {
      const x = Math.random() * this.width
      const varAmount = Math.sin((x / this.width) * points * 0.5 + seed) * 30
      const currentBaseY = baseY + varAmount
      const peakVariation = 0.5 + Math.sin((x / this.width) * points * 0.7 + seed) * 0.5
      const currentPeakY = baseY - peakHeight * peakVariation - Math.abs(varAmount) * 2.2
      
      if (x >= 0 && x <= this.width) {
        const y = currentBaseY - (currentBaseY - currentPeakY) * (0.3 + Math.random() * 0.5)
        
        // Rocas mágicas con colores vibrantes variados
        if (Math.random() > 0.5) {
          const rockSize = 4 + Math.random() * 6
          // Paleta de colores de rocas más variada
          const rockColors = [0x5A7B8C, 0x6A8BAC, 0x7A9BCC, 0x8A7BAC, 0x9A8BBC]
          const rockColor = rockColors[Math.floor(Math.random() * rockColors.length)]
          this.graphics.fillStyle(rockColor, 0.6)
          this.graphics.fillCircle(x, y, rockSize)
          
          // Resalte mágico con color complementario
          this.graphics.fillStyle(0x8AABCC, 0.4)
          this.graphics.fillCircle(x + rockSize * 0.2, y - rockSize * 0.2, rockSize * 0.5)
        } else {
          // Vegetación mágica con colores más vibrantes
          const vegSize = 3 + Math.random() * 5
          const vegColors = [0x4D9C6A, 0x5AAC7B, 0x6ABC8C, 0x7ACC9D, 0x5A8CAC, 0x6A9CBC]
          const vegColor = vegColors[Math.floor(Math.random() * vegColors.length)]
          
          this.graphics.fillStyle(vegColor, 0.5)
          this.graphics.fillCircle(x, y, vegSize)
          
          // Resalte en la vegetación
          this.graphics.fillStyle(0x8AECAA, 0.3)
          this.graphics.fillCircle(x - vegSize * 0.3, y - vegSize * 0.3, vegSize * 0.6)
        }
      }
    }
    
    // Líneas de grietas mágicas reducidas (solo 3 en lugar de 8)
    for (let i = 0; i < 3; i++) {
      const startX = Math.random() * this.width
      const varAmount = Math.sin((startX / this.width) * points * 0.5 + seed) * 30
      const currentBaseY = baseY + varAmount
      const peakVariation = 0.5 + Math.sin((startX / this.width) * points * 0.7 + seed) * 0.5
      const currentPeakY = baseY - peakHeight * peakVariation - Math.abs(varAmount) * 2.2
      
      const startY = currentBaseY - (currentBaseY - currentPeakY) * (0.4 + Math.random() * 0.4)
      const endX = startX + (Math.random() - 0.5) * 30
      const endY = startY + 8 + Math.random() * 15
      
      // Grietas con colores más variados
      const crackColors = [0x4A7B6C, 0x5A8B7C, 0x6A9B8C, 0x4A6BAC]
      const crackColor = crackColors[Math.floor(Math.random() * crackColors.length)]
      this.graphics.lineStyle(1.5, crackColor, 0.3)
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

