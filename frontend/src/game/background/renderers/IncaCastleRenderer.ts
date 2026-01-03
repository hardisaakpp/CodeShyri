import type Phaser from 'phaser'

interface StructureData {
  graphics: Phaser.GameObjects.Graphics
  shadow: Phaser.GameObjects.Graphics
  x: number
  y: number
  width: number
  height: number
  isCastle: boolean
}

export class IncaCastleRenderer {
  private structuresData: StructureData[] = []

  constructor(
    private scene: Phaser.Scene,
    private width: number,
    private horizonY: number
  ) {}

  /**
   * Renderiza pequeños castillos y casitas incas en el escenario
   * Distribuidas en diferentes posiciones del grid de tierra
   */
  public render(isOverLake?: (x: number, y: number) => boolean): Phaser.GameObjects.Graphics[] {
    const structures: Phaser.GameObjects.Graphics[] = []
    this.structuresData = []
    
    // Tamaño de celda del grid (debe coincidir con GridRenderer)
    const cellSize = 60
    
    // Calcular dimensiones del grid de tierra
    // horizonY divide el mapa: arriba es cielo (horizonY), abajo es tierra
    // Estimar groundHeight: si horizonY = height * 0.33, entonces groundHeight ≈ horizonY * 2
    const estimatedGroundHeight = this.horizonY * 2
    const numCols = Math.floor(this.width / cellSize)
    const numRows = Math.floor(estimatedGroundHeight / cellSize)
    
    // Crear 8 estructuras distribuidas en el grid de tierra
    // 2 castillos y 6 casitas
    const numStructures = 8
    
    // Generar posiciones disponibles en el grid de tierra (evitando bordes y zonas muy abajo)
    const availablePositions: Array<{ gridX: number; gridY: number }> = []
    for (let col = 2; col < numCols - 2; col++) { // Evitar los bordes (dejar 2 columnas de margen)
      for (let row = 1; row < Math.min(numRows - 2, 6); row++) { // Solo primeras 6 filas del terreno
        availablePositions.push({ gridX: col, gridY: row })
      }
    }
    
    // Mezclar posiciones disponibles para distribución aleatoria
    const shuffledPositions = availablePositions.sort(() => Math.random() - 0.5)
    
    // Colocar estructuras en posiciones del grid
    for (let i = 0; i < numStructures && i < shuffledPositions.length; i++) {
      const gridPos = shuffledPositions[i]
      
      // Convertir posición del grid a píxeles (centro de la celda)
      const structureX = (gridPos.gridX * cellSize) + (cellSize / 2)
      const structureY = this.horizonY + (gridPos.gridY * cellSize) + (cellSize / 2)
      
      if (isOverLake && isOverLake(structureX, structureY)) continue
      
      // Mezclar casitas y castillos (2 castillos y 6 casitas)
      const isCastle = i < 2 // Primeras 2 son castillos, últimas 6 son casitas
      const baseSize = isCastle ? (28 + Math.random() * 12) : (18 + Math.random() * 10)
      
      const structureGraphics = this.scene.add.graphics()
      
      // Calcular dimensiones para la sombra
      const structureWidth = isCastle ? baseSize * 1.2 : baseSize * 1.0
      const structureHeight = isCastle ? baseSize * 1.7 : baseSize * 1.5
      
      if (isCastle) {
        // Renderizar castillo
        this.renderCastle(structureGraphics, baseSize)
      } else {
        // Renderizar casita inca
        this.renderIncaHouse(structureGraphics, baseSize)
      }
      
      structureGraphics.setPosition(structureX, structureY)
      structureGraphics.setDepth(2)
      structures.push(structureGraphics)
      
      // Crear sombra dinámica de la estructura
      const shadowGraphics = this.scene.add.graphics()
      this.drawStructureShadow(shadowGraphics, structureX, structureY, structureWidth, structureHeight, isCastle)
      shadowGraphics.setDepth(1.5) // Detrás de la estructura pero visible
      
      // Guardar datos de la estructura para animaciones
      const structureData: StructureData = {
        graphics: structureGraphics,
        shadow: shadowGraphics,
        x: structureX,
        y: structureY,
        width: structureWidth,
        height: structureHeight,
        isCastle: isCastle
      }
      this.structuresData.push(structureData)
    }
    
    // Iniciar animación de sombras dinámicas
    this.startDynamicShadows()
    
    return [...structures, ...this.structuresData.map(s => s.shadow)]
  }

