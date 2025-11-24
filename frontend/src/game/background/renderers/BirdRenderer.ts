import type Phaser from 'phaser'

interface BirdData {
  graphics: Phaser.GameObjects.Graphics
  startY: number
  flightSpeed: number
  verticalVariation: number
  birdSize: number
}

export class BirdRenderer {
  private birdsData: BirdData[] = []
  private birds: Phaser.GameObjects.Graphics[] = []
  private maxBirds = 8 // Número máximo de aves simultáneas

  constructor(
    private scene: Phaser.Scene,
    private width: number,
    private horizonY: number
  ) {}

  /**
   * Renderiza aves volando en el cielo
   * Las aves aparecen continuamente y vuelven a entrar periódicamente
   */
  public render(): Phaser.GameObjects.Graphics[] {
    const numBirds = 4 + Math.floor(Math.random() * 3) // 4-6 aves iniciales
    
    // Crear aves iniciales
    for (let i = 0; i < numBirds; i++) {
      this.createBird(i === 0)
    }
    
    // Iniciar sistema de aves periódicas (nuevas aves aparecen cada cierto tiempo)
    this.startPeriodicBirds()
    
    return this.birds
  }

  /**
   * Crea una nueva ave
   * @param immediate Si es true, aparece inmediatamente. Si es false, aparece desde fuera de la pantalla
   */
  private createBird(immediate: boolean = false): void {
    if (this.birdsData.length >= this.maxBirds) return // Límite de aves simultáneas
    
    const birdSize = 3 + Math.random() * 2 // Tamaño pequeño: 3-5 píxeles
    const startY = this.horizonY * (0.2 + Math.random() * 0.5) // En la parte superior del cielo
    const startX = immediate ? Math.random() * this.width : -50 // Aparecer desde fuera o dentro
    const flightSpeed = 15000 + Math.random() * 10000 // 15-25 segundos
    const verticalVariation = 20 + Math.random() * 30 // Variación vertical
    
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
    
    // Guardar datos del ave
    const birdData: BirdData = {
      graphics: birdGraphics,
      startY: startY,
      flightSpeed: flightSpeed,
      verticalVariation: verticalVariation,
      birdSize: birdSize
    }
    this.birdsData.push(birdData)
    this.birds.push(birdGraphics)
    
    // Iniciar animación de vuelo
    this.startBirdAnimation(birdData)
  }

  /**
   * Inicia la animación de vuelo para un ave
   */
  private startBirdAnimation(birdData: BirdData): void {
    const { graphics, startY, flightSpeed, verticalVariation } = birdData
    const currentX = graphics.x
    const flightDistance = this.width * (1.2 + Math.random() * 0.5)
    
    // Animación principal (vuelo horizontal) - con bucle continuo
    this.scene.tweens.add({
      targets: graphics,
      x: currentX + flightDistance,
      duration: flightSpeed,
      ease: 'Linear',
      onComplete: () => {
        // Reiniciar posición y animación cuando sale de pantalla
        const newY = this.horizonY * (0.2 + Math.random() * 0.5)
        graphics.setPosition(-50, newY)
        birdData.startY = newY
        
        // Reiniciar la animación horizontal
        this.startBirdAnimation(birdData)
      }
    })
    
    // Animación de aleteo (movimiento vertical sutil) - infinita
    this.scene.tweens.add({
      targets: graphics,
      y: startY + (Math.random() - 0.5) * verticalVariation,
      duration: 2000 + Math.random() * 1000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    })
  }

  /**
   * Inicia el sistema de aves periódicas (nuevas aves aparecen cada cierto tiempo)
   */
  private startPeriodicBirds(): void {
    const createNewBird = () => {
      // Solo crear nueva ave si no hemos alcanzado el límite
      if (this.birdsData.length < this.maxBirds) {
        this.createBird(false) // Aparece desde fuera de la pantalla
      }
      
      // Programar próxima ave (cada 8-15 segundos)
      const nextBirdDelay = 8000 + Math.random() * 7000
      this.scene.time.delayedCall(nextBirdDelay, createNewBird)
    }
    
    // Iniciar primera ave periódica después de un delay inicial (5-10 segundos)
    this.scene.time.delayedCall(5000 + Math.random() * 5000, createNewBird)
  }
}

