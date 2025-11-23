import type Phaser from 'phaser'

export class IncaCastleRenderer {
  constructor(
    private scene: Phaser.Scene,
    private width: number,
    private horizonY: number
  ) {}

  /**
   * Renderiza pequeños castillos y casitas incas en el escenario
   */
  public render(isOverLake?: (x: number, y: number) => boolean): Phaser.GameObjects.Graphics[] {
    const structures: Phaser.GameObjects.Graphics[] = []
    
    // Calcular posiciones de las bases de las montañas cercanas
    const mountainBaseY = this.horizonY
    const mountainPoints = 10
    const mountainVariation = 30
    const seed = mountainBaseY * 0.1
    
    // Centro del escenario para el primer poblado (con castillos y casitas)
    const villageCenterX = this.width / 2
    
    // Crear 6 estructuras agrupadas como un pequeño poblado en el centro
    // 2 castillos y 4 casitas
    for (let i = 0; i < 6; i++) {
      // Agrupar estructuras alrededor del centro con pequeñas variaciones
      const offsetX = (i - 2.5) * 32 + (Math.random() - 0.5) * 18 // Distribución más compacta
      const structureX = villageCenterX + offsetX
      
      // Calcular la posición Y en la base de la montaña más cercana
      const mountainIndex = Math.floor((structureX / this.width) * mountainPoints)
      const varAmount = Math.sin(mountainIndex * 0.5 + seed) * mountainVariation + 
                       Math.cos(mountainIndex * 0.3 + seed * 0.7) * (mountainVariation * 0.6) +
                       Math.sin(mountainIndex * 1.2 + seed * 1.3) * (mountainVariation * 0.4)
      const mountainBaseYAtX = mountainBaseY + varAmount
      
      // Colocar estructura en el terreno plano, más abajo que los árboles
      // Los árboles están en las faldas (mountainBaseYAtX - 15), así que las estructuras
      // van más abajo en el terreno plano para no superponerse
      const structureY = mountainBaseYAtX + 20 + Math.random() * 10
      
      if (isOverLake && isOverLake(structureX, structureY)) continue
      
      // Mezclar casitas y castillos (2 castillos y 4 casitas)
      const isCastle = i < 2 // Primeras 2 son castillos, últimas 4 son casitas
      const baseSize = isCastle ? (28 + Math.random() * 12) : (18 + Math.random() * 10)
      
      const structureGraphics = this.scene.add.graphics()
      
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
    }
    
    // Segundo poblado de casitas (solo casitas) a la derecha, en área libre de árboles
    // Los árboles evitan el centro (25% a cada lado), así que colocamos este poblado
    // más hacia la derecha, pero en el terreno plano, no en las faldas donde están los árboles
    const secondVillageCenterX = this.width * 0.75
    const numHouses = 5 // 5 casitas en el segundo poblado
    
    for (let i = 0; i < numHouses; i++) {
      // Agrupar casitas con pequeñas variaciones
      const offsetX = (i - 1) * 30 + (Math.random() - 0.5) * 15
      const structureX = secondVillageCenterX + offsetX
      
      // Calcular la posición Y en la base de la montaña más cercana
      const mountainIndex = Math.floor((structureX / this.width) * mountainPoints)
      const varAmount = Math.sin(mountainIndex * 0.5 + seed) * mountainVariation + 
                       Math.cos(mountainIndex * 0.3 + seed * 0.7) * (mountainVariation * 0.6) +
                       Math.sin(mountainIndex * 1.2 + seed * 1.3) * (mountainVariation * 0.4)
      const mountainBaseYAtX = mountainBaseY + varAmount
      
      // Colocar casita en el terreno plano, más abajo que los árboles
      // Los árboles están en las faldas (mountainBaseYAtX - 15), así que las casitas
      // van más abajo en el terreno plano para no superponerse
      const structureY = mountainBaseYAtX + 25 + Math.random() * 15
      
      if (isOverLake && isOverLake(structureX, structureY)) continue
      
      const baseSize = 18 + Math.random() * 10
      
      const structureGraphics = this.scene.add.graphics()
      this.renderIncaHouse(structureGraphics, baseSize)
      
      structureGraphics.setPosition(structureX, structureY)
      structureGraphics.setDepth(2)
      structures.push(structureGraphics)
    }
    
    return structures
  }

