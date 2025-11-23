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

