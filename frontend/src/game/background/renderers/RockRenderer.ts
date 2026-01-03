import type Phaser from 'phaser'

export class RockRenderer {
  constructor(
    private scene: Phaser.Scene,
    private width: number,
    private height: number,
    private horizonY: number
  ) {}

  /**
   * Renderiza las rocas
   * @param isValidGridPosition Función para verificar si una posición de grid es válida (no está en lago ni en camino)
   * @param occupiedGridPositions Set de posiciones de grid ya ocupadas (formato "gridX,gridY")
   */
  public render(
    isValidGridPosition?: (gridX: number, gridY: number) => boolean,
    occupiedGridPositions?: Set<string>
  ): Phaser.GameObjects.Graphics[] {
    const rocks: Phaser.GameObjects.Graphics[] = []
    const cellSize = 60 // Tamaño de celda del grid (debe coincidir con GridRenderer)
    
    // Calcular dimensiones del grid de tierra
    const estimatedGroundHeight = this.horizonY * 2
    const numCols = Math.floor(this.width / cellSize)
    const numRows = Math.floor(estimatedGroundHeight / cellSize)
    
    // Generar posiciones disponibles en el grid de tierra
    const availablePositions: Array<{ gridX: number; gridY: number }> = []
    for (let col = 1; col < numCols - 1; col++) {
      for (let row = 0; row < Math.min(numRows - 1, 8); row++) {
        availablePositions.push({ gridX: col, gridY: row })
      }
    }
    
    // Mezclar posiciones disponibles para distribución aleatoria
    const shuffledPositions = availablePositions.sort(() => Math.random() - 0.5)
    
    // Colocar rocas en posiciones del grid
    const numRocks = 5
    for (let i = 0; i < numRocks && i < shuffledPositions.length; i++) {
      const gridPos = shuffledPositions[i]
      const gridKey = `${gridPos.gridX},${gridPos.gridY}`
      
      // Verificar si la posición es válida (no está en lago ni en camino)
      if (isValidGridPosition && !isValidGridPosition(gridPos.gridX, gridPos.gridY)) continue
      
      // Verificar si la posición ya está ocupada
      if (occupiedGridPositions && occupiedGridPositions.has(gridKey)) continue
      
      // Convertir posición del grid a píxeles (centro de la celda)
      const rockX = (gridPos.gridX * cellSize) + (cellSize / 2)
      const rockY = this.horizonY + (gridPos.gridY * cellSize) + (cellSize / 2)
      
      const rockSize = 8 + Math.random() * 15
      
      const rockGraphics = this.scene.add.graphics()
      
      // Forma de roca más terrosa y medieval
      rockGraphics.fillStyle(0x4A4A3A, 1) // Gris terroso oscuro
      rockGraphics.fillCircle(0, 0, rockSize)
      rockGraphics.fillCircle(rockSize * 0.3, rockSize * 0.2, rockSize * 0.6)
      rockGraphics.fillCircle(-rockSize * 0.3, rockSize * 0.2, rockSize * 0.6)
      rockGraphics.fillCircle(0, -rockSize * 0.3, rockSize * 0.7)
      
      // Sombra más profunda
      rockGraphics.fillStyle(0x2C2C1F, 0.8)
      rockGraphics.fillCircle(-rockSize * 0.3, rockSize * 0.2, rockSize * 0.5)
      rockGraphics.fillCircle(rockSize * 0.2, rockSize * 0.3, rockSize * 0.4)
      
      // Resaltes más sutiles
      rockGraphics.fillStyle(0x6A6A5A, 0.4)
      rockGraphics.fillCircle(rockSize * 0.2, -rockSize * 0.2, rockSize * 0.3)
      rockGraphics.fillCircle(-rockSize * 0.1, -rockSize * 0.3, rockSize * 0.25)
      
      // Musgo en algunas rocas (toque medieval)
      if (Math.random() > 0.6) {
        rockGraphics.fillStyle(0x2D4A2D, 0.5) // Verde musgo oscuro
        rockGraphics.fillCircle(rockSize * 0.2, rockSize * 0.1, rockSize * 0.4)
        rockGraphics.fillCircle(-rockSize * 0.15, rockSize * 0.15, rockSize * 0.3)
      }
      
      rockGraphics.setPosition(rockX, rockY)
      rockGraphics.setDepth(1.8) // Detrás de los árboles (árboles tienen depth 2)
      rocks.push(rockGraphics)
      
      // Marcar posición como ocupada
      if (occupiedGridPositions) {
        occupiedGridPositions.add(gridKey)
      }
    }
    
    return rocks
  }
}

