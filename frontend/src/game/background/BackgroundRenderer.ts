import type Phaser from 'phaser'

export class BackgroundRenderer {
  private scene: Phaser.Scene
  private width: number
  private height: number
  private horizonY: number
  private animatedElements: any[] = []

  constructor(scene: Phaser.Scene, width: number, height: number) {
    this.scene = scene
    this.width = width
    this.height = height
    this.horizonY = height * 0.6
  }

  /**
   * Renderiza todo el fondo del juego
   */
  public render() {
    const bgGraphics = this.scene.add.graphics()
    
    this.renderSky(bgGraphics)
    this.renderMountains(bgGraphics)
    this.renderGround(bgGraphics)
    const trees = this.renderTrees()
    const rocks = this.renderRocks()
    this.renderAnimatedElements()

    return {
      backgroundGraphics: bgGraphics,
      animatedElements: this.animatedElements,
      trees: trees,
      rocks: rocks
    }
  }

  /**
   * Renderiza el cielo con gradiente
   */
  private renderSky(graphics: Phaser.GameObjects.Graphics) {
    graphics.fillGradientStyle(
      0x4A90E2,  // Azul brillante superior izquierdo
      0x9B59B6,  // Púrpura superior derecho
      0xFF6B9D,  // Rosa inferior izquierdo
      0xFFA500   // Naranja brillante inferior derecho
    )
    graphics.fillRect(0, 0, this.width, this.horizonY)
  }