  /**
   * Dibuja la sombra de la estructura en el suelo
   */
  private drawStructureShadow(
    shadowGraphics: Phaser.GameObjects.Graphics,
    structureX: number,
    structureY: number,
    structureWidth: number,
    structureHeight: number,
    isCastle: boolean
  ): void {
    // Sombra elíptica en el suelo, más grande para castillos
    const shadowWidth = structureWidth * (isCastle ? 1.3 : 1.2)
    const shadowHeight = structureWidth * (isCastle ? 0.7 : 0.6)
    const shadowY = structureY + structureHeight * 0.6 // Sombra en la base de la estructura
    
    shadowGraphics.fillStyle(0x000000, 0.3)
    shadowGraphics.fillEllipse(0, 0, shadowWidth, shadowHeight)
    
    // Sombra más oscura en el centro
    shadowGraphics.fillStyle(0x000000, 0.2)
    shadowGraphics.fillEllipse(0, 0, shadowWidth * 0.6, shadowHeight * 0.6)
    
    shadowGraphics.setPosition(structureX, shadowY)
  }

  /**
   * Inicia la animación de sombras estáticas con variación suave de opacidad
   * Optimizado: usa animación de alpha en lugar de redibujar constantemente
   */
  private startDynamicShadows(): void {
    // Dibujar sombras estáticas una sola vez y animar opacidad
    this.structuresData.forEach(structureData => {
      const shadowWidth = structureData.width * (structureData.isCastle ? 1.3 : 1.2)
      const shadowHeight = structureData.width * (structureData.isCastle ? 0.7 : 0.6)
      const shadowY = structureData.y + structureData.height * 0.6
      
      // Sombra base estática
      structureData.shadow.fillStyle(0x000000, 0.25)
      structureData.shadow.fillEllipse(0, 0, shadowWidth, shadowHeight)
      
      // Sombra más oscura en el centro
      structureData.shadow.fillStyle(0x000000, 0.18)
      structureData.shadow.fillEllipse(0, 0, shadowWidth * 0.6, shadowHeight * 0.6)
      
      structureData.shadow.setPosition(structureData.x, shadowY)
      
      // Animación suave de opacidad (más eficiente que redibujar)
      const baseAlpha = 0.25 + Math.random() * 0.1
      this.scene.tweens.add({
        targets: structureData.shadow,
        alpha: { from: baseAlpha * 0.7, to: baseAlpha * 1.3 },
        duration: 3000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      })
    })
  }

