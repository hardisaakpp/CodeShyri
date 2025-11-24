import type Phaser from 'phaser'

export class AnimatedElementsRenderer {
  private animatedElements: any[] = []

  constructor(
    private scene: Phaser.Scene,
    private width: number,
    private height: number,
    private horizonY: number
  ) {}

  /**
   * Renderiza elementos animados (nubes, estrellas, sol)
   */
  public render() {
    this.renderClouds()
    this.renderStars()
    this.renderSun()
    return this.animatedElements
  }

  /**
   * Renderiza las nubes animadas con diseño mejorado
   */
  private renderClouds() {
    const clouds: Phaser.GameObjects.Graphics[] = []
    // Colores más naturales y variados para nubes
    const cloudColors = [
      { base: 0xF5F5F5, shadow: 0xD8D8D8, highlight: 0xFFFFFF }, // Blanco grisáceo
      { base: 0xE8E8E8, shadow: 0xC8C8C8, highlight: 0xF8F8F8 }, // Gris claro
      { base: 0xF0F0F0, shadow: 0xD0D0D0, highlight: 0xFFFFFF }, // Blanco suave
      { base: 0xE0E8F0, shadow: 0xC0D0E0, highlight: 0xF0F8FF }, // Azul muy claro
      { base: 0xF5E6D3, shadow: 0xE0D0C0, highlight: 0xFFF8E8 }  // Crema suave
    ]
    
    // Crear menos nubes para mejor rendimiento
    const numClouds = 4 + Math.floor(Math.random() * 2) // 4-5 nubes
    
    for (let i = 0; i < numClouds; i++) {
      const startX = -200 - Math.random() * 200
      const cloudY = 40 + Math.random() * 120
      const baseSize = 40 + Math.random() * 50 // Tamaño base más variado
      const speed = 0.12 + Math.random() * 0.2 // Velocidad más variada
      const cloudColorSet = cloudColors[Math.floor(Math.random() * cloudColors.length)]
      
      const cloudGraphics = this.scene.add.graphics()
      
      // Crear nube con múltiples capas para profundidad
      this.drawImprovedCloud(cloudGraphics, baseSize, cloudColorSet)
      
      cloudGraphics.setPosition(startX, cloudY)
      cloudGraphics.setDepth(1)
      
      // Animación suave con ligera variación vertical
      const createCloudAnimation = () => {
        const distance = this.width + 400
        const duration = (distance / speed) * 1000
        const verticalOffset = (Math.random() - 0.5) * 15 // Ligera variación vertical
        
        this.scene.tweens.add({
          targets: cloudGraphics,
          x: this.width + 200,
          y: cloudY + verticalOffset,
          duration: duration,
          ease: 'Linear',
          onComplete: () => {
            cloudGraphics.setX(-200)
            cloudGraphics.setY(cloudY)
            createCloudAnimation()
          }
        })
      }
      
      createCloudAnimation()
      clouds.push(cloudGraphics)
    }
    
    this.animatedElements.push(...clouds)
  }

