import type Phaser from 'phaser'

export class TreeRenderer {
  constructor(
    private scene: Phaser.Scene,
    private width: number,
    private horizonY: number
  ) {}

  /**
   * Renderiza los árboles en las faldas de las montañas, agrupados en pequeños bosques
   */
  public render(isOverLake?: (x: number, y: number) => boolean): Phaser.GameObjects.Graphics[] {
    const trees: Phaser.GameObjects.Graphics[] = []
    
    // Calcular posiciones de las bases de las montañas cercanas
    const mountainBaseY = this.horizonY
    const mountainPoints = 10
    const mountainVariation = 30
    const seed = mountainBaseY * 0.1
    
    // Zonas de poblados a evitar (con margen de seguridad)
    const village1Center = this.width / 2 // Poblado central
    const village1Radius = 120 // Radio del poblado central + margen
    
    // Función para verificar si una posición está demasiado cerca de un poblado
    const isTooCloseToVillage = (x: number): boolean => {
      const distToVillage1 = Math.abs(x - village1Center)
      return distToVillage1 < village1Radius
    }
    
    // Crear grupos de bosques pequeños dispersos
    // Definir posiciones de grupos de bosques (centros de cada bosquecito)
    const forestGroups: number[] = []
    const numForestGroups = 7 // 7 grupos de bosques pequeños (aumentado para compensar el segundo poblado)
    
    // Generar posiciones de grupos evitando poblados
    for (let g = 0; g < numForestGroups; g++) {
      let groupX: number
      let attempts = 0
      do {
        // Distribuir grupos a lo largo del ancho, incluyendo el área donde estaba el segundo poblado
        groupX = this.width * (0.15 + Math.random() * 0.7) // Entre 15% y 85% del ancho
        attempts++
      } while (attempts < 50 && isTooCloseToVillage(groupX))
      
      if (!isTooCloseToVillage(groupX)) {
        forestGroups.push(groupX)
      }
    }
    
    // Agregar un grupo adicional en el área donde estaba el segundo poblado (75% del ancho)
    const secondVillageAreaX = this.width * 0.75
    if (!isTooCloseToVillage(secondVillageAreaX)) {
      forestGroups.push(secondVillageAreaX)
    }
    
    // Crear árboles agrupados en cada bosquecito
    let totalTrees = 0
    const maxTrees = 40 // Aumentado para compensar el segundo poblado eliminado
    
    for (const groupCenterX of forestGroups) {
      if (totalTrees >= maxTrees) break
      
      // Cada grupo tiene un número variable de árboles (5-8)
      const treesPerGroup = 5 + Math.floor(Math.random() * 4)
      const treesInThisGroup = Math.min(treesPerGroup, maxTrees - totalTrees)
      
      for (let i = 0; i < treesInThisGroup; i++) {
        // Agrupar árboles alrededor del centro del grupo
        const groupSpread = 45 + Math.random() * 25 // Radio del grupo: 45-70 píxeles
        const angle = (Math.random() * Math.PI * 2) // Ángulo aleatorio
        const distance = Math.random() * groupSpread // Distancia del centro
        const treeX = groupCenterX + Math.cos(angle) * distance
        
        // Asegurar que el árbol no esté fuera de los límites
        if (treeX < 0 || treeX > this.width) continue
        if (isTooCloseToVillage(treeX)) continue
        
        // Calcular la posición Y en la base de la montaña más cercana
        const mountainIndex = Math.floor((treeX / this.width) * mountainPoints)
        const varAmount = Math.sin(mountainIndex * 0.5 + seed) * mountainVariation + 
                         Math.cos(mountainIndex * 0.3 + seed * 0.7) * (mountainVariation * 0.6) +
                         Math.sin(mountainIndex * 1.2 + seed * 1.3) * (mountainVariation * 0.4)
        const mountainBaseYAtX = mountainBaseY + varAmount
        
        // Colocar árbol en la falda de la montaña (más arriba en la ladera)
        const treeY = mountainBaseYAtX - 15 + Math.random() * 20
        
        // Verificar si está sobre el lago
        if (isOverLake && isOverLake(treeX, treeY)) continue
        
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
        totalTrees++
      }
    }
    
    return trees
  }
}

