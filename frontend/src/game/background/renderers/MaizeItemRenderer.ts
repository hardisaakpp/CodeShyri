import type Phaser from 'phaser'
import { GridRenderer } from './GridRenderer'

/**
 * Renderiza objetos de maíz visibles en el grid
 */
export class MaizeItemRenderer {
  private maizeItems: Map<string, Phaser.GameObjects.Container> = new Map()
  private gridRenderer: GridRenderer
  private cellSize: number
  private horizonY: number

  constructor(
    private scene: Phaser.Scene,
    gridRenderer: GridRenderer,
    horizonY: number
  ) {
    this.gridRenderer = gridRenderer
    this.cellSize = gridRenderer.getCellSize()
    this.horizonY = horizonY
  }

  /**
   * Coloca emojis de maíz en algunas celdas del grid
   * @param positions Array de posiciones {gridX, gridY} donde colocar maíz
   */
  public placeMaizeItems(positions: Array<{ gridX: number; gridY: number }>): void {
    // Limpiar items existentes
    this.clearAll()

    console.log(`🌽 Colocando ${positions.length} emojis de maíz en el grid`)

    positions.forEach(pos => {
      const key = `${pos.gridX},${pos.gridY}`
      
      // Calcular posición en píxeles
      const pixelPos = this.gridRenderer.gridToPixel(pos.gridX, pos.gridY)
      console.log(`  - Maíz en grid (${pos.gridX}, ${pos.gridY}) -> pixel (${pixelPos.pixelX}, ${pixelPos.pixelY})`)

      // Crear contenedor para el emoji de maíz
      const container = this.scene.add.container(pixelPos.pixelX, pixelPos.pixelY)
      container.setDepth(10) // Por encima del grid pero debajo del jugador (que está en depth 11+)

      // Crear texto con emoji de maíz - tamaño reducido
      const maizeText = this.scene.add.text(0, -10, '🌽', {
        fontSize: '28px', // Tamaño reducido
        fontFamily: 'Arial, sans-serif',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 2,
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: '#000000',
          blur: 6,
          stroke: true,
          fill: true
        }
      })
      maizeText.setOrigin(0.5, 0.5)
      maizeText.setVisible(true) // Asegurar que sea visible

      // Crear brillo sutil alrededor - tamaño reducido
      const glow = this.scene.add.graphics()
      glow.fillStyle(0xFFD700, 0.2)
      glow.fillCircle(0, 0, 15) // Tamaño reducido
      glow.setBlendMode(Phaser.BlendModes.ADD)
      glow.setDepth(-1)

      // Sombra debajo del maíz - tamaño reducido
      const shadow = this.scene.add.graphics()
      shadow.fillStyle(0x000000, 0.25)
      shadow.fillEllipse(0, 7, 12, 5) // Tamaño reducido
      shadow.setDepth(-2)

      container.add([shadow, glow, maizeText])
      
      console.log(`  ✓ Maíz creado en contenedor (${container.x}, ${container.y})`)

      // Animación de flotación suave
      this.scene.tweens.add({
        targets: maizeText,
        y: -15,
        duration: 1500 + Math.random() * 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      })

      // Animación de pulso del brillo
      this.scene.tweens.add({
        targets: glow,
        alpha: { from: 0.2, to: 0.4 },
        scaleX: { from: 1, to: 1.3 },
        scaleY: { from: 1, to: 1.3 },
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      })

      // Animación de rotación sutil
      this.scene.tweens.add({
        targets: maizeText,
        rotation: { from: -0.1, to: 0.1 },
        duration: 2000 + Math.random() * 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      })

      this.maizeItems.set(key, container)
    })
  }

  /**
   * Verifica si hay maíz en una celda del grid
   */
  public hasMaizeAt(gridX: number, gridY: number): boolean {
    const key = `${gridX},${gridY}`
    return this.maizeItems.has(key)
  }

  /**
   * Recolecta el maíz de una celda (lo elimina visualmente)
   */
  public collectMaizeAt(gridX: number, gridY: number): boolean {
    const key = `${gridX},${gridY}`
    const container = this.maizeItems.get(key)
    
    if (!container) {
      return false
    }

    // Animación de recolección: el maíz salta y desaparece
    this.scene.tweens.add({
      targets: container,
      y: container.y - 30,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 400,
      ease: 'Back.easeOut',
      onComplete: () => {
        container.destroy()
      }
    })

    this.maizeItems.delete(key)
    return true
  }

  /**
   * Limpia todos los items de maíz
   */
  public clearAll(): void {
    // Cancelar todas las animaciones de los contenedores antes de destruirlos
    this.maizeItems.forEach(container => {
      // Cancelar todos los tweens de los hijos del contenedor
      container.list.forEach((child: any) => {
        if (child && this.scene.tweens) {
          this.scene.tweens.killTweensOf(child)
        }
      })
      // Cancelar tweens del contenedor mismo
      if (this.scene.tweens) {
        this.scene.tweens.killTweensOf(container)
      }
      // Destruir el contenedor
      container.destroy(true)
    })
    this.maizeItems.clear()
    console.log('🧹 Todos los emojis de maíz han sido limpiados')
  }

  /**
   * Obtiene todas las posiciones donde hay maíz
   */
  public getMaizePositions(): Array<{ gridX: number; gridY: number }> {
    const positions: Array<{ gridX: number; gridY: number }> = []
    this.maizeItems.forEach((_container, key) => {
      const [gridX, gridY] = key.split(',').map(Number)
      positions.push({ gridX, gridY })
    })
    return positions
  }
}