  /**
   * Dibuja una nube realista con Flat Shaded 3D
   */
  private drawImprovedCloud(
    graphics: Phaser.GameObjects.Graphics,
    baseSize: number,
    colors: { base: number; shadow: number; highlight: number }
  ): void {
    // Colores para Flat Shaded 3D (luz desde arriba-derecha)
    const cloudLight = this.lightenColor(colors.base, 0.15) // Cara muy iluminada
    const cloudMid = colors.base // Cara frontal
    const cloudDark = this.darkenColor(colors.base, 0.2) // Cara en sombra
    
    // Crear estructura de nube más realista con múltiples grupos de "cúmulos"
    const cloudType = Math.random()
    let cloudParts: Array<{ x: number; y: number; radiusX: number; radiusY: number; layer: number }> = []
    
    if (cloudType > 0.6) {
      // Nube tipo cúmulo grande (simplificada: menos partes)
      const mainCenter = { x: 0, y: 0 }
      cloudParts = [
        // Capa inferior (simplificada: solo 2 partes)
        { x: mainCenter.x - baseSize * 0.2, y: mainCenter.y + baseSize * 0.1, radiusX: baseSize * 0.7, radiusY: baseSize * 0.5, layer: 0 },
        { x: mainCenter.x + baseSize * 0.3, y: mainCenter.y + baseSize * 0.15, radiusX: baseSize * 0.65, radiusY: baseSize * 0.45, layer: 0 },
        
        // Capa media (simplificada: solo 2 partes)
        { x: mainCenter.x + baseSize * 0.1, y: mainCenter.y - baseSize * 0.05, radiusX: baseSize * 0.7, radiusY: baseSize * 0.6, layer: 1 },
        { x: mainCenter.x + baseSize * 0.4, y: mainCenter.y, radiusX: baseSize * 0.55, radiusY: baseSize * 0.5, layer: 1 },
        
        // Capa superior (simplificada: solo 1 parte)
        { x: mainCenter.x + baseSize * 0.2, y: mainCenter.y - baseSize * 0.25, radiusX: baseSize * 0.6, radiusY: baseSize * 0.5, layer: 2 }
      ]
    } else if (cloudType > 0.3) {
      // Nube tipo estratos (simplificada)
      cloudParts = [
        { x: -baseSize * 0.3, y: baseSize * 0.05, radiusX: baseSize * 0.6, radiusY: baseSize * 0.35, layer: 0 },
        { x: baseSize * 0.15, y: -baseSize * 0.05, radiusX: baseSize * 0.55, radiusY: baseSize * 0.32, layer: 0 },
        { x: baseSize * 0.4, y: baseSize * 0.05, radiusX: baseSize * 0.5, radiusY: baseSize * 0.3, layer: 0 },
        
        { x: baseSize * 0.05, y: -baseSize * 0.2, radiusX: baseSize * 0.58, radiusY: baseSize * 0.4, layer: 1 }
      ]
    } else {
      // Nube tipo cúmulo pequeño (simplificada)
      cloudParts = [
        { x: -baseSize * 0.15, y: baseSize * 0.08, radiusX: baseSize * 0.5, radiusY: baseSize * 0.4, layer: 0 },
        { x: baseSize * 0.2, y: -baseSize * 0.1, radiusX: baseSize * 0.55, radiusY: baseSize * 0.45, layer: 1 },
        { x: baseSize * 0.05, y: -baseSize * 0.3, radiusX: baseSize * 0.48, radiusY: baseSize * 0.4, layer: 2 }
      ]
    }
    
    // Dibujar las capas de atrás hacia adelante (simplificado: menos efectos)
    for (let layer = 0; layer <= 2; layer++) {
      const layerParts = cloudParts.filter(p => p.layer === layer)
      
      for (const part of layerParts) {
        // Color simplificado basado en la capa
        let partColor = cloudMid
        if (layer > 1) {
          partColor = cloudLight
        } else if (layer === 0) {
          partColor = cloudDark
        }
        
        // Cara principal (frontal) - simplificada
        graphics.fillStyle(partColor, 0.85 - layer * 0.1)
        graphics.fillEllipse(
          part.x,
          part.y,
          part.radiusX,
          part.radiusY
        )
        
        // Resalte simple solo en la capa superior
        if (layer === 2 && part.y < -baseSize * 0.1) {
          graphics.fillStyle(colors.highlight, 0.4)
          graphics.fillEllipse(
            part.x + part.radiusX * 0.15,
            part.y - part.radiusY * 0.25,
            part.radiusX * 0.5,
            part.radiusY * 0.4
          )
        }
      }
    }
    
    // Detalles de textura reducidos (solo 2-3 detalles en lugar de 6)
    graphics.fillStyle(cloudMid, 0.25)
    const numDetails = 2 + Math.floor(Math.random() * 2) // 2-3 detalles
    for (let i = 0; i < numDetails; i++) {
      const randomPart = cloudParts[Math.floor(Math.random() * cloudParts.length)]
      const detailX = randomPart.x + (Math.random() - 0.5) * randomPart.radiusX * 0.7
      const detailY = randomPart.y + (Math.random() - 0.5) * randomPart.radiusY * 0.7
      const detailSize = randomPart.radiusX * (0.12 + Math.random() * 0.1)
      graphics.fillEllipse(detailX, detailY, detailSize, detailSize * 0.8)
    }
  }

