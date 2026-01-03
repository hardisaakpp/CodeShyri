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
    const numParticles = Math.min(amount / 3, 8) // Máximo 8 partículas
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

    // Crear más partículas para el premio
    for (let i = 0; i < 15; i++) {
      const angle = (i / 15) * Math.PI * 2
      const distance = 40 + Math.random() * 30
      const particle = this.scene.add.graphics()
      
      // Grano de maíz más grande y dorado
      particle.fillStyle(0xFFD700, 1)
      particle.fillEllipse(0, 0, 8, 10)
      particle.fillStyle(0xFFFFFF, 0.6)
      particle.fillEllipse(-1, -2, 4, 5)
      
      particle.setPosition(
        Math.cos(angle) * 10,
        Math.sin(angle) * 10
      )
      
      container.add(particle)

      this.scene.tweens.add({
        targets: particle,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        alpha: 0,
        scale: 0.5,
        rotation: Math.random() * Math.PI * 2,
        duration: 1200 + Math.random() * 400,
        ease: 'Power2',
        delay: i * 30,
        onComplete: () => {
          particle.destroy()
        }
      })
    }

    // Texto grande del premio
    const text = this.scene.add.text(0, -20, `+${amount} MAÍZ!`, {
      fontSize: '20px',
      fontFamily: 'Arial',
      fill: '#FFD700',
      stroke: '#000000',
      strokeThickness: 3,
      fontWeight: 'bold'
    })
    text.setOrigin(0.5, 0.5)
    text.setDepth(13)
    container.add(text)

    this.scene.tweens.add({
      targets: text,
      y: -60,
      alpha: 0,
      scale: 1.8,
      duration: 1500,
      ease: 'Back.easeOut',
      onComplete: () => {
        text.destroy()
        container.destroy()
      }
    })

    // Brillo grande
    const bigGlow = this.scene.add.graphics()
    bigGlow.fillStyle(0xFFD700, 0.5)
    bigGlow.fillCircle(0, 0, 25)
    bigGlow.setPosition(x, y)
    bigGlow.setDepth(11)
    bigGlow.setBlendMode(Phaser.BlendModes.ADD)

    this.scene.tweens.add({
      targets: bigGlow,
      alpha: 0,
      scale: 3,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        bigGlow.destroy()
      }
    })
  }
}

