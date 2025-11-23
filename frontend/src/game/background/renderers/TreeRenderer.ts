import type Phaser from 'phaser'

export class TreeRenderer {
  constructor(
    private scene: Phaser.Scene,
    private width: number,
    private horizonY: number
  ) {}

  /**
   * Renderiza los árboles en las faldas de las montañas
   */
  public render(): Phaser.GameObjects.Graphics[] {
    const trees: Phaser.GameObjects.Graphics[] = []
    
    // Calcular posiciones de las bases de las montañas cercanas
    const mountainBaseY = this.horizonY
    const mountainPoints = 10
    const mountainVariation = 30
    const seed = mountainBaseY * 0.1
    const centerX = this.width / 2
    const centerAvoidance = this.width * 0.25 // Evitar el centro (25% del ancho a cada lado)
    
    // Crear árboles en las faldas de las montañas
    for (let i = 0; i < 8; i++) {
      // Calcular posición X evitando el centro
      let treeX: number
      let attempts = 0
      do {
        // Distribuir árboles a lo largo del ancho, pero evitar el centro
        const side = Math.random() > 0.5 ? 'left' : 'right'
        if (side === 'left') {
          treeX = Math.random() * (centerX - centerAvoidance)
        } else {
          treeX = centerX + centerAvoidance + Math.random() * (this.width - centerX - centerAvoidance)
        }
        attempts++
      } while (attempts < 10 && Math.abs(treeX - centerX) < centerAvoidance)
      
      // Calcular la posición Y en la base de la montaña más cercana
      const mountainIndex = Math.floor((treeX / this.width) * mountainPoints)
      const varAmount = Math.sin(mountainIndex * 0.5 + seed) * mountainVariation + 
                       Math.cos(mountainIndex * 0.3 + seed * 0.7) * (mountainVariation * 0.6) +
                       Math.sin(mountainIndex * 1.2 + seed * 1.3) * (mountainVariation * 0.4)
      const mountainBaseYAtX = mountainBaseY + varAmount
      
      // Colocar árbol en la falda de la montaña (más arriba en la ladera)
      const treeY = mountainBaseYAtX - 15 + Math.random() * 20
      
      const treeHeight = 40 + Math.random() * 50
      const trunkWidth = 8 + Math.random() * 6
      const crownSize = 25 + Math.random() * 30
      
      const treeGraphics = this.scene.add.graphics()
      
      // Tronco más robusto y oscuro (estilo medieval)
      treeGraphics.fillStyle(0x5C4033, 1) // Marrón más oscuro
      treeGraphics.fillRect(-trunkWidth / 2, 0, trunkWidth, treeHeight)
      
      // Textura del tronco (grietas y nudos)
      treeGraphics.fillStyle(0x3D2817, 0.8)
      treeGraphics.fillRect(-trunkWidth / 2 + 1, 0, trunkWidth * 0.3, treeHeight)
      treeGraphics.fillRect(trunkWidth / 2 - trunkWidth * 0.3, treeHeight * 0.3, trunkWidth * 0.2, treeHeight * 0.2)
      
      // Sombra del tronco más pronunciada
      treeGraphics.fillStyle(0x4A3428, 0.7)
      treeGraphics.fillRect(-trunkWidth / 2 + 2, 0, trunkWidth / 2, treeHeight)
      
      // Copa del árbol más oscura y densa (estilo medieval)
      treeGraphics.fillStyle(0x1B3D1B, 0.95) // Verde más oscuro y profundo
      treeGraphics.fillCircle(0, -treeHeight * 0.2, crownSize)
      treeGraphics.fillCircle(crownSize * 0.4, -treeHeight * 0.3, crownSize * 0.8)
      treeGraphics.fillCircle(-crownSize * 0.4, -treeHeight * 0.3, crownSize * 0.8)
      treeGraphics.fillCircle(0, -treeHeight * 0.5, crownSize * 0.7)
      
      // Capa intermedia con tonos más apagados
      treeGraphics.fillStyle(0x2A4A2A, 0.75)
      treeGraphics.fillCircle(0, -treeHeight * 0.25, crownSize * 0.7)
      treeGraphics.fillCircle(crownSize * 0.3, -treeHeight * 0.35, crownSize * 0.6)
      treeGraphics.fillCircle(-crownSize * 0.3, -treeHeight * 0.35, crownSize * 0.6)
      
      // Detalles de sombra en la copa
      treeGraphics.fillStyle(0x0F2A0F, 0.6)
      treeGraphics.fillCircle(-crownSize * 0.2, -treeHeight * 0.2, crownSize * 0.5)
      
      treeGraphics.setPosition(treeX, treeY)
      treeGraphics.setDepth(2)
      trees.push(treeGraphics)
    }
    
    return trees
  }
}

