import { GridRenderer } from '../background/renderers/GridRenderer'

/**
 * Gestiona los obstáculos en el grid del juego.
 * Registra qué celdas están bloqueadas y proporciona métodos para verificar colisiones.
 */
export class ObstacleManager {
  private blockedCells: Set<string> = new Set()
  private gridRenderer: GridRenderer

  constructor(gridRenderer: GridRenderer) {
    this.gridRenderer = gridRenderer
  }

  /**
   * Bloquea una celda específica del grid
   */
  public blockCell(gridX: number, gridY: number): void {
    const key = `${gridX},${gridY}`
    this.blockedCells.add(key)
  }

  /**
   * Bloquea múltiples celdas a la vez (útil para elementos grandes como el lago)
   */
  public blockCells(gridPositions: Array<{ gridX: number; gridY: number }>): void {
    gridPositions.forEach(pos => {
      this.blockCell(pos.gridX, pos.gridY)
    })
  }

  /**
   * Verifica si una celda está bloqueada
   */
  public isBlocked(gridX: number, gridY: number): boolean {
    const key = `${gridX},${gridY}`
    return this.blockedCells.has(key)
  }

  /**
   * Verifica si una posición en píxeles está bloqueada (convierte a grid primero)
   */
  public isBlockedPixel(pixelX: number, pixelY: number): boolean {
    const { gridX, gridY } = this.gridRenderer.pixelToGrid(pixelX, pixelY)
    return this.isBlocked(gridX, gridY)
  }

  /**
   * Desbloquea una celda (útil para reset)
   */
  public unblockCell(gridX: number, gridY: number): void {
    const key = `${gridX},${gridY}`
    this.blockedCells.delete(key)
  }

  /**
   * Limpia todos los obstáculos (útil para reset)
   */
  public clear(): void {
    this.blockedCells.clear()
  }

  /**
   * Obtiene todas las celdas bloqueadas (útil para debug)
   */
  public getBlockedCells(): Array<{ gridX: number; gridY: number }> {
    const cells: Array<{ gridX: number; gridY: number }> = []
    this.blockedCells.forEach(key => {
      const [gridX, gridY] = key.split(',').map(Number)
      cells.push({ gridX, gridY })
    })
    return cells
  }

  /**
   * Imprime información de depuración sobre las celdas bloqueadas
   */
  public debugBlockedCells(): void {
    const cells = this.getBlockedCells()
    console.log(`🔒 Total de celdas bloqueadas: ${cells.length}`)
    if (cells.length > 0) {
      console.log('🔒 Celdas bloqueadas:', cells)
    }
  }

  /**
   * Verifica si hay una ruta posible desde start hasta goal evitando obstáculos
   * (BFS simple para validar que el nivel no esté bloqueado)
   */
  public hasPath(start: { gridX: number; gridY: number }, goal: { gridX: number; gridY: number }): boolean {
    const visited: Set<string> = new Set()
    const queue: Array<{ gridX: number; gridY: number; steps: number }> = [{ ...start, steps: 0 }]
    const maxSteps = 1000 // Límite para evitar bucle infinito

    while (queue.length > 0) {
      const current = queue.shift()!
      const key = `${current.gridX},${current.gridY}`

      if (visited.has(key)) continue
      visited.add(key)

      if (current.gridX === goal.gridX && current.gridY === goal.gridY) {
        return true
      }

      if (current.steps >= maxSteps) continue

      // Intentar mover en las 4 direcciones
      const directions = [
        { gridX: current.gridX + 1, gridY: current.gridY }, // Derecha
        { gridX: current.gridX - 1, gridY: current.gridY }, // Izquierda
        { gridX: current.gridX, gridY: current.gridY + 1 }, // Abajo
        { gridX: current.gridX, gridY: current.gridY - 1 }  // Arriba
      ]

      for (const dir of directions) {
        const dirKey = `${dir.gridX},${dir.gridY}`
        if (!visited.has(dirKey) && !this.isBlocked(dir.gridX, dir.gridY)) {
          queue.push({ ...dir, steps: current.steps + 1 })
        }
      }
    }

    return false
  }

  /**
   * Bloquea un área rectangular o elíptica (útil para elementos grandes como el lago)
   * @param isEllipse Si es true, usa forma elíptica; si es false, usa forma rectangular
   */
  public blockRectArea(
    centerPixelX: number,
    centerPixelY: number,
    widthPixels: number,
    heightPixels: number,
    isEllipse: boolean = true
  ): void {
    const centerGrid = this.gridRenderer.pixelToGrid(centerPixelX, centerPixelY)
    const cellSize = this.gridRenderer.getCellSize()

    // Calcular cuántas celdas ocupa
    const cols = Math.ceil(widthPixels / cellSize) + 1
    const rows = Math.ceil(heightPixels / cellSize) + 1

    // Radio de la elipse (mitad del ancho y alto)
    const radiusX = widthPixels / 2
    const radiusY = heightPixels / 2

    // Bloquear todas las celdas del área
    for (let row = -Math.floor(rows / 2); row <= Math.floor(rows / 2); row++) {
      for (let col = -Math.floor(cols / 2); col <= Math.floor(cols / 2); col++) {
        const gridX = centerGrid.gridX + col
        const gridY = centerGrid.gridY + row

        // Verificar si está dentro del área del elemento (usando distancia desde el centro)
        const pixelPos = this.gridRenderer.gridToPixel(gridX, gridY)
        const dx = pixelPos.pixelX - centerPixelX
        const dy = pixelPos.pixelY - centerPixelY

        let isInside = false
        if (isEllipse) {
          // Verificar si está dentro de la elipse usando la ecuación de elipse
          // (x/a)² + (y/b)² <= 1
          const ellipseCheck = (dx * dx) / (radiusX * radiusX) + (dy * dy) / (radiusY * radiusY)
          isInside = ellipseCheck <= 1.0
        } else {
          // Forma rectangular
          isInside = Math.abs(dx) < radiusX && Math.abs(dy) < radiusY
        }

        // Solo bloquear si está realmente dentro del área
        if (isInside) {
          this.blockCell(gridX, gridY)
        }
      }
    }
  }
}

