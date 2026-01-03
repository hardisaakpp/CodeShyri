import type Phaser from 'phaser'

export class TotemRenderer {
  constructor(
    private scene: Phaser.Scene,
    private width: number,
    private horizonY: number
  ) {}

  /**
   * Renderiza estatuas de puma inca distribuidas aleatoriamente en el grid de tierra
   */
  public render(isOverLake?: (x: number, y: number) => boolean): Phaser.GameObjects.Graphics[] {
    const totems: Phaser.GameObjects.Graphics[] = []
    
    // Tamaño de celda del grid (debe coincidir con GridRenderer)
    const cellSize = 60
    
    // Calcular dimensiones del grid de tierra
    // horizonY divide el mapa: arriba es cielo, abajo es tierra
    // Estimar groundHeight: si horizonY = height * 0.33, entonces groundHeight ≈ horizonY * 2
    const estimatedGroundHeight = this.horizonY * 2
    const numCols = Math.floor(this.width / cellSize)
    const numRows = Math.floor(estimatedGroundHeight / cellSize)
    
    // Crear 1-2 tótems distribuidos en el grid de tierra
    const numTotems = 1 + Math.floor(Math.random() * 2) // 1-2 tótems
    
    // Generar posiciones disponibles en el grid de tierra (evitando bordes)
    const availablePositions: Array<{ gridX: number; gridY: number }> = []
    for (let col = 2; col < numCols - 2; col++) { // Evitar los bordes (dejar 2 columnas de margen)
      for (let row = 1; row < Math.min(numRows - 2, 5); row++) { // Primeras 5 filas del terreno
        availablePositions.push({ gridX: col, gridY: row })
      }
    }
    
    // Mezclar posiciones disponibles para distribución aleatoria
    const shuffledPositions = availablePositions.sort(() => Math.random() - 0.5)
    
    // Colocar tótems en posiciones del grid
    for (let i = 0; i < numTotems && i < shuffledPositions.length; i++) {
      const gridPos = shuffledPositions[i]
      
      // Convertir posición del grid a píxeles (centro de la celda)
      const totemX = (gridPos.gridX * cellSize) + (cellSize / 2)
      const totemY = this.horizonY + (gridPos.gridY * cellSize) + (cellSize / 2)
      
      // Verificar si está sobre el lago
      if (isOverLake && isOverLake(totemX, totemY)) continue
      
      // Estatua de puma grande: más grande que un castillo (castillos son 28-40 píxeles)
      const pumaHeight = 60 + Math.random() * 20 // Altura: 60-80 píxeles
      const pumaWidth = 25 + Math.random() * 10 // Ancho: 25-35 píxeles
      
      const pumaGraphics = this.scene.add.graphics()
    
      // Base de la estatua (plataforma trapezoidal, estilo inca)
      pumaGraphics.fillStyle(0x6B5B4A, 1) // Piedra inca oscura
      pumaGraphics.beginPath()
      pumaGraphics.moveTo(-pumaWidth * 0.6, 0)
      pumaGraphics.lineTo(-pumaWidth * 0.5, -pumaHeight * 0.1)
      pumaGraphics.lineTo(pumaWidth * 0.5, -pumaHeight * 0.1)
      pumaGraphics.lineTo(pumaWidth * 0.6, 0)
      pumaGraphics.closePath()
      pumaGraphics.fillPath()
      
      // Cuerpo del puma (forma ovalada/rectangular)
      pumaGraphics.fillStyle(0x7B6B5A, 1) // Piedra inca
      pumaGraphics.fillEllipse(0, -pumaHeight * 0.35, pumaWidth * 0.5, pumaHeight * 0.4)
      
      // Pecho del puma (más claro)
      pumaGraphics.fillStyle(0x8B7B6A, 0.8) // Piedra inca más clara
      pumaGraphics.fillEllipse(0, -pumaHeight * 0.25, pumaWidth * 0.35, pumaHeight * 0.25)
      
      // Cabeza del puma (redondeada)
      pumaGraphics.fillStyle(0x7B6B5A, 1) // Piedra inca
      pumaGraphics.fillEllipse(0, -pumaHeight * 0.7, pumaWidth * 0.4, pumaHeight * 0.25)
      
      // Orejas del puma (triangulares)
      pumaGraphics.fillStyle(0x6B5B4A, 1) // Piedra inca oscura
      // Oreja izquierda
      pumaGraphics.beginPath()
      pumaGraphics.moveTo(-pumaWidth * 0.25, -pumaHeight * 0.75)
      pumaGraphics.lineTo(-pumaWidth * 0.35, -pumaHeight * 0.85)
      pumaGraphics.lineTo(-pumaWidth * 0.2, -pumaHeight * 0.8)
      pumaGraphics.closePath()
      pumaGraphics.fillPath()
      // Oreja derecha
      pumaGraphics.beginPath()
      pumaGraphics.moveTo(pumaWidth * 0.25, -pumaHeight * 0.75)
      pumaGraphics.lineTo(pumaWidth * 0.35, -pumaHeight * 0.85)
      pumaGraphics.lineTo(pumaWidth * 0.2, -pumaHeight * 0.8)
      pumaGraphics.closePath()
      pumaGraphics.fillPath()
      
      // Patas delanteras
      pumaGraphics.fillStyle(0x6B5B4A, 1) // Piedra inca oscura
      pumaGraphics.fillRect(-pumaWidth * 0.3, -pumaHeight * 0.15, pumaWidth * 0.15, pumaHeight * 0.2)
      pumaGraphics.fillRect(pumaWidth * 0.15, -pumaHeight * 0.15, pumaWidth * 0.15, pumaHeight * 0.2)
      
      // Patas traseras
      pumaGraphics.fillRect(-pumaWidth * 0.4, -pumaHeight * 0.05, pumaWidth * 0.18, pumaHeight * 0.15)
      pumaGraphics.fillRect(pumaWidth * 0.22, -pumaHeight * 0.05, pumaWidth * 0.18, pumaHeight * 0.15)
      
      // Cola del puma (curvada)
      pumaGraphics.fillStyle(0x7B6B5A, 1)
      pumaGraphics.beginPath()
      pumaGraphics.moveTo(pumaWidth * 0.35, -pumaHeight * 0.2)
      pumaGraphics.lineTo(pumaWidth * 0.5, -pumaHeight * 0.1)
      pumaGraphics.lineTo(pumaWidth * 0.45, -pumaHeight * 0.05)
      pumaGraphics.lineTo(pumaWidth * 0.3, -pumaHeight * 0.15)
      pumaGraphics.closePath()
      pumaGraphics.fillPath()
      
      // Ojos del puma (círculos)
      pumaGraphics.fillStyle(0x2A2A2A, 1) // Negro para ojos
      pumaGraphics.fillCircle(-pumaWidth * 0.1, -pumaHeight * 0.72, 2)
      pumaGraphics.fillCircle(pumaWidth * 0.1, -pumaHeight * 0.72, 2)
      
      // Nariz del puma (triángulo pequeño)
      pumaGraphics.fillStyle(0x4A3A2A, 1)
      pumaGraphics.beginPath()
      pumaGraphics.moveTo(0, -pumaHeight * 0.65)
      pumaGraphics.lineTo(-pumaWidth * 0.05, -pumaHeight * 0.68)
      pumaGraphics.lineTo(pumaWidth * 0.05, -pumaHeight * 0.68)
      pumaGraphics.closePath()
      pumaGraphics.fillPath()
      
      // Detalles decorativos incas (líneas geométricas)
      pumaGraphics.lineStyle(2, 0x5A4A3A, 0.8) // Líneas decorativas
      // Línea en el pecho
      pumaGraphics.moveTo(-pumaWidth * 0.15, -pumaHeight * 0.3)
      pumaGraphics.lineTo(pumaWidth * 0.15, -pumaHeight * 0.3)
      pumaGraphics.strokePath()
      
      // Patrones geométricos en el cuerpo (estilo inca)
      pumaGraphics.fillStyle(0x4A3A2A, 0.6)
      pumaGraphics.fillRect(-pumaWidth * 0.2, -pumaHeight * 0.4, pumaWidth * 0.1, 2)
      pumaGraphics.fillRect(pumaWidth * 0.1, -pumaHeight * 0.4, pumaWidth * 0.1, 2)
      
      // Sombra de la estatua
      pumaGraphics.fillStyle(0x5A4A3A, 0.6)
      pumaGraphics.fillEllipse(0, 0, pumaWidth * 0.7, 4)
      
      // Resaltes en la estatua
      pumaGraphics.fillStyle(0x9B8B7A, 0.4)
      pumaGraphics.fillEllipse(-pumaWidth * 0.15, -pumaHeight * 0.5, pumaWidth * 0.2, pumaHeight * 0.15)
      
      pumaGraphics.setPosition(totemX, totemY)
      pumaGraphics.setDepth(1.9) // Detrás de los castillos (castillos tienen depth 2)
      totems.push(pumaGraphics)
    }
    
    return totems
  }
}

