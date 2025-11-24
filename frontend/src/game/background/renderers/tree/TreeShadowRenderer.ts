import type Phaser from 'phaser'

export class TreeShadowRenderer {
  /**
   * Dibuja la sombra del árbol en el suelo
   */
  static draw(
    shadowGraphics: Phaser.GameObjects.Graphics,
    treeX: number,
    treeY: number,
    treeHeight: number,
    crownSize: number
  ): void {
    // Sombra elíptica en el suelo
    const shadowWidth = crownSize * 1.2
    const shadowHeight = crownSize * 0.6
    const shadowY = treeY + treeHeight * 0.7 // Sombra en la base del árbol
    
    shadowGraphics.fillStyle(0x000000, 0.3)
    shadowGraphics.fillEllipse(0, 0, shadowWidth, shadowHeight)
    
    // Sombra más oscura en el centro
    shadowGraphics.fillStyle(0x000000, 0.2)
    shadowGraphics.fillEllipse(0, 0, shadowWidth * 0.6, shadowHeight * 0.6)
    
    shadowGraphics.setPosition(treeX, shadowY)
  }
}

