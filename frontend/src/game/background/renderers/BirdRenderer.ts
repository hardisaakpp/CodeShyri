import type Phaser from 'phaser'

export class BirdRenderer {
  constructor(
    private scene: Phaser.Scene,
    private width: number,
    private horizonY: number
  ) {}

  /**
   * Renderiza aves volando en el cielo
   */
  public render(): Phaser.GameObjects.Graphics[] {
    const birds: Phaser.GameObjects.Graphics[] = []
    const numBirds = 4 + Math.floor(Math.random() * 3) // 4-6 aves
    
    for (let i = 0; i < numBirds; i++) {
      // Posición inicial aleatoria en el cielo
      const startX = Math.random() * this.width
      const startY = this.horizonY * (0.2 + Math.random() * 0.5) // En la parte superior del cielo
      const birdSize = 3 + Math.random() * 2 // Tamaño pequeño: 3-5 píxeles
      
      const birdGraphics = this.scene.add.graphics()
      
      // Cuerpo de la ave (pequeño punto)
      birdGraphics.fillStyle(0x2C2C2C, 1) // Gris oscuro
      birdGraphics.fillCircle(0, 0, birdSize)
      
      // Alas (pequeñas formas de V)
      birdGraphics.fillStyle(0x1A1A1A, 1) // Gris muy oscuro
      birdGraphics.beginPath()
      birdGraphics.moveTo(-birdSize * 0.8, 0)
      birdGraphics.lineTo(-birdSize * 1.5, -birdSize * 0.6)
      birdGraphics.lineTo(-birdSize * 1.2, 0)
      birdGraphics.closePath()
      birdGraphics.fillPath()
      
      birdGraphics.beginPath()
      birdGraphics.moveTo(birdSize * 0.8, 0)
      birdGraphics.lineTo(birdSize * 1.5, -birdSize * 0.6)
      birdGraphics.lineTo(birdSize * 1.2, 0)
      birdGraphics.closePath()
      birdGraphics.fillPath()
      
      birdGraphics.setPosition(startX, startY)
      birdGraphics.setDepth(1.2) // Por encima del cielo pero debajo de nubes
      
      // Animación de vuelo (movimiento horizontal con pequeñas variaciones verticales)
      const flightDistance = this.width * (1.2 + Math.random() * 0.5) // Vuelan más allá del ancho
      const flightSpeed = 15000 + Math.random() * 10000 // 15-25 segundos
      const verticalVariation = 20 + Math.random() * 30 // Variación vertical
      
      // Animación principal (vuelo horizontal)
      this.scene.tweens.add({
        targets: birdGraphics,
        x: startX + flightDistance,
        duration: flightSpeed,
        ease: 'Linear',
        onComplete: () => {
          // Reiniciar posición cuando sale de pantalla
          birdGraphics.setPosition(-50, startY + (Math.random() - 0.5) * 40)
        }
      })
      
      // Animación de aleteo (movimiento vertical sutil)
      this.scene.tweens.add({
        targets: birdGraphics,
        y: startY + (Math.random() - 0.5) * verticalVariation,
        duration: 2000 + Math.random() * 1000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      })
      
      birds.push(birdGraphics)
    }
    
    return birds
  }
}