  /**
   * Renderiza las montañas en múltiples capas
   */
  private renderMountains(graphics: Phaser.GameObjects.Graphics) {
    // Montañas lejanas - capa 1
    graphics.fillStyle(0x6C5CE7, 0.7)
    this.drawMountainRange(graphics, this.horizonY - 30, 12, 15, 150)

    // Montañas medias - capa 2
    graphics.fillStyle(0x8E44AD, 0.85)
    this.drawMountainRange(graphics, this.horizonY - 10, 10, 20, 100)
    
    // Sombra de las montañas medias
    graphics.fillStyle(0x5B2C91, 0.6)
    this.drawMountainShadow(graphics, this.horizonY - 10, 10, 20)

    // Montañas cercanas - capa 3
    graphics.fillStyle(0x2ECC71, 1)
    this.drawMountainRange(graphics, this.horizonY, 8, 25, 60)
    
    // Detalles de textura en las montañas cercanas
    graphics.fillStyle(0x27AE60, 0.4)
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * this.width
      const y = this.horizonY - 40 + Math.random() * 40
      const size = 3 + Math.random() * 8
      graphics.fillCircle(x, y, size)
    }
  }

  /**
   * Dibuja una cadena de montañas
   */
  private drawMountainRange(
    graphics: Phaser.GameObjects.Graphics,
    baseY: number,
    points: number,
    variation: number,
    peakHeight: number
  ) {
    graphics.beginPath()
    graphics.moveTo(0, baseY)
    
    for (let i = 0; i <= points; i++) {
      const x = (this.width / points) * i
      const varAmount = Math.sin(i * 0.5) * variation + Math.cos(i * 0.3) * (variation * 0.5)
      const currentBaseY = baseY + varAmount
      const currentPeakY = baseY - peakHeight - Math.abs(varAmount) * 1.5
      const midX = x + (this.width / points) / 2
      
      if (i < points) {
        graphics.lineTo(midX, currentPeakY)
        graphics.lineTo(x + (this.width / points), currentBaseY)
      }
    }
    
    if (baseY === this.horizonY) {
      graphics.lineTo(this.width, this.height)
      graphics.lineTo(0, this.height)
    } else {
      graphics.lineTo(this.width, baseY)
    }
    
    graphics.closePath()
    graphics.fillPath()
  }

  /**
   * Dibuja la sombra de las montañas
   */
  private drawMountainShadow(
    graphics: Phaser.GameObjects.Graphics,
    baseY: number,
    points: number,
    variation: number
  ) {
    graphics.beginPath()
    graphics.moveTo(0, baseY)
    
    for (let i = 0; i <= points; i++) {
      const x = (this.width / points) * i
      const varAmount = Math.sin(i * 0.8) * variation + Math.cos(i * 0.3) * (variation * 0.5)
      const currentBaseY = baseY + varAmount
      const shadowY = currentBaseY + 15
      const midX = x + (this.width / points) / 2
      
      if (i === 0) graphics.lineTo(x, shadowY)
      if (i < points) {
        graphics.lineTo(midX, shadowY)
        graphics.lineTo(x + (this.width / points), shadowY)
      }
    }
    
    graphics.lineTo(this.width, this.horizonY + 5)
    graphics.lineTo(this.width, baseY)
    graphics.closePath()
    graphics.fillPath()
  }

  /**
   * Renderiza el suelo con textura
   */
  private renderGround(graphics: Phaser.GameObjects.Graphics) {
    // Suelo base
    graphics.fillStyle(0x27AE60, 1)
    graphics.fillRect(0, this.horizonY, this.width, this.height - this.horizonY)
    
    // Textura de hierba
    const grassColors = [0x16A085, 0x1ABC9C, 0x2ECC71, 0x52BE80, 0x229954]
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * this.width
      const y = this.horizonY + Math.random() * (this.height - this.horizonY)
      const size = 2 + Math.random() * 6
      const colorIndex = Math.floor(Math.random() * grassColors.length)
      graphics.fillStyle(grassColors[colorIndex], 0.3 + Math.random() * 0.4)
      graphics.fillCircle(x, y, size)
    }
    
    // Línea del horizonte
    graphics.lineStyle(2, 0xFFD700, 0.4)
    graphics.moveTo(0, this.horizonY)
    graphics.lineTo(this.width, this.horizonY)
    graphics.strokePath()
  }

  /**
   * Renderiza los árboles
   */
  private renderTrees() {
    const trees: Phaser.GameObjects.Graphics[] = []
    
    for (let i = 0; i < 8; i++) {
      const treeX = 50 + (this.width / 8) * i + Math.random() * 30
      const treeY = this.horizonY + 20 + Math.random() * 30
      const treeHeight = 40 + Math.random() * 50
      const trunkWidth = 8 + Math.random() * 6
      const crownSize = 25 + Math.random() * 30
      
      const treeGraphics = this.scene.add.graphics()
      
      // Tronco
      treeGraphics.fillStyle(0x8B4513, 1)
      treeGraphics.fillRect(-trunkWidth / 2, 0, trunkWidth, treeHeight)
      
      // Sombra del tronco
      treeGraphics.fillStyle(0x654321, 0.6)
      treeGraphics.fillRect(-trunkWidth / 2 + 2, 0, trunkWidth / 2, treeHeight)
      
      // Copa del árbol
      treeGraphics.fillStyle(0x2D5016, 0.9)
      treeGraphics.fillCircle(0, -treeHeight * 0.2, crownSize)
      treeGraphics.fillCircle(crownSize * 0.4, -treeHeight * 0.3, crownSize * 0.8)
      treeGraphics.fillCircle(-crownSize * 0.4, -treeHeight * 0.3, crownSize * 0.8)
      treeGraphics.fillCircle(0, -treeHeight * 0.5, crownSize * 0.7)
      
      // Capa superior más clara
      treeGraphics.fillStyle(0x3E7B27, 0.7)
      treeGraphics.fillCircle(0, -treeHeight * 0.25, crownSize * 0.7)
      treeGraphics.fillCircle(crownSize * 0.3, -treeHeight * 0.35, crownSize * 0.6)
      treeGraphics.fillCircle(-crownSize * 0.3, -treeHeight * 0.35, crownSize * 0.6)
      
      treeGraphics.setPosition(treeX, treeY)
      treeGraphics.setDepth(2)
      trees.push(treeGraphics)
    }
    
    return trees
  }

  /**
   * Renderiza las rocas
   */
  private renderRocks() {
    const rocks: Phaser.GameObjects.Graphics[] = []
    
    for (let i = 0; i < 12; i++) {
      const rockX = Math.random() * this.width
      const rockY = this.horizonY + 10 + Math.random() * (this.height - this.horizonY - 10)
      const rockSize = 8 + Math.random() * 15
      
      const rockGraphics = this.scene.add.graphics()
      
      // Forma de roca
      rockGraphics.fillStyle(0x5D6D7E, 1)
      rockGraphics.fillCircle(0, 0, rockSize)
      rockGraphics.fillCircle(rockSize * 0.3, rockSize * 0.2, rockSize * 0.6)
      rockGraphics.fillCircle(-rockSize * 0.3, rockSize * 0.2, rockSize * 0.6)
      rockGraphics.fillCircle(0, -rockSize * 0.3, rockSize * 0.7)
      
      // Sombra
      rockGraphics.fillStyle(0x34495E, 0.7)
      rockGraphics.fillCircle(-rockSize * 0.3, rockSize * 0.2, rockSize * 0.5)
      rockGraphics.fillCircle(rockSize * 0.2, rockSize * 0.3, rockSize * 0.4)
      
      // Resaltes
      rockGraphics.fillStyle(0x7F8C8D, 0.5)
      rockGraphics.fillCircle(rockSize * 0.2, -rockSize * 0.2, rockSize * 0.3)
      rockGraphics.fillCircle(-rockSize * 0.1, -rockSize * 0.3, rockSize * 0.25)
      
      rockGraphics.setPosition(rockX, rockY)
      rockGraphics.setDepth(2)
      rocks.push(rockGraphics)
    }
    
    return rocks
  }

  /**
   * Renderiza elementos animados (nubes, estrellas, sol)
   */
  private renderAnimatedElements() {
    this.renderClouds()
    this.renderStars()
    this.renderSun()
  }

  /**
   * Renderiza las nubes animadas
   */
  private renderClouds() {
    const clouds: Phaser.GameObjects.Graphics[] = []
    const cloudColors = [0xFFFFFF, 0xFFE5E5, 0xE8F4F8, 0xFFF4E6]
    
    for (let i = 0; i < 5; i++) {
      const startX = -200 - Math.random() * 200
      const cloudY = 50 + Math.random() * 100
      const cloudSize = 35 + Math.random() * 45
      const speed = 0.15 + Math.random() * 0.25
      const cloudColor = cloudColors[Math.floor(Math.random() * cloudColors.length)]
      
      const cloudGraphics = this.scene.add.graphics()
      cloudGraphics.fillStyle(cloudColor, 0.8)
      
      // Capa base
      cloudGraphics.fillCircle(0, 0, cloudSize)
      cloudGraphics.fillCircle(cloudSize * 0.7, 0, cloudSize * 0.9)
      cloudGraphics.fillCircle(-cloudSize * 0.7, 0, cloudSize * 0.9)
      cloudGraphics.fillCircle(cloudSize * 0.4, -cloudSize * 0.4, cloudSize * 0.8)
      cloudGraphics.fillCircle(-cloudSize * 0.4, -cloudSize * 0.4, cloudSize * 0.8)
      cloudGraphics.fillCircle(0, -cloudSize * 0.6, cloudSize * 0.75)
      
      // Capa superior
      cloudGraphics.fillStyle(cloudColor, 0.5)
      cloudGraphics.fillCircle(0, -cloudSize * 0.3, cloudSize * 0.6)
      cloudGraphics.fillCircle(cloudSize * 0.5, -cloudSize * 0.4, cloudSize * 0.5)
      cloudGraphics.fillCircle(-cloudSize * 0.5, -cloudSize * 0.4, cloudSize * 0.5)
      
      cloudGraphics.setPosition(startX, cloudY)
      cloudGraphics.setDepth(1)
      
      // Animación
      const createCloudAnimation = () => {
        const distance = this.width + 400
        const duration = (distance / speed) * 1000
        
        this.scene.tweens.add({
          targets: cloudGraphics,
          x: this.width + 200,
          duration: duration,
          ease: 'Linear',
          onComplete: () => {
            cloudGraphics.setX(-200)
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
   * Renderiza las estrellas animadas
   */
  private renderStars() {
    const stars: Phaser.GameObjects.Arc[] = []
    const starColors = [0xFFD700, 0xFF69B4, 0x00FFFF, 0xFFA500, 0xFF1493, 0x87CEEB]
    
    for (let i = 0; i < 40; i++) {
      const starX = Math.random() * this.width
      const starY = Math.random() * (this.horizonY - 50)
      const starSize = 1.5 + Math.random() * 3
      const twinkleDelay = Math.random() * 2000
      const starColor = starColors[Math.floor(Math.random() * starColors.length)]
      
      const star = this.scene.add.circle(starX, starY, starSize, starColor, 0.9)
      star.setDepth(1)
      
      this.scene.tweens.add({
        targets: star,
        alpha: { from: 0.4, to: 1 },
        scale: { from: 0.7, to: 1.5 },
        duration: 800 + Math.random() * 1200,
        delay: twinkleDelay,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      })
      
      stars.push(star)
    }
    
    this.animatedElements.push(...stars)
  }

  /**
   * Renderiza el sol animado
   */
  private renderSun() {
    const sunX = this.width * 0.85
    const sunY = this.height * 0.15
    
    const sunOuterGlow = this.scene.add.circle(sunX, sunY, 120, 0xFFD700, 0.3)
    sunOuterGlow.setDepth(1)
    
    const sunGlow = this.scene.add.circle(sunX, sunY, 90, 0xFFA500, 0.5)
    sunGlow.setDepth(1)
    
    const sun = this.scene.add.circle(sunX, sunY, 65, 0xFFA500, 0.9)
    sun.setDepth(1)
    
    const sunCore = this.scene.add.circle(sunX, sunY, 40, 0xFFFF00, 1)
    sunCore.setDepth(1)
    
    // Animación de pulso
    this.scene.tweens.add({
      targets: [sunOuterGlow, sunGlow, sun],
      alpha: { from: 0.25, to: 0.55 },
      scale: { from: 0.92, to: 1.08 },
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
    
    this.scene.tweens.add({
      targets: sunCore,
      scale: { from: 0.96, to: 1.04 },
      duration: 2200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
    
    this.animatedElements.push(sunOuterGlow, sunGlow, sun, sunCore)
  }
}

