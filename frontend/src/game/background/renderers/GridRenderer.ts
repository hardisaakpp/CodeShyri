import type Phaser from 'phaser'

/**
 * Renderer para dibujar la grilla/grid del juego
 * Hace que los movimientos sean predecibles y medibles
 */
export class GridRenderer {
  private scene: Phaser.Scene
  private gridGraphics: Phaser.GameObjects.Graphics | null = null
  private cellSize: number = 60 // Tamaño de cada celda en píxeles
  private gridColor: number = 0x4a5568 // Color gris azulado suave
  private gridAlpha: number = 0.3 // Transparencia para no interferir con el juego
  private highlightColor: number = 0x8bc34a // Color verde para resaltar celda actual
  private highlightAlpha: number = 0.4

  // Dimensiones del área de juego (se establecen en render)
  private width: number = 0
  private height: number = 0
  private horizonY: number = 0 // Línea del horizonte - el grid solo se dibuja en el terreno

  constructor(scene: Phaser.Scene, cellSize: number = 60) {
    this.scene = scene
    this.cellSize = cellSize
  }

  /**
   * Renderiza la grilla en el área de juego
   */
  public render(width: number, height: number, horizonY: number): Phaser.GameObjects.Graphics {
    this.width = width
    this.height = height
    this.horizonY = horizonY

    // Crear graphics para el grid
    this.gridGraphics = this.scene.add.graphics()
    this.gridGraphics.setDepth(5) // Por encima del fondo pero debajo del personaje

    // Dibujar líneas verticales
    const startX = 0
    const endX = width
    const startY = horizonY
    const endY = height

    // Líneas verticales
    for (let x = 0; x <= endX; x += this.cellSize) {
      this.gridGraphics.lineStyle(1, this.gridColor, this.gridAlpha)
      this.gridGraphics.lineBetween(x, startY, x, endY)
    }

    // Líneas horizontales
    for (let y = startY; y <= endY; y += this.cellSize) {
      this.gridGraphics.lineStyle(1, this.gridColor, this.gridAlpha)
      this.gridGraphics.lineBetween(startX, y, endX, y)
    }

    return this.gridGraphics
  }

  /**
   * Resalta una celda específica (para mostrar posición actual del jugador)
   */
  public highlightCell(gridX: number, gridY: number): void {
    if (!this.gridGraphics) return

    // Calcular posición en píxeles
    const pixelX = gridX * this.cellSize
    const pixelY = this.horizonY + (gridY * this.cellSize)

    // Limpiar highlight anterior
    this.clearHighlight()

    // Dibujar rectángulo resaltado
    this.gridGraphics.fillStyle(this.highlightColor, this.highlightAlpha)
    this.gridGraphics.fillRect(
      pixelX + 1, // +1 para no sobreponer líneas del grid
      pixelY + 1,
      this.cellSize - 2, // -2 para dejar espacio a las líneas
      this.cellSize - 2
    )
  }

  /**
   * Limpia el highlight de la celda actual
   */
  public clearHighlight(): void {
    if (!this.gridGraphics) return

    // Redibujar el grid para limpiar el highlight
    this.gridGraphics.clear()
    this.render(this.width, this.height, this.horizonY)
  }

  /**
   * Convierte coordenadas de píxel a coordenadas de grid
   */
  public pixelToGrid(pixelX: number, pixelY: number): { gridX: number; gridY: number } {
    const gridX = Math.floor(pixelX / this.cellSize)
    const gridY = Math.floor((pixelY - this.horizonY) / this.cellSize)
    return { gridX, gridY }
  }

  /**
   * Convierte coordenadas de grid a coordenadas de píxel (centro de la celda)
   */
  public gridToPixel(gridX: number, gridY: number): { pixelX: number; pixelY: number } {
    const pixelX = (gridX * this.cellSize) + (this.cellSize / 2)
    const pixelY = this.horizonY + (gridY * this.cellSize) + (this.cellSize / 2)
    return { pixelX, pixelY }
  }

  /**
   * Ajusta una posición en píxeles a la celda más cercana
   */
  public snapToGrid(pixelX: number, pixelY: number): { pixelX: number; pixelY: number } {
    const { gridX, gridY } = this.pixelToGrid(pixelX, pixelY)
    return this.gridToPixel(gridX, gridY)
  }

  /**
   * Obtiene el tamaño de la celda
   */
  public getCellSize(): number {
    return this.cellSize
  }

  /**
   * Destruye el grid graphics
   */
  public destroy(): void {
    if (this.gridGraphics) {
      this.gridGraphics.destroy()
      this.gridGraphics = null
    }
  }
}