  /**
   * Renderiza un castillo inca con efecto Flat Shaded 3D
   */
  private renderCastle(
    graphics: Phaser.GameObjects.Graphics,
    castleSize: number
  ) {
    // Colores para Flat Shaded 3D (luz desde arriba-derecha)
    const lightFace = 0x9B8B7A // Cara iluminada (más clara)
    const midFace = 0x7B6B5A // Cara media
    const darkFace = 0x4B3B2A // Cara en sombra (más oscura)
    const topColor = 0x8B7B6A // Color superior
    
    const baseWidth = castleSize * 1.2
    const baseHeight = castleSize * 0.8
    const wallWidth = baseWidth * 0.6
    const wallHeight = castleSize * 0.6
    const towerSize = castleSize * 0.4
    const towerHeight = castleSize * 0.7
    const centerTowerSize = castleSize * 0.35
    const centerTowerHeight = castleSize * 0.9
    
    // Base trapezoidal (cara inferior visible) - más oscura
    graphics.fillStyle(darkFace, 1)
    graphics.beginPath()
    graphics.moveTo(-baseWidth / 2, 0)
    graphics.lineTo(baseWidth / 2, 0)
    graphics.lineTo(baseWidth / 2 * 0.7, baseHeight)
    graphics.lineTo(-baseWidth / 2 * 0.7, baseHeight)
    graphics.closePath()
    graphics.fillPath()
    
    // Muro frontal - cara principal iluminada
    graphics.fillStyle(lightFace, 1)
    graphics.fillRect(-wallWidth / 2, -wallHeight, wallWidth, wallHeight)
    
    // Cara derecha del muro frontal (iluminada)
    graphics.fillStyle(midFace, 1)
    const rightWallDepth = castleSize * 0.15
    graphics.beginPath()
    graphics.moveTo(wallWidth / 2, -wallHeight)
    graphics.lineTo(wallWidth / 2 + rightWallDepth, -wallHeight - rightWallDepth * 0.5)
    graphics.lineTo(wallWidth / 2 + rightWallDepth, rightWallDepth * 0.5)
    graphics.lineTo(wallWidth / 2, 0)
    graphics.closePath()
    graphics.fillPath()
    
    // Cara izquierda del muro frontal (en sombra)
    graphics.fillStyle(darkFace, 1)
    const leftWallDepth = castleSize * 0.15
    graphics.beginPath()
    graphics.moveTo(-wallWidth / 2, -wallHeight)
    graphics.lineTo(-wallWidth / 2 - leftWallDepth, -wallHeight - leftWallDepth * 0.5)
    graphics.lineTo(-wallWidth / 2 - leftWallDepth, leftWallDepth * 0.5)
    graphics.lineTo(-wallWidth / 2, 0)
    graphics.closePath()
    graphics.fillPath()
    
    // Torre izquierda - cara frontal (media)
    graphics.fillStyle(midFace, 1)
    graphics.fillRect(-baseWidth / 2 * 0.8, -towerHeight, towerSize, towerHeight)
    
    // Torre izquierda - cara derecha (iluminada)
    graphics.fillStyle(lightFace, 1)
    graphics.beginPath()
    graphics.moveTo(-baseWidth / 2 * 0.8 + towerSize, -towerHeight)
    graphics.lineTo(-baseWidth / 2 * 0.8 + towerSize + rightWallDepth, -towerHeight - rightWallDepth * 0.5)
    graphics.lineTo(-baseWidth / 2 * 0.8 + towerSize + rightWallDepth, rightWallDepth * 0.5)
    graphics.lineTo(-baseWidth / 2 * 0.8 + towerSize, 0)
    graphics.closePath()
    graphics.fillPath()
    
    // Torre izquierda - cara izquierda (en sombra)
    graphics.fillStyle(darkFace, 1)
    graphics.beginPath()
    graphics.moveTo(-baseWidth / 2 * 0.8, -towerHeight)
    graphics.lineTo(-baseWidth / 2 * 0.8 - leftWallDepth, -towerHeight - leftWallDepth * 0.5)
    graphics.lineTo(-baseWidth / 2 * 0.8 - leftWallDepth, leftWallDepth * 0.5)
    graphics.lineTo(-baseWidth / 2 * 0.8, 0)
    graphics.closePath()
    graphics.fillPath()
    
    // Torre derecha - cara frontal (media)
    graphics.fillStyle(midFace, 1)
    graphics.fillRect(baseWidth / 2 * 0.8 - towerSize, -towerHeight, towerSize, towerHeight)
    
    // Torre derecha - cara derecha (iluminada)
    graphics.fillStyle(lightFace, 1)
    graphics.beginPath()
    graphics.moveTo(baseWidth / 2 * 0.8, -towerHeight)
    graphics.lineTo(baseWidth / 2 * 0.8 + rightWallDepth, -towerHeight - rightWallDepth * 0.5)
    graphics.lineTo(baseWidth / 2 * 0.8 + rightWallDepth, rightWallDepth * 0.5)
    graphics.lineTo(baseWidth / 2 * 0.8, 0)
    graphics.closePath()
    graphics.fillPath()
    
    // Torre derecha - cara izquierda (en sombra)
    graphics.fillStyle(darkFace, 1)
    graphics.beginPath()
    graphics.moveTo(baseWidth / 2 * 0.8 - towerSize, -towerHeight)
    graphics.lineTo(baseWidth / 2 * 0.8 - towerSize - leftWallDepth, -towerHeight - leftWallDepth * 0.5)
    graphics.lineTo(baseWidth / 2 * 0.8 - towerSize - leftWallDepth, leftWallDepth * 0.5)
    graphics.lineTo(baseWidth / 2 * 0.8 - towerSize, 0)
    graphics.closePath()
    graphics.fillPath()
    
    // Torre central - cara frontal (iluminada)
    graphics.fillStyle(lightFace, 1)
    graphics.fillRect(-centerTowerSize / 2, -centerTowerHeight, centerTowerSize, centerTowerHeight)
    
    // Torre central - cara derecha (muy iluminada)
    graphics.fillStyle(topColor, 1)
    graphics.beginPath()
    graphics.moveTo(centerTowerSize / 2, -centerTowerHeight)
    graphics.lineTo(centerTowerSize / 2 + rightWallDepth, -centerTowerHeight - rightWallDepth * 0.5)
    graphics.lineTo(centerTowerSize / 2 + rightWallDepth, rightWallDepth * 0.5)
    graphics.lineTo(centerTowerSize / 2, 0)
    graphics.closePath()
    graphics.fillPath()
    
    // Torre central - cara izquierda (en sombra)
    graphics.fillStyle(darkFace, 1)
    graphics.beginPath()
    graphics.moveTo(-centerTowerSize / 2, -centerTowerHeight)
    graphics.lineTo(-centerTowerSize / 2 - leftWallDepth, -centerTowerHeight - leftWallDepth * 0.5)
    graphics.lineTo(-centerTowerSize / 2 - leftWallDepth, leftWallDepth * 0.5)
    graphics.lineTo(-centerTowerSize / 2, 0)
    graphics.closePath()
    graphics.fillPath()
    
    // Techos de las torres (cara superior) - color claro
    graphics.fillStyle(topColor, 1)
    // Techo torre izquierda
    graphics.beginPath()
    graphics.moveTo(-baseWidth / 2 * 0.8, -towerHeight)
    graphics.lineTo(-baseWidth / 2 * 0.8 + towerSize, -towerHeight)
    graphics.lineTo(-baseWidth / 2 * 0.8 + towerSize + rightWallDepth * 0.5, -towerHeight - rightWallDepth)
    graphics.lineTo(-baseWidth / 2 * 0.8 - leftWallDepth * 0.5, -towerHeight - leftWallDepth)
    graphics.closePath()
    graphics.fillPath()
    
    // Techo torre derecha
    graphics.beginPath()
    graphics.moveTo(baseWidth / 2 * 0.8 - towerSize, -towerHeight)
    graphics.lineTo(baseWidth / 2 * 0.8, -towerHeight)
    graphics.lineTo(baseWidth / 2 * 0.8 + rightWallDepth * 0.5, -towerHeight - rightWallDepth)
    graphics.lineTo(baseWidth / 2 * 0.8 - towerSize - leftWallDepth * 0.5, -towerHeight - leftWallDepth)
    graphics.closePath()
    graphics.fillPath()
    
    // Techo torre central
    graphics.beginPath()
    graphics.moveTo(-centerTowerSize / 2, -centerTowerHeight)
    graphics.lineTo(centerTowerSize / 2, -centerTowerHeight)
    graphics.lineTo(centerTowerSize / 2 + rightWallDepth * 0.5, -centerTowerHeight - rightWallDepth)
    graphics.lineTo(-centerTowerSize / 2 - leftWallDepth * 0.5, -centerTowerHeight - leftWallDepth)
    graphics.closePath()
    graphics.fillPath()
    
    // Detalles de piedra (textura inca) - en cara frontal
    graphics.fillStyle(midFace, 0.8)
    for (let j = 1; j < 4; j++) {
      const lineY = -centerTowerHeight + (centerTowerHeight / 4) * j
      graphics.fillRect(-centerTowerSize / 2, lineY, centerTowerSize, 2)
    }
    
    // Entrada del castillo (puerta trapezoidal inca) - interior oscuro
    const doorWidth = castleSize * 0.25
    const doorHeight = castleSize * 0.35
    graphics.fillStyle(0x2B1B0A, 1) // Interior muy oscuro
    graphics.beginPath()
    graphics.moveTo(-doorWidth / 2, 0)
    graphics.lineTo(doorWidth / 2, 0)
    graphics.lineTo(doorWidth / 2 * 0.6, -doorHeight)
    graphics.lineTo(-doorWidth / 2 * 0.6, -doorHeight)
    graphics.closePath()
    graphics.fillPath()
    
    // Marco de la puerta (lado iluminado)
    graphics.fillStyle(lightFace, 1)
    graphics.lineStyle(2, lightFace, 1)
    graphics.strokePath()
    
    // Bandera o estandarte en la torre central (opcional, 50% probabilidad)
    if (Math.random() > 0.5) {
      const flagX = centerTowerSize / 2 + rightWallDepth
      const flagY = -centerTowerHeight - 3
      graphics.fillStyle(0x8B4A3A, 1) // Color terracota
      graphics.fillRect(flagX, flagY, castleSize * 0.15, castleSize * 0.2)
      graphics.fillStyle(0x9B5A4A, 1)
      graphics.fillRect(flagX, flagY, castleSize * 0.15, castleSize * 0.1)
    }
  }