  /**
   * Renderiza un castillo inca
   */
  private renderCastle(
    graphics: Phaser.GameObjects.Graphics,
    castleSize: number
  ) {
    // Base del castillo (forma trapezoidal inca)
    graphics.fillStyle(0x6B5B4A, 1) // Piedra inca oscura
    const baseWidth = castleSize * 1.2
    const baseHeight = castleSize * 0.8
    
    // Base trapezoidal (característica arquitectónica inca)
    graphics.beginPath()
    graphics.moveTo(-baseWidth / 2, 0)
    graphics.lineTo(baseWidth / 2, 0)
    graphics.lineTo(baseWidth / 2 * 0.7, baseHeight)
    graphics.lineTo(-baseWidth / 2 * 0.7, baseHeight)
    graphics.closePath()
    graphics.fillPath()
    
    // Muro frontal
    graphics.fillStyle(0x7B6B5A, 1)
    const wallWidth = baseWidth * 0.6
    const wallHeight = castleSize * 0.6
    graphics.fillRect(-wallWidth / 2, -wallHeight, wallWidth, wallHeight)
    
    // Torres laterales (características de castillos incas)
    const towerSize = castleSize * 0.4
    const towerHeight = castleSize * 0.7
    
    // Torre izquierda
    graphics.fillStyle(0x6B5B4A, 1)
    graphics.fillRect(-baseWidth / 2 * 0.8, -towerHeight, towerSize, towerHeight)
    
    // Torre derecha
    graphics.fillRect(baseWidth / 2 * 0.8 - towerSize, -towerHeight, towerSize, towerHeight)
    
    // Torre central (más alta)
    const centerTowerSize = castleSize * 0.35
    const centerTowerHeight = castleSize * 0.9
    graphics.fillStyle(0x5B4B3A, 1)
    graphics.fillRect(-centerTowerSize / 2, -centerTowerHeight, centerTowerSize, centerTowerHeight)
    
    // Detalles de piedra (textura inca)
    graphics.fillStyle(0x8B7B6A, 0.6)
    // Líneas horizontales características de la arquitectura inca
    for (let j = 1; j < 4; j++) {
      const lineY = -centerTowerHeight + (centerTowerHeight / 4) * j
      graphics.fillRect(-centerTowerSize / 2, lineY, centerTowerSize, 1.5)
    }
    
    // Sombras en los muros
    graphics.fillStyle(0x4B3B2A, 0.7)
    graphics.fillRect(-wallWidth / 2, -wallHeight, wallWidth * 0.3, wallHeight)
    graphics.fillRect(-baseWidth / 2 * 0.8, -towerHeight, towerSize * 0.3, towerHeight)
    graphics.fillRect(baseWidth / 2 * 0.8 - towerSize, -towerHeight, towerSize * 0.3, towerHeight)
    
    // Resaltes de luz
    graphics.fillStyle(0x9B8B7A, 0.4)
    graphics.fillRect(wallWidth / 2 * 0.6, -wallHeight, wallWidth * 0.2, wallHeight * 0.6)
    graphics.fillRect(centerTowerSize / 2 * 0.6, -centerTowerHeight, centerTowerSize * 0.2, centerTowerHeight * 0.6)
    
    // Entrada del castillo (puerta trapezoidal inca)
    const doorWidth = castleSize * 0.25
    const doorHeight = castleSize * 0.35
    graphics.fillStyle(0x3B2B1A, 0.9)
    graphics.beginPath()
    graphics.moveTo(-doorWidth / 2, 0)
    graphics.lineTo(doorWidth / 2, 0)
    graphics.lineTo(doorWidth / 2 * 0.6, -doorHeight)
    graphics.lineTo(-doorWidth / 2 * 0.6, -doorHeight)
    graphics.closePath()
    graphics.fillPath()
    
    // Bandera o estandarte en la torre central (opcional, 50% probabilidad)
    if (Math.random() > 0.5) {
      const flagX = 0
      const flagY = -centerTowerHeight - 3
      graphics.fillStyle(0x8B4A3A, 0.8) // Color terracota
      graphics.fillRect(flagX, flagY, castleSize * 0.15, castleSize * 0.2)
      graphics.fillStyle(0x9B5A4A, 0.6)
      graphics.fillRect(flagX, flagY, castleSize * 0.15, castleSize * 0.1)
    }
  }

