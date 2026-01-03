import type Phaser from 'phaser'
import { GridRenderer } from './GridRenderer'

/**
 * Renderiza una fogata/campfire como obstáculo que penaliza al jugador
 */
export class FireRenderer {
  private fireContainer?: Phaser.GameObjects.Container
  private fireGraphics?: Phaser.GameObjects.Graphics
  private sparksGraphics?: Phaser.GameObjects.Graphics[]
  private animationTween?: Phaser.Tweens.Tween
  private fireGridX?: number
  private fireGridY?: number

  constructor(
    private scene: Phaser.Scene,
    private gridRenderer: GridRenderer,
    private horizonY: number
  ) {}

  /**
   * Calcula la posición del final del primer camino
   * Encuentra la primera posición donde el path cambia de dirección
   */
  public static calculateFirstPathEnd(
    path: Array<{ x: number; y: number }>
  ): { gridX: number; gridY: number } | null {
    if (!path || path.length < 2) return null

    // Encontrar el primer cambio de dirección
    for (let i = 1; i < path.length; i++) {
      const prev = path[i - 1]
      const current = path[i]
      const next = path[i + 1]

      // Calcular dirección actual
      const deltaX = current.x - prev.x
      const deltaY = current.y - prev.y

      // Si hay siguiente punto, verificar cambio de dirección
      if (next) {
        const nextDeltaX = next.x - current.x
        const nextDeltaY = next.y - current.y

        // Si cambió de dirección (horizontal a vertical o viceversa)
        if ((deltaX !== 0 && nextDeltaX === 0) || (deltaY !== 0 && nextDeltaY === 0)) {
          // Retornar la posición anterior al cambio (final del primer segmento)
          return { gridX: current.x, gridY: current.y }
        }
      }
    }

    // Si no hay cambio claro, usar la segunda posición del path
    return path.length >= 2 ? { gridX: path[1].x, gridY: path[1].y } : null
  }

  /**
   * Retorna la posición del final del primer camino (bloque café)
   * La fogata debe estar directamente en el último bloque café del primer segmento
   */
  public static calculateFirePosition(
    pathEnd: { gridX: number; gridY: number }
  ): { gridX: number; gridY: number } {
    // La fogata va directamente en el último bloque café del primer segmento
    return pathEnd
  }

  /**
   * Renderiza la fogata en una posición específica del grid (debe ser un bloque café/path)
   */
  public render(
    gridX: number,
    gridY: number
  ): Phaser.GameObjects.Container | null {

    // Convertir posición del grid a píxeles (centro de la celda)
    const pixelPos = this.gridRenderer.gridToPixel(gridX, gridY)
    const fireX = pixelPos.pixelX
    const fireY = pixelPos.pixelY

    // Guardar coordenadas de grid
    this.fireGridX = gridX
    this.fireGridY = gridY

    // Crear contenedor para la fogata
    this.fireContainer = this.scene.add.container(fireX, fireY)
    this.fireContainer.setDepth(6) // Por encima del grid (grid está en depth 5) pero debajo del jugador

    // Crear gráficos para la fogata
    this.fireGraphics = this.scene.add.graphics()
    this.fireContainer.add(this.fireGraphics)

    // Dibujar leños/base de la fogata
    this.drawFireBase(this.fireGraphics)

    // Dibujar llamas
    this.drawFlames(this.fireGraphics)

    // Crear partículas de chispas
    this.sparksGraphics = []
    this.createSparks(this.fireContainer)

    // Iniciar animación
    this.startAnimation()

    return this.fireContainer
  }

  /**
   * Dibuja la base de la fogata (leños)
   */
  private drawFireBase(graphics: Phaser.GameObjects.Graphics): void {
    const logWidth = 25
    const logHeight = 8

    // Leño 1 (horizontal, atrás)
    graphics.fillStyle(0x6B4E3D, 1) // Marrón oscuro
    graphics.fillRect(-logWidth / 2, logHeight / 4, logWidth, logHeight)

    // Leño 2 (horizontal, delante, más pequeño)
    graphics.fillStyle(0x8B5E4D, 0.9) // Marrón medio
    graphics.fillRect(-logWidth * 0.4, logHeight * 0.6, logWidth * 0.8, logHeight * 0.7)

    // Leño 3 (perpendicular, más pequeño, al lado)
    graphics.fillStyle(0x5B3E2D, 1) // Marrón muy oscuro
    graphics.fillRect(logWidth * 0.3, -logHeight * 0.3, logWidth * 0.5, logHeight * 0.9)

    // Detalles/textura de los leños
    graphics.fillStyle(0x4B3E2D, 0.6) // Sombra
    graphics.fillRect(-logWidth * 0.45, logHeight * 0.3, logWidth * 0.3, 2)
    graphics.fillRect(logWidth * 0.15, logHeight * 0.35, logWidth * 0.3, 2)
  }

