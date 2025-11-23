import type Phaser from 'phaser'

export class SkyRenderer {
  constructor(
    private graphics: Phaser.GameObjects.Graphics,
    private width: number,
    private horizonY: number
  ) {}

  /**
   * Renderiza el cielo con gradiente medieval (más apagado y atmosférico)
   */
  public render() {
    this.graphics.fillGradientStyle(
      0x5A6B8C,  // Azul grisáceo superior izquierdo (más apagado)
      0x6B5B7C,  // Púrpura grisáceo superior derecho
      0x7A6B8C,  // Púrpura azulado inferior izquierdo
      0x8B7A9C   // Púrpura terroso inferior derecho
    )
    this.graphics.fillRect(0, 0, this.width, this.horizonY)
    
    // Capa atmosférica adicional para dar profundidad medieval
    this.graphics.fillStyle(0x4A5A6C, 0.15)
    this.graphics.fillRect(0, 0, this.width, this.horizonY * 0.4)
  }
}