  /**
   * Aclara un color para efectos 3D
   */
  private lightenColor(color: number, factor: number): number {
    const r = Math.min(255, ((color >> 16) & 0xFF) + Math.floor((255 - ((color >> 16) & 0xFF)) * factor))
    const g = Math.min(255, ((color >> 8) & 0xFF) + Math.floor((255 - ((color >> 8) & 0xFF)) * factor))
    const b = Math.min(255, (color & 0xFF) + Math.floor((255 - (color & 0xFF)) * factor))
    return (r << 16) | (g << 8) | b
  }

  /**
   * Oscurece un color para efectos 3D
   */
  private darkenColor(color: number, factor: number): number {
    const r = Math.max(0, Math.floor(((color >> 16) & 0xFF) * (1 - factor)))
    const g = Math.max(0, Math.floor(((color >> 8) & 0xFF) * (1 - factor)))
    const b = Math.max(0, Math.floor((color & 0xFF) * (1 - factor)))
    return (r << 16) | (g << 8) | b
  }

  /**
   * Renderiza las estrellas animadas con Flat Shaded 3D
   */
  private renderStars() {
    const stars: Phaser.GameObjects.Graphics[] = []
    const starColors = [0xFFD700, 0xFF69B4, 0x00FFFF, 0xFFA500, 0xFF1493, 0x87CEEB]
    
    // Reducir número de estrellas para mejor rendimiento
    for (let i = 0; i < 25; i++) {
      const starX = Math.random() * this.width
      const starY = Math.random() * (this.horizonY - 50)
      const starSize = 1.5 + Math.random() * 3
      const twinkleDelay = Math.random() * 2000
      const baseColor = starColors[Math.floor(Math.random() * starColors.length)]
      
      // Colores para la estrella
      const starLight = this.lightenColor(baseColor, 0.3)
      const starMid = baseColor
      
      const starGraphics = this.scene.add.graphics()
      
      // Estrella simplificada (solo forma principal + punto central)
      starGraphics.fillStyle(starLight, 1)
      this.drawStarShape(starGraphics, 0, 0, starSize, 4)
      
      // Punto central brillante
      starGraphics.fillStyle(starMid, 1)
      starGraphics.fillCircle(0, 0, starSize * 0.3)
      
      starGraphics.setPosition(starX, starY)
      starGraphics.setDepth(1)
      
      // Animación de parpadeo (brillo)
      this.scene.tweens.add({
        targets: starGraphics,
        alpha: { from: 0.4, to: 1 },
        duration: 800 + Math.random() * 1200,
        delay: twinkleDelay,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      })
      
      stars.push(starGraphics)
    }
    
    this.animatedElements.push(...stars)
  }

  /**
   * Dibuja una forma de estrella
   */
  private drawStarShape(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    size: number,
    points: number
  ): void {
    graphics.beginPath()
    for (let i = 0; i < points * 2; i++) {
      const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2
      const radius = i % 2 === 0 ? size : size * 0.5
      const px = x + Math.cos(angle) * radius
      const py = y + Math.sin(angle) * radius
      if (i === 0) {
        graphics.moveTo(px, py)
      } else {
        graphics.lineTo(px, py)
      }
    }
    graphics.closePath()
    graphics.fillPath()
  }

