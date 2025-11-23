import type Phaser from 'phaser'

export class TreeRenderer {
  constructor(
    private scene: Phaser.Scene,
    private width: number,
    private horizonY: number
  ) {}

  /**
   * Renderiza los árboles
   */
  public render(): Phaser.GameObjects.Graphics[] {
    const trees: Phaser.GameObjects.Graphics[] = []
    
    for (let i = 0; i < 8; i++) {
      const treeX = 50 + (this.width / 8) * i + Math.random() * 30
      const treeY = this.horizonY + 20 + Math.random() * 30
      const treeHeight = 40 + Math.random() * 50
      const trunkWidth = 8 + Math.random() * 6
      const crownSize = 25 + Math.random() * 30
      
      const treeGraphics = this.scene.add.graphics()
      
      // Tronco
      treeGraphics.fillStyle(0x8B4513, 1)
      treeGraphics.fillRect(-trunkWidth / 2, 0, trunkWidth, treeHeight)
      
      // Sombra del tronco
      treeGraphics.fillStyle(0x654321, 0.6)
      treeGraphics.fillRect(-trunkWidth / 2 + 2, 0, trunkWidth / 2, treeHeight)
      
      // Copa del árbol
      treeGraphics.fillStyle(0x2D5016, 0.9)
      treeGraphics.fillCircle(0, -treeHeight * 0.2, crownSize)
      treeGraphics.fillCircle(crownSize * 0.4, -treeHeight * 0.3, crownSize * 0.8)
      treeGraphics.fillCircle(-crownSize * 0.4, -treeHeight * 0.3, crownSize * 0.8)
      treeGraphics.fillCircle(0, -treeHeight * 0.5, crownSize * 0.7)
      
      // Capa superior más clara
      treeGraphics.fillStyle(0x3E7B27, 0.7)
      treeGraphics.fillCircle(0, -treeHeight * 0.25, crownSize * 0.7)
      treeGraphics.fillCircle(crownSize * 0.3, -treeHeight * 0.35, crownSize * 0.6)
      treeGraphics.fillCircle(-crownSize * 0.3, -treeHeight * 0.35, crownSize * 0.6)
      
      treeGraphics.setPosition(treeX, treeY)
      treeGraphics.setDepth(2)
      trees.push(treeGraphics)
    }
    
    return trees
  }
}