  /**
   * Renderiza una casita inca con efecto Flat Shaded 3D
   */
  private renderIncaHouse(
    graphics: Phaser.GameObjects.Graphics,
    houseSize: number
  ) {
    // Colores para Flat Shaded 3D (luz desde arriba-derecha)
    const lightFace = 0x9B8B7A // Cara iluminada (más clara)
    const midFace = 0x7B6B5A // Cara media
    const darkFace = 0x4B3B2A // Cara en sombra (más oscura)
    const roofLight = 0xAB8B6A // Techo iluminado
    const roofMid = 0x8B6B4A // Techo medio
    const roofDark = 0x6B4B2A // Techo en sombra
    
    const baseWidth = houseSize * 1.0
    const baseHeight = houseSize * 0.6
    const wallWidth = baseWidth * 0.7
    const wallHeight = houseSize * 0.5
    const roofHeight = houseSize * 0.4
    const roofWidth = baseWidth * 0.9
    const depth = houseSize * 0.12 // Profundidad 3D
    
    // Base trapezoidal (cara inferior visible) - en sombra
    graphics.fillStyle(darkFace, 1)
    graphics.beginPath()
    graphics.moveTo(-baseWidth / 2, 0)
    graphics.lineTo(baseWidth / 2, 0)
    graphics.lineTo(baseWidth / 2 * 0.75, baseHeight)
    graphics.lineTo(-baseWidth / 2 * 0.75, baseHeight)
    graphics.closePath()
    graphics.fillPath()
    
    // Muro frontal - cara principal iluminada
    graphics.fillStyle(lightFace, 1)
    graphics.fillRect(-wallWidth / 2, -wallHeight, wallWidth, wallHeight)
    
    // Muro - cara derecha (iluminada)
    graphics.fillStyle(midFace, 1)
    graphics.beginPath()
    graphics.moveTo(wallWidth / 2, -wallHeight)
    graphics.lineTo(wallWidth / 2 + depth, -wallHeight - depth * 0.5)
    graphics.lineTo(wallWidth / 2 + depth, depth * 0.5)
    graphics.lineTo(wallWidth / 2, 0)
    graphics.closePath()
    graphics.fillPath()
    
    // Muro - cara izquierda (en sombra)
    graphics.fillStyle(darkFace, 1)
    graphics.beginPath()
    graphics.moveTo(-wallWidth / 2, -wallHeight)
    graphics.lineTo(-wallWidth / 2 - depth, -wallHeight - depth * 0.5)
    graphics.lineTo(-wallWidth / 2 - depth, depth * 0.5)
    graphics.lineTo(-wallWidth / 2, 0)
    graphics.closePath()
    graphics.fillPath()
    
    // Detalles de piedra en los muros (textura inca) - solo en cara frontal
    graphics.fillStyle(midFace, 0.6)
    for (let j = 1; j < 3; j++) {
      const lineY = -wallHeight + (wallHeight / 3) * j
      graphics.fillRect(-wallWidth / 2, lineY, wallWidth, 2)
    }
    
    // Techo - cara frontal (iluminada)
    graphics.fillStyle(roofLight, 1)
    graphics.beginPath()
    graphics.moveTo(-roofWidth / 2, -wallHeight)
    graphics.lineTo(roofWidth / 2, -wallHeight)
    graphics.lineTo(roofWidth / 2 * 0.5, -wallHeight - roofHeight)
    graphics.lineTo(-roofWidth / 2 * 0.5, -wallHeight - roofHeight)
    graphics.closePath()
    graphics.fillPath()
    
    // Techo - cara derecha (muy iluminada)
    graphics.fillStyle(roofLight, 1)
    graphics.beginPath()
    graphics.moveTo(roofWidth / 2, -wallHeight)
    graphics.lineTo(roofWidth / 2 * 0.5, -wallHeight - roofHeight)
    graphics.lineTo(roofWidth / 2 * 0.5 + depth, -wallHeight - roofHeight - depth * 0.8)
    graphics.lineTo(roofWidth / 2 + depth, -wallHeight - depth * 0.5)
    graphics.closePath()
    graphics.fillPath()
    
    // Techo - cara izquierda (en sombra)
    graphics.fillStyle(roofDark, 1)
    graphics.beginPath()
    graphics.moveTo(-roofWidth / 2, -wallHeight)
    graphics.lineTo(-roofWidth / 2 * 0.5, -wallHeight - roofHeight)
    graphics.lineTo(-roofWidth / 2 * 0.5 - depth, -wallHeight - roofHeight - depth * 0.8)
    graphics.lineTo(-roofWidth / 2 - depth, -wallHeight - depth * 0.5)
    graphics.closePath()
    graphics.fillPath()
    
    // Detalles del techo (tejas) - solo en cara frontal
    graphics.fillStyle(roofMid, 0.7)
    for (let k = 0; k < 4; k++) {
      const tileX = -roofWidth / 2 + (roofWidth / 4) * k
      const tileY = -wallHeight - roofHeight * 0.3
      graphics.fillRect(tileX, tileY, roofWidth / 4, roofHeight * 0.4)
    }
    
    // Ventana pequeña (opcional, 70% probabilidad)
    if (Math.random() > 0.3) {
      const windowSize = houseSize * 0.15
      graphics.fillStyle(0x1B0B0A, 1) // Interior muy oscuro
      graphics.fillRect(-windowSize / 2, -wallHeight * 0.4, windowSize, windowSize * 0.8)
      // Marco de ventana - lado iluminado
      graphics.fillStyle(lightFace, 1)
      graphics.lineStyle(2, lightFace, 1)
      graphics.strokeRect(-windowSize / 2, -wallHeight * 0.4, windowSize, windowSize * 0.8)
    }
    
    // Entrada de la casita (puerta trapezoidal inca) - interior oscuro
    const doorWidth = houseSize * 0.2
    const doorHeight = houseSize * 0.3
    graphics.fillStyle(0x2B1B0A, 1) // Interior muy oscuro
    graphics.beginPath()
    graphics.moveTo(-doorWidth / 2, 0)
    graphics.lineTo(doorWidth / 2, 0)
    graphics.lineTo(doorWidth / 2 * 0.7, -doorHeight)
    graphics.lineTo(-doorWidth / 2 * 0.7, -doorHeight)
    graphics.closePath()
    graphics.fillPath()
    
    // Marco de la puerta - lado iluminado
    graphics.fillStyle(lightFace, 1)
    graphics.lineStyle(2, lightFace, 1)
    graphics.strokePath()
  }
}