  /**
   * Dibuja las llamas de la fogata
   */
  private drawFlames(graphics: Phaser.GameObjects.Graphics): void {
    const flameHeight = 35
    const flameWidth = 20

    // Llama central (más grande)
    graphics.fillStyle(0xFF6600, 0.9) // Naranja
    graphics.beginPath()
    graphics.moveTo(0, 0)
    graphics.lineTo(-flameWidth * 0.4, -flameHeight * 0.8)
    graphics.lineTo(-flameWidth * 0.2, -flameHeight)
    graphics.lineTo(0, -flameHeight * 0.9)
    graphics.lineTo(flameWidth * 0.2, -flameHeight)
    graphics.lineTo(flameWidth * 0.4, -flameHeight * 0.8)
    graphics.closePath()
    graphics.fillPath()

    // Llama izquierda
    graphics.fillStyle(0xFF4400, 0.85) // Naranja oscuro
    graphics.beginPath()
    graphics.moveTo(-flameWidth * 0.3, 0)
    graphics.lineTo(-flameWidth * 0.6, -flameHeight * 0.7)
    graphics.lineTo(-flameWidth * 0.5, -flameHeight * 0.85)
    graphics.lineTo(-flameWidth * 0.35, -flameHeight * 0.75)
    graphics.closePath()
    graphics.fillPath()

    // Llama derecha
    graphics.fillStyle(0xFF4400, 0.85) // Naranja oscuro
    graphics.beginPath()
    graphics.moveTo(flameWidth * 0.3, 0)
    graphics.lineTo(flameWidth * 0.6, -flameHeight * 0.7)
    graphics.lineTo(flameWidth * 0.5, -flameHeight * 0.85)
    graphics.lineTo(flameWidth * 0.35, -flameHeight * 0.75)
    graphics.closePath()
    graphics.fillPath()

    // Núcleo amarillo (centro de las llamas)
    graphics.fillStyle(0xFFFF00, 0.7) // Amarillo
    graphics.beginPath()
    graphics.moveTo(0, -flameHeight * 0.3)
    graphics.lineTo(-flameWidth * 0.15, -flameHeight * 0.6)
    graphics.lineTo(0, -flameHeight * 0.55)
    graphics.lineTo(flameWidth * 0.15, -flameHeight * 0.6)
    graphics.closePath()
    graphics.fillPath()
  }

  /**
   * Crea partículas de chispas alrededor de la fogata
   */
  private createSparks(container: Phaser.GameObjects.Container): void {
    const numSparks = 5

    for (let i = 0; i < numSparks; i++) {
      const spark = this.scene.add.graphics()
      spark.fillStyle(0xFFAA00, 1) // Naranja amarillo
      spark.fillCircle(0, 0, 2) // Chispa pequeña
      
      // Posición inicial aleatoria alrededor de la fogata
      const angle = (Math.PI * 2 * i) / numSparks + Math.random() * 0.5
      const distance = 15 + Math.random() * 10
      const initialX = Math.cos(angle) * distance
      const initialY = Math.sin(angle) * distance - 20 // Ligeramente arriba
      
      spark.setPosition(initialX, initialY)
      container.add(spark)
      this.sparksGraphics?.push(spark)
    }
  }

  /**
   * Inicia la animación de la fogata (llamas moviéndose y chispas)
   */
  private startAnimation(): void {
    if (!this.fireGraphics || !this.sparksGraphics) return

    // Animación de las llamas (parpadeo y movimiento)
    this.scene.tweens.add({
      targets: this.fireGraphics,
      scaleX: { from: 0.95, to: 1.05 },
      scaleY: { from: 0.98, to: 1.02 },
      duration: 500 + Math.random() * 300,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Animación de chispas (suben y se desvanecen)
    this.sparksGraphics.forEach((spark, index) => {
      const delay = index * 200 // Escalonar las animaciones
      
      this.scene.tweens.add({
        targets: spark,
        y: { from: spark.y, to: spark.y - 30 },
        alpha: { from: 1, to: 0 },
        duration: 1500 + Math.random() * 500,
        repeat: -1,
        delay: delay,
        ease: 'Power1.easeOut',
        onRepeat: () => {
          // Resetear posición y alpha al repetir
          spark.setPosition(spark.x, spark.y + 30)
          spark.setAlpha(1)
        }
      })
    })
  }

  /**
   * Obtiene la posición de grid de la fogata
   */
  public getFireGridPosition(): { gridX: number; gridY: number } | null {
    if (this.fireGridX === undefined || this.fireGridY === undefined) return null
    return { gridX: this.fireGridX, gridY: this.fireGridY }
  }

  /**
   * Verifica si el jugador está en la posición de la fogata
   */
  public isPlayerAtFire(gridX: number, gridY: number): boolean {
    if (this.fireGridX === undefined || this.fireGridY === undefined) return false
    return this.fireGridX === gridX && this.fireGridY === gridY
  }

  /**
   * Destruye la fogata y limpia recursos
   */
  public destroy(): void {
    if (this.animationTween) {
      this.animationTween.stop()
    }
    
    if (this.sparksGraphics) {
      this.sparksGraphics.forEach(spark => {
        this.scene.tweens.killTweensOf(spark)
        spark.destroy()
      })
      this.sparksGraphics = []
    }

    if (this.fireGraphics) {
      this.scene.tweens.killTweensOf(this.fireGraphics)
    }

    if (this.fireContainer) {
      this.fireContainer.destroy(true)
      this.fireContainer = undefined
    }
  }
}

