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
    const numClouds = 2 + Math.floor(Math.random() * 2) // 2-3 nubes (reducido de 4-5)
    
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
    for (let i = 0; i < 15; i++) { // Reducido de 25 a 15 para mejor FPS
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
   * Renderiza el sol animado con diseño inca andino inspirado en Inti
   * Diseño mejorado con elementos auténticos incas (Chakana, patrones escalonados)
   * Optimizado para mejor rendimiento: menos operaciones de dibujo y animaciones más eficientes
   */
  private renderSun() {
    const sunX = this.width * 0.85
    const sunY = this.height * 0.15
    const sunRadius = 65
    
    // Colores inca andinos auténticos (dorados y terrosos)
    const intiGold = 0xFFD700      // Dorado brillante
    const intiDarkGold = 0xDAA520  // Dorado oscuro
    const intiBronze = 0xCD7F32    // Bronce
    const intiOcre = 0xB8860B      // Ocre dorado
    const intiYellow = 0xFFE135    // Amarillo dorado
    const intiRed = 0xCC5500       // Rojo terroso inca
    
    // Crear gráficos para el sol de Inti
    const sunGraphics = this.scene.add.graphics()
    
    // Glow exterior con aura dorada (estilo inca)
    sunGraphics.fillStyle(intiGold, 0.2)
    sunGraphics.fillCircle(0, 0, 125)
    
    // Rayos en estilo inca con patrones escalonados auténticos (8 rayos - número sagrado)
    const numRays = 8 // 8 rayos para simetría perfecta (número sagrado en cultura andina)
    const rayLength = sunRadius * 1.4
    const rayWidth = 8
    
    for (let i = 0; i < numRays; i++) {
      const angle = (i / numRays) * Math.PI * 2 - Math.PI / 2
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      
      // Rayo con patrón escalonado auténtico (como muros de Machu Picchu)
      const baseRadius = sunRadius * 1.05
      const startX = cos * baseRadius
      const startY = sin * baseRadius
      const endX = cos * rayLength
      const endY = sin * rayLength
      const perpCos = -sin
      const perpSin = cos
      
      // Rayo con escalones (patrón típico de arquitectura inca)
      const midX = cos * (baseRadius + (rayLength - baseRadius) * 0.5)
      const midY = sin * (baseRadius + (rayLength - baseRadius) * 0.5)
      
      // Segmento base con escalón
      sunGraphics.fillStyle(intiGold, 0.95)
      sunGraphics.beginPath()
      sunGraphics.moveTo(startX, startY)
      sunGraphics.lineTo(midX, midY)
      sunGraphics.lineTo(
        midX + perpCos * rayWidth * 0.8,
        midY + perpSin * rayWidth * 0.8
      )
      sunGraphics.lineTo(
        startX + perpCos * rayWidth * 0.5,
        startY + perpSin * rayWidth * 0.5
      )
      sunGraphics.closePath()
      sunGraphics.fillPath()
      
      // Segmento punta con escalón
      sunGraphics.fillStyle(intiYellow, 0.9)
      sunGraphics.beginPath()
      sunGraphics.moveTo(midX, midY)
      sunGraphics.lineTo(endX, endY)
      sunGraphics.lineTo(
        endX + perpCos * rayWidth,
        endY + perpSin * rayWidth
      )
      sunGraphics.lineTo(
        midX + perpCos * rayWidth * 0.7,
        midY + perpSin * rayWidth * 0.7
      )
      sunGraphics.closePath()
      sunGraphics.fillPath()
    }
    
    // Círculo central principal (cara de Inti)
    sunGraphics.fillStyle(intiDarkGold, 1)
    sunGraphics.fillCircle(0, 0, sunRadius)
    
    // Anillo exterior con patrón escalonado (estilo muros de Machu Picchu)
    sunGraphics.lineStyle(3, intiBronze, 0.9)
    sunGraphics.strokeCircle(0, 0, sunRadius * 0.95)
    
    // Segundo anillo decorativo
    sunGraphics.lineStyle(2, intiOcre, 0.75)
    sunGraphics.strokeCircle(0, 0, sunRadius * 0.90)
    
    // Círculo intermedio
    sunGraphics.fillStyle(intiBronze, 0.85)
    sunGraphics.fillCircle(0, 0, sunRadius * 0.88)
    
    // Círculo central brillante
    sunGraphics.fillStyle(intiGold, 1)
    sunGraphics.fillCircle(0, 0, sunRadius * 0.78)
    
    // Patrón decorativo: Chakana detallada (cruz andina) - símbolo sagrado inca
    const chakanaSize = sunRadius * 0.52
    const stepSize = chakanaSize * 0.12
    
    // Chakana con escalones más detallados y auténticos (diseño mejorado)
    sunGraphics.fillStyle(intiOcre, 0.8)
    // Brazo vertical superior con escalones (3 escalones)
    sunGraphics.fillRect(-stepSize * 0.6, -chakanaSize, stepSize * 1.2, stepSize * 0.6)
    sunGraphics.fillRect(-stepSize * 0.4, -chakanaSize + stepSize * 0.6, stepSize * 0.8, stepSize * 0.4)
    sunGraphics.fillRect(-stepSize * 0.3, -chakanaSize + stepSize * 1.0, stepSize * 0.6, stepSize * 0.3)
    // Brazo vertical inferior con escalones (3 escalones)
    sunGraphics.fillRect(-stepSize * 0.6, chakanaSize * 0.3, stepSize * 1.2, stepSize * 0.6)
    sunGraphics.fillRect(-stepSize * 0.4, chakanaSize * 0.3 + stepSize * 0.6, stepSize * 0.8, stepSize * 0.4)
    sunGraphics.fillRect(-stepSize * 0.3, chakanaSize * 0.3 + stepSize * 1.0, stepSize * 0.6, stepSize * 0.3)
    // Brazo horizontal izquierdo con escalones (3 escalones)
    sunGraphics.fillRect(-chakanaSize, -stepSize * 0.6, stepSize * 0.6, stepSize * 1.2)
    sunGraphics.fillRect(-chakanaSize + stepSize * 0.6, -stepSize * 0.4, stepSize * 0.4, stepSize * 0.8)
    sunGraphics.fillRect(-chakanaSize + stepSize * 1.0, -stepSize * 0.3, stepSize * 0.3, stepSize * 0.6)
    // Brazo horizontal derecho con escalones (3 escalones)
    sunGraphics.fillRect(chakanaSize * 0.3, -stepSize * 0.6, stepSize * 0.6, stepSize * 1.2)
    sunGraphics.fillRect(chakanaSize * 0.3 + stepSize * 0.6, -stepSize * 0.4, stepSize * 0.4, stepSize * 0.8)
    sunGraphics.fillRect(chakanaSize * 0.3 + stepSize * 1.0, -stepSize * 0.3, stepSize * 0.3, stepSize * 0.6)
    
    // Decoración adicional en la chakana (líneas internas)
    sunGraphics.lineStyle(1.5, intiBronze, 0.7)
    // Líneas verticales
    sunGraphics.beginPath()
    sunGraphics.moveTo(0, -chakanaSize * 0.5)
    sunGraphics.lineTo(0, chakanaSize * 0.5)
    sunGraphics.strokePath()
    // Líneas horizontales
    sunGraphics.beginPath()
    sunGraphics.moveTo(-chakanaSize * 0.5, 0)
    sunGraphics.lineTo(chakanaSize * 0.5, 0)
    sunGraphics.strokePath()
    
    // Círculo central sobre la chakana con anillo decorativo
    sunGraphics.fillStyle(intiYellow, 1)
    sunGraphics.fillCircle(0, 0, sunRadius * 0.42)
    
    // Anillo decorativo alrededor del círculo central
    sunGraphics.lineStyle(2, intiBronze, 0.8)
    sunGraphics.strokeCircle(0, 0, sunRadius * 0.38)
    
    // Patrón decorativo interno: pequeños puntos alrededor del círculo central
    const dotRadius = sunRadius * 0.40
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2
      const x = Math.cos(angle) * dotRadius
      const y = Math.sin(angle) * dotRadius
      sunGraphics.fillStyle(i % 2 === 0 ? intiOcre : intiBronze, 0.7)
      sunGraphics.fillCircle(x, y, 1.5)
    }
    
    // Anillo decorativo con patrones de zigzag mejorados (típico de textiles incas)
    const zigzagRadius = sunRadius * 0.58
    sunGraphics.lineStyle(2, intiBronze, 0.75)
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const x1 = Math.cos(angle) * zigzagRadius
      const y1 = Math.sin(angle) * zigzagRadius
      const x2 = Math.cos(angle + Math.PI / 8) * zigzagRadius
      const y2 = Math.sin(angle + Math.PI / 8) * zigzagRadius
      sunGraphics.beginPath()
      sunGraphics.moveTo(x1, y1)
      sunGraphics.lineTo(x2, y2)
      sunGraphics.strokePath()
    }
    
    // Patrones de Tocapu (cuadrados decorativos incas) - arte textil auténtico
    const tocapuRadius = sunRadius * 0.56
    const numTocapu = 8 // 8 tocapus para simetría perfecta
    for (let i = 0; i < numTocapu; i++) {
      const angle = (i / numTocapu) * Math.PI * 2
      const x = Math.cos(angle) * tocapuRadius
      const y = Math.sin(angle) * tocapuRadius
      
      // Tocapu con diseño escalonado complejo (patrón auténtico de textiles incas)
      const tocapuSize = 8
        sunGraphics.fillStyle(i % 2 === 0 ? intiOcre : intiBronze, 0.9)
        sunGraphics.fillRect(
        x - tocapuSize / 2,
        y - tocapuSize / 2,
        tocapuSize,
        tocapuSize
      )
      
      // Patrón interno escalonado (diseño típico de tocapu)
      sunGraphics.fillStyle(i % 2 === 0 ? intiBronze : intiOcre, 0.8)
      // Escalones internos
      sunGraphics.fillRect(x - tocapuSize / 3, y - tocapuSize / 3, tocapuSize / 3, tocapuSize / 3)
      sunGraphics.fillRect(x, y - tocapuSize / 3, tocapuSize / 3, tocapuSize / 3)
      sunGraphics.fillRect(x - tocapuSize / 3, y, tocapuSize / 3, tocapuSize / 3)
      sunGraphics.fillRect(x, y, tocapuSize / 3, tocapuSize / 3)
    }
    
    // Patrón de rombos escalonados en diagonal (diseño textil inca mejorado)
    const diamondRadius = sunRadius * 0.48
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4
      const x = Math.cos(angle) * diamondRadius
      const y = Math.sin(angle) * diamondRadius
      const diamondSize = 5
      
      // Rombo principal
      sunGraphics.fillStyle(intiBronze, 0.7)
      sunGraphics.beginPath()
      sunGraphics.moveTo(x, y - diamondSize)
      sunGraphics.lineTo(x + diamondSize, y)
      sunGraphics.lineTo(x, y + diamondSize)
      sunGraphics.lineTo(x - diamondSize, y)
      sunGraphics.closePath()
      sunGraphics.fillPath()
      
      // Rombo interno (patrón escalonado)
      sunGraphics.fillStyle(intiOcre, 0.6)
      sunGraphics.beginPath()
      sunGraphics.moveTo(x, y - diamondSize * 0.5)
      sunGraphics.lineTo(x + diamondSize * 0.5, y)
      sunGraphics.lineTo(x, y + diamondSize * 0.5)
      sunGraphics.lineTo(x - diamondSize * 0.5, y)
      sunGraphics.closePath()
      sunGraphics.fillPath()
    }
    
    // Patrón de escaleras decorativas (típico de arte inca)
    const stairRadius = sunRadius * 0.50
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2
      const x = Math.cos(angle) * stairRadius
      const y = Math.sin(angle) * stairRadius
      const stairSize = 6
      
      // Escalera decorativa (patrón típico de textiles y cerámica inca)
      sunGraphics.fillStyle(intiBronze, 0.65)
      // Escalón 1
      sunGraphics.fillRect(x - stairSize / 2, y - stairSize, stairSize, 2)
      // Escalón 2
      sunGraphics.fillRect(x - stairSize / 2 + 1, y - stairSize + 2, stairSize - 2, 2)
      // Escalón 3
      sunGraphics.fillRect(x - stairSize / 2 + 2, y - stairSize + 4, stairSize - 4, 2)
    }
    
    // Patrón de líneas decorativas radiales (arte textil inca)
    sunGraphics.lineStyle(1, intiOcre, 0.5)
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2
      const innerRadius = sunRadius * 0.45
      const outerRadius = sunRadius * 0.52
      const x1 = Math.cos(angle) * innerRadius
      const y1 = Math.sin(angle) * innerRadius
      const x2 = Math.cos(angle) * outerRadius
      const y2 = Math.sin(angle) * outerRadius
      
      if (i % 2 === 0) {
        sunGraphics.beginPath()
        sunGraphics.moveTo(x1, y1)
        sunGraphics.lineTo(x2, y2)
        sunGraphics.strokePath()
      }
    }
    
    // Cara estilizada de Inti con diseño más auténtico y geométrico (arte inca)
    // Ojos con forma más geométrica y decorativa (estilo cerámica y textiles incas)
    sunGraphics.fillStyle(intiBronze, 0.95)
    sunGraphics.fillRect(-sunRadius * 0.22, -sunRadius * 0.16, 9, 11)
    sunGraphics.fillRect(sunRadius * 0.13, -sunRadius * 0.16, 9, 11)
    
    // Decoración de ojos con patrones escalonados (arte inca auténtico)
    sunGraphics.fillStyle(intiOcre, 0.7)
    // Líneas decorativas escalonadas en los ojos
    sunGraphics.fillRect(-sunRadius * 0.20, -sunRadius * 0.18, 2, 3)
    sunGraphics.fillRect(-sunRadius * 0.18, -sunRadius * 0.17, 2, 3)
    sunGraphics.fillRect(-sunRadius * 0.16, -sunRadius * 0.16, 2, 3)
    
    sunGraphics.fillRect(sunRadius * 0.15, -sunRadius * 0.18, 2, 3)
    sunGraphics.fillRect(sunRadius * 0.17, -sunRadius * 0.17, 2, 3)
    sunGraphics.fillRect(sunRadius * 0.19, -sunRadius * 0.16, 2, 3)
    
    // Detalle decorativo en los ojos (líneas verticales incas)
    sunGraphics.lineStyle(1.5, intiOcre, 0.85)
    sunGraphics.beginPath()
    sunGraphics.moveTo(-sunRadius * 0.18, -sunRadius * 0.20)
    sunGraphics.lineTo(-sunRadius * 0.18, -sunRadius * 0.11)
    sunGraphics.strokePath()
    sunGraphics.beginPath()
    sunGraphics.moveTo(sunRadius * 0.18, -sunRadius * 0.20)
    sunGraphics.lineTo(sunRadius * 0.18, -sunRadius * 0.11)
    sunGraphics.strokePath()
    
    // Líneas horizontales decorativas en los ojos
    sunGraphics.lineStyle(1, intiGold, 0.7)
    for (let i = 0; i < 3; i++) {
      const yOffset = -sunRadius * 0.19 + i * 3
      sunGraphics.beginPath()
      sunGraphics.moveTo(-sunRadius * 0.22, yOffset)
      sunGraphics.lineTo(-sunRadius * 0.13, yOffset)
      sunGraphics.strokePath()
      sunGraphics.beginPath()
      sunGraphics.moveTo(sunRadius * 0.13, yOffset)
      sunGraphics.lineTo(sunRadius * 0.22, yOffset)
      sunGraphics.strokePath()
    }
    
    // Pupilas con diseño más complejo
    sunGraphics.fillStyle(intiRed, 0.9)
    sunGraphics.fillCircle(-sunRadius * 0.17, -sunRadius * 0.11, 3.5)
    sunGraphics.fillCircle(sunRadius * 0.17, -sunRadius * 0.11, 3.5)
    
    // Resaltes en los ojos (brillo dorado)
    sunGraphics.fillStyle(intiGold, 0.95)
    sunGraphics.fillCircle(-sunRadius * 0.15, -sunRadius * 0.13, 2)
    sunGraphics.fillCircle(sunRadius * 0.19, -sunRadius * 0.13, 2)
    
    // Boca con diseño escalonado mejorado (patrón típico de arte inca)
    sunGraphics.fillStyle(intiBronze, 0.9)
    // Escalones de la boca con variación de tamaño (más auténtico)
    const mouthSteps = [
      { x: -sunRadius * 0.22, w: 5, h: 4 },
      { x: -sunRadius * 0.17, w: 5, h: 4.5 },
      { x: -sunRadius * 0.12, w: 5, h: 4 },
      { x: -sunRadius * 0.07, w: 5, h: 4.5 },
      { x: -sunRadius * 0.02, w: 5, h: 4 },
      { x: sunRadius * 0.03, w: 5, h: 4.5 },
      { x: sunRadius * 0.08, w: 5, h: 4 },
      { x: sunRadius * 0.13, w: 5, h: 4.5 }
    ]
    for (const step of mouthSteps) {
      sunGraphics.fillRect(step.x, sunRadius * 0.14, step.w, step.h)
    }
    
    // Decoración adicional en la boca (líneas horizontales)
    sunGraphics.lineStyle(1, intiOcre, 0.6)
    for (let i = 0; i < 2; i++) {
      const yPos = sunRadius * 0.15 + i * 2
      sunGraphics.beginPath()
      sunGraphics.moveTo(-sunRadius * 0.22, yPos)
      sunGraphics.lineTo(sunRadius * 0.18, yPos)
      sunGraphics.strokePath()
    }
    
    // Líneas decorativas en forma de "V" invertida mejorada (patrón inca)
    sunGraphics.lineStyle(2.5, intiOcre, 0.75)
    sunGraphics.beginPath()
    sunGraphics.moveTo(-sunRadius * 0.18, sunRadius * 0.06)
    sunGraphics.lineTo(0, sunRadius * 0.13)
    sunGraphics.lineTo(sunRadius * 0.18, sunRadius * 0.06)
    sunGraphics.strokePath()
    
    // Patrón decorativo adicional: líneas en zigzag (arte textil inca)
    sunGraphics.lineStyle(1.5, intiBronze, 0.65)
    const zigzagY = sunRadius * 0.08
    sunGraphics.beginPath()
    sunGraphics.moveTo(-sunRadius * 0.15, zigzagY)
    sunGraphics.lineTo(-sunRadius * 0.10, zigzagY + 2)
    sunGraphics.lineTo(-sunRadius * 0.05, zigzagY)
    sunGraphics.lineTo(0, zigzagY + 2)
    sunGraphics.lineTo(sunRadius * 0.05, zigzagY)
    sunGraphics.lineTo(sunRadius * 0.10, zigzagY + 2)
    sunGraphics.lineTo(sunRadius * 0.15, zigzagY)
    sunGraphics.strokePath()
    
    // Líneas decorativas diagonales (patrón geométrico inca)
    sunGraphics.lineStyle(1.5, intiBronze, 0.6)
    for (let i = -1; i <= 1; i += 2) {
      sunGraphics.beginPath()
      sunGraphics.moveTo(i * sunRadius * 0.12, -sunRadius * 0.08)
      sunGraphics.lineTo(i * sunRadius * 0.25, sunRadius * 0.08)
      sunGraphics.strokePath()
    }
    
    // Patrón decorativo: pequeños cuadrados alrededor de la cara (arte inca)
    const faceDecorRadius = sunRadius * 0.35
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const x = Math.cos(angle) * faceDecorRadius
      const y = Math.sin(angle) * faceDecorRadius
      const smallSize = 2
      
      sunGraphics.fillStyle(i % 2 === 0 ? intiOcre : intiBronze, 0.6)
      sunGraphics.fillRect(x - smallSize / 2, y - smallSize / 2, smallSize, smallSize)
    }
    
    sunGraphics.setPosition(sunX, sunY)
    sunGraphics.setDepth(1)
    
    // Animación optimizada: pulso suave + brillo mínimo (sin rotación para mejor rendimiento)
    const sunContainer = this.scene.add.container(sunX, sunY)
    sunContainer.add(sunGraphics)
    sunGraphics.setPosition(0, 0)
    
    // Animación de pulso suave y eficiente
    this.scene.tweens.add({
      targets: sunContainer,
      scaleX: { from: 0.98, to: 1.02 },
      scaleY: { from: 0.98, to: 1.02 },
      duration: 8000, // Más lento = menos cálculos por segundo
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
    
    // Animación de brillo muy sutil (alpha ligero) - mínimo impacto en FPS
    this.scene.tweens.add({
      targets: sunGraphics,
      alpha: { from: 0.95, to: 1.0 },
      duration: 12000, // Muy lento para mínimo impacto
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
    
    this.animatedElements.push(sunContainer)
  }

}

