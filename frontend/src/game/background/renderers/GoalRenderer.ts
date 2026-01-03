import type Phaser from 'phaser'
import { GridRenderer } from './GridRenderer'

/**
 * Renderer para el premio final/objetivo del nivel
 * Crea una bolsa de dinero (💰) que el jugador debe recolectar
 */
export class GoalRenderer {
  private goalGraphics: Phaser.GameObjects.Container | null = null
  private gridRenderer: GridRenderer
  private goalGridX: number
  private goalGridY: number
  private cellSize: number
  private horizonY: number
  private isCollected: boolean = false // Flag para rastrear si ya fue recolectado

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
   * Renderiza el premio final (bolsa de dinero 💰)
   */
  public render(): Phaser.GameObjects.Container {
    // Si ya existe, destruirlo primero
    if (this.goalGraphics) {
      this.destroy()
    }
    
    // Calcular posición en píxeles
    const position = this.gridRenderer.gridToPixel(this.goalGridX, this.goalGridY)
    console.log(`🎯 Renderizando bolsa de dinero en grid (${this.goalGridX}, ${this.goalGridY}) -> pixel (${position.pixelX}, ${position.pixelY})`)

    // Crear contenedor para la bolsa de dinero
    this.goalGraphics = this.scene.add.container(position.pixelX, position.pixelY)
    this.goalGraphics.setDepth(9) // Por encima del grid y maíz, pero debajo del jugador (que está en 10)
    this.goalGraphics.setVisible(true) // Asegurar visibilidad

    // Crear texto con emoji de bolsa de dinero - tamaño reducido
    const moneyText = this.scene.add.text(0, -10, '💰', {
      fontSize: '40px', // Tamaño reducido
      fontFamily: 'Arial, sans-serif',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4,
      shadow: {
        offsetX: 3,
        offsetY: 3,
        color: '#000000',
        blur: 10,
        stroke: true,
        fill: true
      }
    })
    moneyText.setOrigin(0.5, 0.5)
    moneyText.setVisible(true)
    moneyText.setDepth(10) // Asegurar que esté por encima

    // Crear brillo/resplandor alrededor - tamaño reducido
    const glowGraphics = this.scene.add.graphics()
    glowGraphics.fillStyle(0xFFD700, 0.35) // Dorado brillante
    glowGraphics.fillCircle(0, 0, 22) // Tamaño reducido
    glowGraphics.setBlendMode(Phaser.BlendModes.ADD)
    glowGraphics.setDepth(-1)

    // Sombra bajo la bolsa - tamaño reducido
    const shadowGraphics = this.scene.add.graphics()
    shadowGraphics.fillStyle(0x000000, 0.35)
    shadowGraphics.fillEllipse(0, 10, 20, 8) // Tamaño reducido
    shadowGraphics.setDepth(-2)

    // Agregar todos los elementos al contenedor
    this.goalGraphics.add([shadowGraphics, glowGraphics, moneyText])
    
    console.log(`✅ Bolsa de dinero creada en contenedor (${this.goalGraphics.x}, ${this.goalGraphics.y}) con depth ${this.goalGraphics.depth}`)

    // Animación de flotación suave
    this.scene.tweens.add({
      targets: moneyText,
      y: -15,
      duration: 1500 + Math.random() * 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Animación de pulso del brillo
    this.scene.tweens.add({
      targets: glowGraphics,
      alpha: { from: 0.3, to: 0.5 },
      scaleX: { from: 1, to: 1.3 },
      scaleY: { from: 1, to: 1.3 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Animación de rotación sutil
    this.scene.tweens.add({
      targets: moneyText,
      rotation: { from: -0.1, to: 0.1 },
      duration: 2000 + Math.random() * 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    return this.goalGraphics
  }

  /**
   * Verifica si el jugador está en la misma celda que el premio
   */
  public isPlayerAtGoal(playerGridX: number, playerGridY: number): boolean {
    // Solo devolver true si no ha sido recolectado y está en la posición correcta
    return !this.isCollected && playerGridX === this.goalGridX && playerGridY === this.goalGridY
  }

  /**
   * Obtiene la posición del objetivo en grid
   */
  public getGoalPosition(): { gridX: number; gridY: number } {
    return { gridX: this.goalGridX, gridY: this.goalGridY }
  }

  /**
   * Animación de recolección (la bolsa salta y desaparece)
   * Nota: Los efectos visuales de partículas se manejan en MaizeEffectRenderer
   */
  public collect(): void {
    // Si ya fue recolectado, no hacer nada
    if (this.isCollected || !this.goalGraphics) return
    
    // Marcar como recolectado
    this.isCollected = true

    // Cancelar todas las animaciones activas del contenedor y sus hijos
    this.scene.tweens.killTweensOf(this.goalGraphics)
    if (this.goalGraphics.list) {
      this.goalGraphics.list.forEach((child: any) => {
        this.scene.tweens.killTweensOf(child)
      })
    }

    // Animación de recolección: la bolsa salta y desaparece
    this.scene.tweens.add({
      targets: this.goalGraphics,
      y: this.goalGraphics.y - 40,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 500,
      ease: 'Back.easeOut',
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
    // Resetear el flag de recolectado
    this.isCollected = false
    
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

