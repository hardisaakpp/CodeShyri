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
    
    // Crear más nubes con variación
    const numClouds = 6 + Math.floor(Math.random() * 3) // 6-8 nubes
    
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
   * Dibuja una nube mejorada con múltiples capas y efectos de iluminación
   */
  private drawImprovedCloud(
    graphics: Phaser.GameObjects.Graphics,
    baseSize: number,
    colors: { base: number; shadow: number; highlight: number }
  ): void {
    // Capa de sombra (base oscura)
    graphics.fillStyle(colors.shadow, 0.3)
    
    // Múltiples círculos superpuestos para forma orgánica
    const numBaseCircles = 5 + Math.floor(Math.random() * 3)
    const baseCircles: { x: number; y: number; radius: number }[] = []
    
    for (let i = 0; i < numBaseCircles; i++) {
      const angle = (i / numBaseCircles) * Math.PI * 2
      const distance = baseSize * (0.3 + Math.random() * 0.4)
      const x = Math.cos(angle) * distance
      const y = Math.sin(angle) * distance * 0.5 // Aplanar verticalmente
      const radius = baseSize * (0.6 + Math.random() * 0.4)
      
      baseCircles.push({ x, y, radius })
      graphics.fillCircle(x, y, radius)
    }
    
    // Capa principal (color base)
    graphics.fillStyle(colors.base, 0.85)
    
    for (const circle of baseCircles) {
      // Círculo principal
      graphics.fillCircle(circle.x, circle.y, circle.radius * 0.95)
      
      // Círculos adicionales para volumen
      const numExtra = 2 + Math.floor(Math.random() * 2)
      for (let j = 0; j < numExtra; j++) {
        const offsetX = circle.x + (Math.random() - 0.5) * circle.radius * 0.6
        const offsetY = circle.y + (Math.random() - 0.5) * circle.radius * 0.4
        const extraRadius = circle.radius * (0.4 + Math.random() * 0.3)
        graphics.fillCircle(offsetX, offsetY, extraRadius)
      }
    }
    
    // Resaltes de luz (simulando iluminación desde arriba-izquierda)
    graphics.fillStyle(colors.highlight, 0.6)
    
    for (const circle of baseCircles) {
      // Resalte en la parte superior-izquierda
      const highlightX = circle.x - circle.radius * 0.3
      const highlightY = circle.y - circle.radius * 0.4
      const highlightRadius = circle.radius * (0.3 + Math.random() * 0.2)
      graphics.fillCircle(highlightX, highlightY, highlightRadius)
    }
    
    // Detalles adicionales de textura
    graphics.fillStyle(colors.base, 0.4)
    for (let i = 0; i < 8; i++) {
      const randomCircle = baseCircles[Math.floor(Math.random() * baseCircles.length)]
      const detailX = randomCircle.x + (Math.random() - 0.5) * randomCircle.radius
      const detailY = randomCircle.y + (Math.random() - 0.5) * randomCircle.radius * 0.6
      const detailRadius = randomCircle.radius * (0.15 + Math.random() * 0.15)
      graphics.fillCircle(detailX, detailY, detailRadius)
    }
    
    // Sombra suave en la parte inferior
    graphics.fillStyle(colors.shadow, 0.25)
    for (const circle of baseCircles) {
      const shadowX = circle.x + circle.radius * 0.2
      const shadowY = circle.y + circle.radius * 0.3
      const shadowRadius = circle.radius * 0.5
      graphics.fillEllipse(shadowX, shadowY, shadowRadius, shadowRadius * 0.6)
    }
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