  /**
   * Renderiza una casita inca
   */
  private renderIncaHouse(
    graphics: Phaser.GameObjects.Graphics,
    houseSize: number
  ) {
    // Base de la casita (forma trapezoidal inca)
    graphics.fillStyle(0x6B5B4A, 1) // Piedra inca oscura
    const baseWidth = houseSize * 1.0
    const baseHeight = houseSize * 0.6
    
    // Base trapezoidal
    graphics.beginPath()
    graphics.moveTo(-baseWidth / 2, 0)
    graphics.lineTo(baseWidth / 2, 0)
    graphics.lineTo(baseWidth / 2 * 0.75, baseHeight)
    graphics.lineTo(-baseWidth / 2 * 0.75, baseHeight)
    graphics.closePath()
    graphics.fillPath()
    
    // Muros de la casita
    graphics.fillStyle(0x7B6B5A, 1)
    const wallWidth = baseWidth * 0.7
    const wallHeight = houseSize * 0.5
    graphics.fillRect(-wallWidth / 2, -wallHeight, wallWidth, wallHeight)
    
    // Detalles de piedra en los muros (textura inca)
    graphics.fillStyle(0x8B7B6A, 0.5)
    for (let j = 1; j < 3; j++) {
      const lineY = -wallHeight + (wallHeight / 3) * j
      graphics.fillRect(-wallWidth / 2, lineY, wallWidth, 1)
    }
    
    // Techo de paja/tejas (característico de casitas incas)
    const roofHeight = houseSize * 0.4
    const roofWidth = baseWidth * 0.9
    
    // Techo principal
    graphics.fillStyle(0x8B6B4A, 1) // Color paja/teja
    graphics.beginPath()
    graphics.moveTo(-roofWidth / 2, -wallHeight)
    graphics.lineTo(roofWidth / 2, -wallHeight)
    graphics.lineTo(roofWidth / 2 * 0.5, -wallHeight - roofHeight)
    graphics.lineTo(-roofWidth / 2 * 0.5, -wallHeight - roofHeight)
    graphics.closePath()
    graphics.fillPath()
    
    // Detalles del techo (tejas)
    graphics.fillStyle(0x9B7B5A, 0.6)
    for (let k = 0; k < 4; k++) {
      const tileX = -roofWidth / 2 + (roofWidth / 4) * k
      const tileY = -wallHeight - roofHeight * 0.3
      graphics.fillRect(tileX, tileY, roofWidth / 4, roofHeight * 0.4)
    }
    
    // Sombra del techo
    graphics.fillStyle(0x6B4B2A, 0.7)
    graphics.fillRect(-roofWidth / 2, -wallHeight, roofWidth * 0.3, roofHeight)
    
    // Ventana pequeña (opcional, 70% probabilidad)
    if (Math.random() > 0.3) {
      const windowSize = houseSize * 0.15
      graphics.fillStyle(0x2B1B0A, 0.8) // Interior oscuro
      graphics.fillRect(-windowSize / 2, -wallHeight * 0.4, windowSize, windowSize * 0.8)
      graphics.fillStyle(0x4B3B2A, 0.6) // Marco
      graphics.lineStyle(1.5, 0x5B4B3A, 0.8)
      graphics.strokeRect(-windowSize / 2, -wallHeight * 0.4, windowSize, windowSize * 0.8)
    }
    
    // Entrada de la casita (puerta trapezoidal inca)
    const doorWidth = houseSize * 0.2
    const doorHeight = houseSize * 0.3
    graphics.fillStyle(0x3B2B1A, 0.9)
    graphics.beginPath()
    graphics.moveTo(-doorWidth / 2, 0)
    graphics.lineTo(doorWidth / 2, 0)
    graphics.lineTo(doorWidth / 2 * 0.7, -doorHeight)
    graphics.lineTo(-doorWidth / 2 * 0.7, -doorHeight)
    graphics.closePath()
    graphics.fillPath()
    
    // Sombras en los muros
    graphics.fillStyle(0x4B3B2A, 0.6)
    graphics.fillRect(-wallWidth / 2, -wallHeight, wallWidth * 0.3, wallHeight)
    
    // Resaltes de luz
    graphics.fillStyle(0x9B8B7A, 0.3)
    graphics.fillRect(wallWidth / 2 * 0.6, -wallHeight, wallWidth * 0.2, wallHeight * 0.5)
  }
}
