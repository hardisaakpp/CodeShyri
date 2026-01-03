import type Phaser from 'phaser'

/**
 * Renderiza efectos visuales de maíz cuando se recolecta
 */
export class MaizeEffectRenderer {
  constructor(private scene: Phaser.Scene) {}

  /**
   * Muestra un efecto visual de maíz recolectado en una posición
   */
  public showMaizeCollect(x: number, y: number, amount: number, isPathBlock: boolean = false): void {
    // Crear contenedor para el efecto
    const container = this.scene.add.container(x, y)
    container.setDepth(10) // Por encima del grid y suelo

    // Color del maíz: amarillo/dorado para sendero, amarillo más pálido para pasto
    const maizeColor = isPathBlock ? 0xFFD700 : 0xFFEB3B // Dorado o amarillo
    
    // Crear partículas de maíz (granos individuales)
    const numParticles = Math.min(Math.ceil(amount / 10), 3) // Máximo 3 partículas
    const particles: Phaser.GameObjects.Graphics[] = []

    for (let i = 0; i < numParticles; i++) {
      const particle = this.scene.add.graphics()
      
      // Dibujar grano de maíz (forma ovalada)
      particle.fillStyle(maizeColor, 1)
      particle.fillEllipse(0, 0, 6, 8) // Grano de maíz pequeño
      
      // Añadir highlight
      particle.fillStyle(0xFFFFFF, 0.5)
      particle.fillEllipse(-1, -2, 3, 4)
      
      particle.setPosition(
        (Math.random() - 0.5) * 20, // Distribución aleatoria pequeña
        (Math.random() - 0.5) * 20
      )
      
      container.add(particle)
      particles.push(particle)
    }

    // Crear texto de cantidad (opcional, más sutil)
    const textStyle = {
      fontSize: '14px',
      fontFamily: 'Arial',
      fill: `#${maizeColor.toString(16).padStart(6, '0')}`,
      stroke: '#000000',
      strokeThickness: 2,
      fontWeight: 'bold'
    }
    
    const text = this.scene.add.text(0, -15, `+${amount}`, textStyle)
    text.setOrigin(0.5, 0.5)
    text.setDepth(11)
    container.add(text)

    // Animación: partículas suben y se desvanecen
    particles.forEach((particle, index) => {
      const angle = (index / numParticles) * Math.PI * 2
      const distance = 30 + Math.random() * 20
      const finalX = Math.cos(angle) * distance
      const finalY = -20 - Math.random() * 15 // Suben y se dispersan

      this.scene.tweens.add({
        targets: particle,
        x: finalX,
        y: finalY,
        alpha: 0,
        scale: 0.3,
        duration: 800 + Math.random() * 400,
        ease: 'Power2',
        delay: index * 50,
        onComplete: () => {
          particle.destroy()
        }
      })
    })

    // Animación del texto: sube y desaparece
    this.scene.tweens.add({
      targets: text,
      y: -40,
      alpha: 0,
      scale: 1.5,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        text.destroy()
        container.destroy()
      }
    })

    // Efecto de brillo/sombra en el suelo
    const glow = this.scene.add.graphics()
    glow.fillStyle(maizeColor, 0.3)
    glow.fillCircle(0, 0, 15)
    glow.setPosition(x, y)
    glow.setDepth(9)
    glow.setBlendMode(Phaser.BlendModes.ADD)

    this.scene.tweens.add({
      targets: glow,
      alpha: 0,
      scale: 2,
      duration: 600,
      ease: 'Power2',
      onComplete: () => {
        glow.destroy()
      }
    })
  }

  /**
   * Muestra efecto visual cuando se recolecta el premio final
   */
  public showGoalCollect(x: number, y: number, amount: number): void {
    // Efecto más grande y espectacular para el premio
    const container = this.scene.add.container(x, y)
    container.setDepth(12)
    container.setVisible(true)

    // Crear partículas para el premio (monedas/dinero)
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const distance = 50 + Math.random() * 40
      const particle = this.scene.add.graphics()
      
      // Dibujar moneda/dinero (círculo dorado)
      particle.fillStyle(0xFFD700, 1)
      particle.fillCircle(0, 0, 6)
      particle.lineStyle(2, 0xFFA500, 1)
      particle.strokeCircle(0, 0, 6)
      
      // Highlight en la moneda
      particle.fillStyle(0xFFFFFF, 0.8)
      particle.fillCircle(-2, -2, 2)
      
      particle.setPosition(0, 0)
      particle.setDepth(13)
      
      container.add(particle)

      this.scene.tweens.add({
        targets: particle,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance - 20, // Suben un poco
        alpha: 0,
        scale: 0.3,
        rotation: Math.random() * Math.PI * 2,
        duration: 1000 + Math.random() * 300,
        ease: 'Power2',
        delay: i * 40,
        onComplete: () => {
          if (particle && particle.active) {
            particle.destroy()
          }
        }
      })
    }

    // Texto grande del premio
    const text = this.scene.add.text(0, -30, `+${amount} MAÍZ!`, {
      fontSize: '28px',
      fontFamily: 'Arial',
      fill: '#FFD700',
      stroke: '#000000',
      strokeThickness: 4,
      fontWeight: 'bold',
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 5,
        stroke: true,
        fill: true
      }
    })
    text.setOrigin(0.5, 0.5)
    text.setDepth(14)
    text.setVisible(true)
    container.add(text)

    this.scene.tweens.add({
      targets: text,
      y: -70,
      alpha: 0,
      scale: 1.5,
      duration: 1500,
      ease: 'Back.easeOut',
      onComplete: () => {
        if (text && text.active) {
          text.destroy()
        }
        // Destruir contenedor solo si todas las partículas se han destruido
        this.scene.time.delayedCall(1200, () => {
          if (container && container.active) {
            container.destroy()
          }
        })
      }
    })

    // Brillo grande en el suelo
    const bigGlow = this.scene.add.graphics()
    bigGlow.fillStyle(0xFFD700, 0.6)
    bigGlow.fillCircle(0, 0, 35)
    bigGlow.setPosition(x, y)
    bigGlow.setDepth(11)
    bigGlow.setBlendMode(Phaser.BlendModes.ADD)
    bigGlow.setVisible(true)

    this.scene.tweens.add({
      targets: bigGlow,
      alpha: 0,
      scale: 2.5,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        if (bigGlow && bigGlow.active) {
          bigGlow.destroy()
        }
      }
    })

    // Efecto de pulso adicional
    const pulseGlow = this.scene.add.graphics()
    pulseGlow.fillStyle(0xFFD700, 0.3)
    pulseGlow.fillCircle(0, 0, 20)
    pulseGlow.setPosition(x, y)
    pulseGlow.setDepth(10)
    pulseGlow.setBlendMode(Phaser.BlendModes.ADD)
    pulseGlow.setVisible(true)

    this.scene.tweens.add({
      targets: pulseGlow,
      alpha: 0,
      scale: 4,
      duration: 600,
      ease: 'Power2',
      onComplete: () => {
        if (pulseGlow && pulseGlow.active) {
          pulseGlow.destroy()
        }
      }
    })
  }
}

