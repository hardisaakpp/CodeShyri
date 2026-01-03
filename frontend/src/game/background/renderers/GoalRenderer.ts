import type Phaser from 'phaser'
import { GridRenderer } from './GridRenderer'

/**
 * Renderer para el premio final/objetivo del nivel
 * Crea un cofre o moneda andina que el jugador debe recolectar
 */
export class GoalRenderer {
  private goalGraphics: Phaser.GameObjects.Container | null = null
  private gridRenderer: GridRenderer
  private goalGridX: number
  private goalGridY: number
  private cellSize: number
  private horizonY: number

  constructor(
    private scene: Phaser.Scene,
    gridRenderer: GridRenderer,
    goalGridX: number,
    goalGridY: number,
    horizonY: number
  ) {
    this.gridRenderer = gridRenderer
    this.goalGridX = goalGridX
    this.goalGridY = goalGridY
    this.cellSize = gridRenderer.getCellSize()
    this.horizonY = horizonY
  }

  /**
   * Renderiza el premio final (cofre andino)
   */
  public render(): Phaser.GameObjects.Container {
    // Calcular posición en píxeles
    const position = this.gridRenderer.gridToPixel(this.goalGridX, this.goalGridY)

    // Crear contenedor para el cofre
    this.goalGraphics = this.scene.add.container(position.pixelX, position.pixelY)
    this.goalGraphics.setDepth(8) // Por encima del grid pero debajo del jugador

    // Dibujar cofre andino (estilo quipu/tesoro inca)
    const chestGraphics = this.scene.add.graphics()

    // Base del cofre (caja de piedra)
    const chestWidth = this.cellSize * 0.6
    const chestHeight = this.cellSize * 0.5

    // Cuerpo principal del cofre (dorado con detalles incas)
    const chestColor = 0xD4AF37 // Dorado
    const chestDark = 0xB8941F // Dorado oscuro
    const chestLight = 0xF4D03F // Dorado claro

    // Base/cuerpo del cofre
    chestGraphics.fillStyle(chestColor, 1)
    chestGraphics.fillRoundedRect(
      -chestWidth / 2,
      -chestHeight / 2,
      chestWidth,
      chestHeight,
      4
    )

    // Tapa del cofre (levemente abierta)
    const lidHeight = chestHeight * 0.25
    chestGraphics.fillStyle(chestDark, 1)
    chestGraphics.fillRoundedRect(
      -chestWidth / 2,
      -chestHeight / 2 - lidHeight * 0.3,
      chestWidth,
      lidHeight,
      4
    )

    // Borde superior de la tapa (highlight)
    chestGraphics.fillStyle(chestLight, 0.8)
    chestGraphics.fillRect(
      -chestWidth / 2 + 2,
      -chestHeight / 2 - lidHeight * 0.3,
      chestWidth - 4,
      2
    )

    // Detalles incas (patrones geométricos)
    // Líneas verticales decorativas
    const patternColor = 0x8B6914 // Dorado muy oscuro
    chestGraphics.lineStyle(2, patternColor, 0.6)
    const numPatterns = 3
    for (let i = 1; i < numPatterns; i++) {
      const x = -chestWidth / 2 + (chestWidth / numPatterns) * i
      chestGraphics.lineBetween(x, -chestHeight / 2, x, chestHeight / 2)
    }

    // Símbolo inca en el centro (Inti - sol)
    const symbolSize = chestWidth * 0.2
    chestGraphics.fillStyle(0xFFD700, 0.9)
    chestGraphics.fillCircle(0, 0, symbolSize)
    
    // Rayos del sol
    const rays = 8
    const rayLength = symbolSize * 0.4
    chestGraphics.lineStyle(2, 0xFFD700, 0.8)
    for (let i = 0; i < rays; i++) {
      const angle = (i / rays) * Math.PI * 2
      const startX = Math.cos(angle) * symbolSize
      const startY = Math.sin(angle) * symbolSize
      const endX = Math.cos(angle) * (symbolSize + rayLength)
      const endY = Math.sin(angle) * (symbolSize + rayLength)
      chestGraphics.lineBetween(startX, startY, endX, endY)
    }

    // Brillo/resplandor alrededor del cofre
    const glowGraphics = this.scene.add.graphics()
    glowGraphics.fillStyle(0xFFD700, 0.2)
    glowGraphics.fillCircle(0, 0, chestWidth * 0.8)
    glowGraphics.setBlendMode(Phaser.BlendModes.ADD)

    // Sombra bajo el cofre
    const shadowGraphics = this.scene.add.graphics()
    shadowGraphics.fillStyle(0x000000, 0.3)
    shadowGraphics.fillEllipse(0, chestHeight / 2 + 5, chestWidth * 0.8, chestHeight * 0.2)

    // Agregar todos los elementos al contenedor
    this.goalGraphics.add([shadowGraphics, glowGraphics, chestGraphics])

    // Animación de flotación suave
    this.scene.tweens.add({
      targets: this.goalGraphics,
      y: position.pixelY - 5,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Animación de pulso del brillo
    this.scene.tweens.add({
      targets: glowGraphics,
      alpha: { from: 0.2, to: 0.4 },
      scaleX: { from: 1, to: 1.2 },
      scaleY: { from: 1, to: 1.2 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Animación de rotación sutil del símbolo
    this.scene.tweens.add({
      targets: chestGraphics,
      rotation: Math.PI * 2,
      duration: 8000,
      repeat: -1,
      ease: 'Linear'
    })

    return this.goalGraphics
  }

  /**
   * Verifica si el jugador está en la misma celda que el premio
   */
  public isPlayerAtGoal(playerGridX: number, playerGridY: number): boolean {
    return playerGridX === this.goalGridX && playerGridY === this.goalGridY
  }

  /**
   * Obtiene la posición del objetivo en grid
   */
  public getGoalPosition(): { gridX: number; gridY: number } {
    return { gridX: this.goalGridX, gridY: this.goalGridY }
  }

  /**
   * Animación de recolección (el cofre se abre y desaparece)
   */
  public collect(): void {
    if (!this.goalGraphics) return

    // Crear partículas de recolección
    const particles = this.scene.add.particles(
      this.goalGraphics.x,
      this.goalGraphics.y,
      'particle', // Usaremos gráficos simples
      {
        speed: { min: 50, max: 150 },
        scale: { start: 0.8, end: 0 },
        lifespan: 1000,
        tint: [0xFFD700, 0xD4AF37, 0xF4D03F], // Tintes dorados
        quantity: 20
      }
    )

    // Si no hay sistema de partículas, crear partículas simples
    if (!particles) {
      // Crear partículas manuales
      for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2
        const distance = 50 + Math.random() * 50
        const particle = this.scene.add.graphics()
        particle.fillStyle(0xFFD700, 1)
        particle.fillCircle(0, 0, 3)
        particle.setPosition(this.goalGraphics.x, this.goalGraphics.y)

        this.scene.tweens.add({
          targets: particle,
          x: this.goalGraphics.x + Math.cos(angle) * distance,
          y: this.goalGraphics.y + Math.sin(angle) * distance,
          alpha: 0,
          scale: 0,
          duration: 800,
          onComplete: () => particle.destroy()
        })
      }
    }

    // Animación de apertura del cofre
    this.scene.tweens.add({
      targets: this.goalGraphics,
      scaleY: 0.3,
      scaleX: 1.1,
      alpha: 0,
      duration: 500,
      ease: 'Back.easeIn',
      onComplete: () => {
        if (this.goalGraphics) {
          this.goalGraphics.destroy()
          this.goalGraphics = null
        }
      }
    })
  }

  /**
   * Restaura el premio si fue recolectado
   */
  public restore(): void {
    // Verificar si el premio necesita ser recreado
    const needsRestore = !this.goalGraphics || 
                         !this.goalGraphics.active || 
                         !this.goalGraphics.scene
    
    if (needsRestore) {
      // Cancelar todas las animaciones relacionadas antes de destruir
      if (this.goalGraphics) {
        try {
          // Cancelar todas las animaciones del contenedor y sus hijos
          this.scene.tweens.killTweensOf(this.goalGraphics)
          // Cancelar animaciones de todos los elementos dentro del contenedor
          if (this.goalGraphics.list) {
            this.goalGraphics.list.forEach((child: any) => {
              this.scene.tweens.killTweensOf(child)
            })
          }
          this.goalGraphics.destroy()
        } catch (e) {
          // Si hay un error al destruir, simplemente continuar
          console.warn('Error al destruir goalGraphics:', e)
        }
      }
      this.goalGraphics = null
      // Recrear el premio
      this.render()
    }
  }

  /**
   * Verifica si el premio está visible
   */
  public isVisible(): boolean {
    return this.goalGraphics !== null && this.goalGraphics.active
  }

  /**
   * Destruye el renderer
   */
  public destroy(): void {
    if (this.goalGraphics) {
      // Cancelar todas las animaciones del premio
      this.scene.tweens.killTweensOf(this.goalGraphics)
      this.goalGraphics.destroy()
      this.goalGraphics = null
    }
  }
}