  /**
   * Renderiza el sol animado con diseño realista y Flat Shaded 3D
   */
  private renderSun() {
    const sunX = this.width * 0.85
    const sunY = this.height * 0.15
    const sunRadius = 65
    
    // Colores realistas del sol (del centro hacia afuera)
    const sunCoreHot = 0xFFFFFF // Núcleo blanco (más caliente)
    const sunCore = 0xFFFF00 // Amarillo puro del centro
    const sunMid = 0xFFA500 // Naranja medio
    const sunEdge = 0xFF8C00 // Naranja oscuro en los bordes
    
    // Crear gráficos para las diferentes partes del sol
    const sunGraphics = this.scene.add.graphics()
    
    // Glow exterior simplificado (solo 2 capas en lugar de 3)
    sunGraphics.fillStyle(0xFFD700, 0.2)
    sunGraphics.fillCircle(0, 0, 120)
    
    sunGraphics.fillStyle(0xFFA500, 0.3)
    sunGraphics.fillCircle(0, 0, 95)
    
    // Borde exterior del sol (simplificado: 10 segmentos en lugar de 16)
    const segments = 10
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      const segmentAngle = angle - Math.PI / 2
      const lightFactor = (Math.cos(segmentAngle) + Math.sin(segmentAngle)) / 2 + 0.5
      const segmentColor = this.interpolateColor(sunEdge, sunMid, lightFactor)
      
      sunGraphics.fillStyle(segmentColor, 0.9)
      const startAngle = (i / segments) * Math.PI * 2 - Math.PI / 2
      const endAngle = ((i + 1) / segments) * Math.PI * 2 - Math.PI / 2
      
      sunGraphics.beginPath()
      sunGraphics.arc(0, 0, sunRadius * 0.98, startAngle, endAngle)
      sunGraphics.lineTo(0, 0)
      sunGraphics.closePath()
      sunGraphics.fillPath()
    }
    
    // Cuerpo principal del sol (simplificado: menos capas)
    sunGraphics.fillStyle(sunMid, 1)
    sunGraphics.fillCircle(0, 0, sunRadius * 0.92)
    
    // Zona intermedia
    sunGraphics.fillStyle(0xFFB500, 0.95)
    sunGraphics.fillCircle(0, 0, sunRadius * 0.75)
    
    // Núcleo (amarillo brillante)
    sunGraphics.fillStyle(sunCore, 1)
    sunGraphics.fillCircle(0, 0, sunRadius * 0.5)
    
    // Núcleo interno (blanco caliente)
    sunGraphics.fillStyle(sunCoreHot, 0.9)
    sunGraphics.fillCircle(0, 0, sunRadius * 0.3)
    
    // Resaltes simplificados (solo 1-2 en lugar de 3)
    sunGraphics.fillStyle(0xFFFFFF, 0.6)
    sunGraphics.fillCircle(sunRadius * 0.25, -sunRadius * 0.3, sunRadius * 0.15)
    sunGraphics.fillCircle(sunRadius * 0.15, -sunRadius * 0.25, sunRadius * 0.12)
    
    sunGraphics.setPosition(sunX, sunY)
    sunGraphics.setDepth(1)
    
    // Animación de pulso sutil
    const sunContainer = this.scene.add.container(sunX, sunY)
    sunContainer.add(sunGraphics)
    sunGraphics.setPosition(0, 0)
    
    // Animación de pulso suave (simulando actividad solar)
    this.scene.tweens.add({
      targets: sunContainer,
      scaleX: { from: 0.96, to: 1.04 },
      scaleY: { from: 0.96, to: 1.04 },
      alpha: { from: 0.95, to: 1 },
      duration: 4000 + Math.random() * 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
    
    this.animatedElements.push(sunContainer)
  }

  /**
   * Interpola entre dos colores
   */
  private interpolateColor(color1: number, color2: number, factor: number): number {
    const r1 = (color1 >> 16) & 0xFF
    const g1 = (color1 >> 8) & 0xFF
    const b1 = color1 & 0xFF
    
    const r2 = (color2 >> 16) & 0xFF
    const g2 = (color2 >> 8) & 0xFF
    const b2 = color2 & 0xFF
    
    const r = Math.floor(r1 + (r2 - r1) * factor)
    const g = Math.floor(g1 + (g2 - g1) * factor)
    const b = Math.floor(b1 + (b2 - b1) * factor)
    
    return (r << 16) | (g << 8) | b
  }
}

