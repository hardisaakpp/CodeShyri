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
   */
  public render() {
    // Efecto de niebla atmosférica entre capas (más sutil)
    this.renderAtmosphericFog()
    
    // Montañas muy lejanas - capa 0 - azul púrpura mágico con toque medieval (reducidas)
    this.graphics.fillStyle(0x5B4B7C, 0.7) // Púrpura azulado más apagado (medieval)
    this.drawAndeanMountainRange(this.horizonY - 28, 14, 8, 85)
    
    // Gradiente mágico en montañas muy lejanas (más sutil)
    this.graphics.fillStyle(0x6A5B8C, 0.35)
    this.drawMountainGradient(this.horizonY - 28, 14, 85, 'top')

    // Montañas lejanas - capa 1 - azul esmeralda mágico con toque medieval (reducidas)
    this.graphics.fillStyle(0x3A6C7C, 0.85) // Azul turquesa más apagado (medieval)
    this.drawAndeanMountainRange(this.horizonY - 17, 12, 12, 100)
    
    // Nubes mágicas animadas en montañas lejanas (con toque azulado)
    this.drawSnowCaps(this.horizonY - 17, 12, 100, 0xD4E8F0, 0.9)
    
    // Resaltes sutiles mágicos
    this.graphics.fillStyle(0x5A8C9C, 0.25)
    this.drawMountainHighlights(this.horizonY - 17, 12, 100)

    // Volcán Cotopaxi nevado (gris y grande) - entre montañas lejanas y medias (reducido)
    this.renderMagicVolcano()

    // Montañas medias - capa 2 - verde esmeralda mágico con toque medieval (reducidas)
    this.graphics.fillStyle(0x2D6C4A, 0.95) // Verde esmeralda más oscuro (medieval)
    this.drawAndeanMountainRange(this.horizonY - 6, 10, 18, 72)
    
    // Sombra mágica de las montañas medias (más profunda)
    this.graphics.fillStyle(0x1D5C3A, 0.75)
    this.drawMountainShadow(this.horizonY - 6, 10, 18)
    
    // Nubes mágicas animadas en montañas medias
    this.drawSnowCaps(this.horizonY - 6, 10, 72, 0xE8F4F8, 0.95)
    
    // Resaltes de luz mágica en montañas medias
    this.graphics.fillStyle(0x4D8C6A, 0.4)
    this.drawMountainHighlights(this.horizonY - 6, 10, 72)
    
    // Gradiente de luz mágica
    this.graphics.fillStyle(0x5D9C7A, 0.25)
    this.drawMountainGradient(this.horizonY - 6, 10, 72, 'right')

    // Montañas cercanas - capa 3 - verde jade con toques púrpura (medieval, reducidas)
    this.graphics.fillStyle(0x3A7C5B, 1) // Verde jade más oscuro (medieval)
    this.drawAndeanMountainRange(this.horizonY, 8, 25, 50)
    
    // Sombra mágica de las montañas cercanas (más profunda)
    this.graphics.fillStyle(0x2A6C4B, 0.75)
    this.drawMountainShadow(this.horizonY, 8, 25)
    
    // Resaltes de luz mágica en montañas cercanas
    this.graphics.fillStyle(0x5A9C7B, 0.5)
    this.drawMountainHighlights(this.horizonY, 8, 50)
    
    // Gradiente de luz mágica
    this.graphics.fillStyle(0x6AAC8B, 0.3)
    this.drawMountainGradient(this.horizonY, 8, 50, 'right')
    
    // Detalles de textura mágica (reducidos)
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
   * Renderiza el volcán Cotopaxi nevado (gris y grande)
   */
  private renderMagicVolcano() {
    // Posición del volcán (centro-derecha del fondo, reducido proporcionalmente)
    const volcanoX = this.width * 0.65
    const volcanoBaseY = this.horizonY - 12
    const volcanoWidth = 140 // Reducido proporcionalmente
    const volcanoHeight = 150 // Reducido proporcionalmente
    const snowLine = volcanoHeight * 0.32 // Línea de nieve (32% desde la cima)
    
    // Cuerpo del volcán con color gris (roca volcánica)
    this.graphics.fillStyle(0x4A4A4A, 0.85)
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
    
    // Sombra del volcán
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
    
    // Detalles de nieve más brillante en la cima
    this.graphics.fillStyle(0xE8F4F8, 0.9)
    this.graphics.fillCircle(volcanoX, volcanoBaseY - volcanoHeight + 12, 28)
    this.graphics.fillCircle(volcanoX - 12, volcanoBaseY - volcanoHeight + 18, 18)
    this.graphics.fillCircle(volcanoX + 12, volcanoBaseY - volcanoHeight + 18, 18)
    this.graphics.fillCircle(volcanoX - 6, volcanoBaseY - volcanoHeight + 8, 12)
    this.graphics.fillCircle(volcanoX + 6, volcanoBaseY - volcanoHeight + 8, 12)
    
    // Resaltes de luz en el lado derecho (efecto de sol)
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
  }

  /**
   * Dibuja una cadena de montañas con estilo andino: picos más angulares y dramáticos
   */
  private drawAndeanMountainRange(
    baseY: number,
    points: number,
    variation: number,
    peakHeight: number
  ) {
    this.graphics.beginPath()
    this.graphics.moveTo(0, baseY)
    
    const mountainPoints: { x: number, y: number }[] = []
    mountainPoints.push({ x: 0, y: baseY })
    
    const seed = baseY * 0.1
    
    for (let i = 0; i <= points; i++) {
      const x = (this.width / points) * i
      const varAmount = Math.sin(i * 0.5 + seed) * variation + 
                       Math.cos(i * 0.3 + seed * 0.7) * (variation * 0.6) +
                       Math.sin(i * 1.2 + seed * 1.3) * (variation * 0.4)
      const currentBaseY = baseY + varAmount
      
      // Picos más dramáticos y variados (estilo andino)
      const peakVariation = 0.5 + Math.sin(i * 0.7 + seed) * 0.5
      const secondaryPeak = Math.sin(i * 1.8 + seed * 2) * 0.2
      const tertiaryPeak = Math.cos(i * 2.5 + seed * 1.5) * 0.15
      const currentPeakY = baseY - peakHeight * (peakVariation + secondaryPeak + tertiaryPeak) - Math.abs(varAmount) * 2.2
      const midX = x + (this.width / points) / 2
      
      if (i < points) {
        if (i > 0) {
          const prevPoint = mountainPoints[mountainPoints.length - 1]
          
          // Subida más angular y dramática (estilo andino)
          const steps = 3 // Menos pasos = más angular
          for (let step = 1; step <= steps; step++) {
            const t = step / steps
            // Easing más agresivo para picos más puntiagudos
            const easedT = t * t * t
            const interpX = prevPoint.x + (midX - prevPoint.x) * easedT
            
            // Variación más pronunciada para crear picos más dramáticos
            const heightVariation = Math.sin(t * Math.PI) * 4 + Math.sin(t * Math.PI * 3) * 1.5
            const interpY = prevPoint.y + (currentPeakY - prevPoint.y) * easedT - heightVariation
            
            // Añadir pequeñas crestas secundarias (reducidas para evitar amontonamiento)
            if (step === Math.floor(steps / 2) && Math.random() > 0.85) {
              const ridgeY = interpY - 6 - Math.random() * 8
              this.graphics.lineTo(interpX, ridgeY)
              this.graphics.lineTo(interpX + 2, interpY)
            }
            
            this.graphics.lineTo(interpX, interpY)
          }
          
          // Descenso más pronunciado (laderas empinadas andinas)
          const nextX = x + (this.width / points)
          const nextVar = Math.sin((i + 1) * 0.5 + seed) * variation + 
                         Math.cos((i + 1) * 0.3 + seed * 0.7) * (variation * 0.6)
          const nextBaseY = baseY + nextVar
          
          for (let step = 1; step <= steps; step++) {
            const t = step / steps
            const easedT = 1 - (1 - t) * (1 - t) * (1 - t)
            const interpX = midX + (nextX - midX) * easedT
            const descentVariation = Math.sin(t * Math.PI * 0.5) * 3
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
        
        // Crear nube como objeto Phaser animable
        const cloudGraphics = this.scene.add.graphics()
        cloudGraphics.fillStyle(cloudColor, cloudAlpha)
        
        // Crear nube con múltiples círculos superpuestos para forma esponjosa
        const numClouds = 3 + Math.floor(Math.random() * 3)
        const cloudSize = 20 + Math.random() * 25
        
        for (let j = 0; j < numClouds; j++) {
          const cloudX = (Math.random() - 0.5) * cloudSize * 1.2
          const cloudYOffset = (Math.random() - 0.5) * cloudSize * 0.6
          const cloudRadius = cloudSize * (0.6 + Math.random() * 0.4)
          
          // Nube principal
          cloudGraphics.fillCircle(cloudX, cloudYOffset, cloudRadius)
          
          // Círculos adicionales para dar forma más orgánica
          if (j < numClouds - 1) {
            const offsetX = cloudX + (Math.random() - 0.5) * cloudRadius * 0.8
            const offsetY = cloudYOffset + (Math.random() - 0.5) * cloudRadius * 0.6
            const smallRadius = cloudRadius * (0.5 + Math.random() * 0.3)
            cloudGraphics.fillCircle(offsetX, offsetY, smallRadius)
          }
        }
        
        // Resaltes de luz en las nubes
        cloudGraphics.fillStyle(0xFFFFFF, 0.7)
        const highlightX = -cloudSize * 0.3
        const highlightY = -cloudSize * 0.2
        cloudGraphics.fillCircle(highlightX, highlightY, cloudSize * 0.4)
        
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
        
        // Rocas mágicas con colores del bosque
        if (Math.random() > 0.5) {
          const rockSize = 4 + Math.random() * 6
          this.graphics.fillStyle(0x4A6B5C, 0.5)
          this.graphics.fillCircle(x, y, rockSize)
          
          // Resalte mágico
          this.graphics.fillStyle(0x5A7B6C, 0.3)
          this.graphics.fillCircle(x + rockSize * 0.2, y - rockSize * 0.2, rockSize * 0.5)
        } else {
          // Vegetación mágica reducida
          const vegSize = 3 + Math.random() * 4
          const vegColors = [0x3D8C5A, 0x4A9C6B, 0x5AAC7B]
          const vegColor = vegColors[Math.floor(Math.random() * vegColors.length)]
          
          this.graphics.fillStyle(vegColor, 0.4)
          this.graphics.fillCircle(x, y, vegSize)
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
      
      this.graphics.lineStyle(1.2, 0x3A6B4C, 0.25)
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

