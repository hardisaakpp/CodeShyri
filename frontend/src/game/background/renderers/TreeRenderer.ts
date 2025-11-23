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
        const treeType = Math.random() // Variación en el tipo de árbol
        
        const treeGraphics = this.scene.add.graphics()
        
        // Tronco más orgánico con forma ligeramente cónica
        const trunkTopWidth = trunkWidth * 0.7
        const trunkBottomWidth = trunkWidth
        
        // Base del tronco (más ancha)
        treeGraphics.fillStyle(0x5C4033, 1) // Marrón oscuro base
        treeGraphics.fillRect(-trunkBottomWidth / 2, treeHeight * 0.7, trunkBottomWidth, treeHeight * 0.3)
        
        // Cuerpo principal del tronco (más estrecho arriba)
        treeGraphics.beginPath()
        treeGraphics.moveTo(-trunkBottomWidth / 2, treeHeight * 0.7)
        treeGraphics.lineTo(-trunkTopWidth / 2, 0)
        treeGraphics.lineTo(trunkTopWidth / 2, 0)
        treeGraphics.lineTo(trunkBottomWidth / 2, treeHeight * 0.7)
        treeGraphics.closePath()
        treeGraphics.fillPath()
        
        // Textura del tronco con grietas verticales
        treeGraphics.fillStyle(0x3D2817, 0.6)
        treeGraphics.fillRect(-trunkWidth / 2 + 1, treeHeight * 0.1, trunkWidth * 0.25, treeHeight * 0.6)
        treeGraphics.fillRect(trunkWidth / 2 - trunkWidth * 0.25, treeHeight * 0.2, trunkWidth * 0.25, treeHeight * 0.5)
        
        // Nudos en el tronco
        const knotY = treeHeight * 0.3 + Math.random() * treeHeight * 0.3
        treeGraphics.fillStyle(0x2A1A0F, 0.8)
        treeGraphics.fillCircle(0, knotY, trunkWidth * 0.3)
        
        // Sombra lateral del tronco (iluminación desde la izquierda)
        treeGraphics.fillStyle(0x4A3428, 0.5)
        treeGraphics.beginPath()
        treeGraphics.moveTo(-trunkBottomWidth / 2, treeHeight * 0.7)
        treeGraphics.lineTo(-trunkTopWidth / 2, 0)
        treeGraphics.lineTo(-trunkTopWidth / 2 + trunkWidth * 0.2, 0)
        treeGraphics.lineTo(-trunkBottomWidth / 2 + trunkWidth * 0.2, treeHeight * 0.7)
        treeGraphics.closePath()
        treeGraphics.fillPath()
        
        // Ramas principales visibles (solo para árboles más grandes)
        if (treeHeight > 60) {
          const branchY = -treeHeight * 0.1
          treeGraphics.fillStyle(0x4A3428, 1)
          // Rama izquierda
          treeGraphics.fillRect(-trunkTopWidth / 2 - 3, branchY, 8, 3)
          // Rama derecha
          treeGraphics.fillRect(trunkTopWidth / 2 - 5, branchY - 5, 8, 3)
        }
        
        // Copa del árbol mejorada con más capas y variación
        const crownBaseY = -treeHeight * 0.15
        
        // Capa base de la copa (más grande y oscura)
        treeGraphics.fillStyle(0x1B3D1B, 0.95)
        treeGraphics.fillCircle(0, crownBaseY, crownSize)
        
        // Capas superiores de la copa (creando volumen)
        if (treeType > 0.3) {
          // Estilo más frondoso
          treeGraphics.fillCircle(crownSize * 0.5, crownBaseY - crownSize * 0.2, crownSize * 0.85)
          treeGraphics.fillCircle(-crownSize * 0.5, crownBaseY - crownSize * 0.2, crownSize * 0.85)
          treeGraphics.fillCircle(0, crownBaseY - crownSize * 0.5, crownSize * 0.75)
          
          // Capa adicional para más densidad
          treeGraphics.fillStyle(0x2A4A2A, 0.8)
          treeGraphics.fillCircle(crownSize * 0.3, crownBaseY - crownSize * 0.3, crownSize * 0.65)
          treeGraphics.fillCircle(-crownSize * 0.3, crownBaseY - crownSize * 0.3, crownSize * 0.65)
          treeGraphics.fillCircle(0, crownBaseY - crownSize * 0.4, crownSize * 0.6)
        } else {
          // Estilo más cónico/piramidal
          treeGraphics.fillCircle(0, crownBaseY - crownSize * 0.3, crownSize * 0.9)
          treeGraphics.fillCircle(0, crownBaseY - crownSize * 0.6, crownSize * 0.7)
          treeGraphics.fillCircle(0, crownBaseY - crownSize * 0.85, crownSize * 0.5)
          
          treeGraphics.fillStyle(0x2A4A2A, 0.8)
          treeGraphics.fillCircle(0, crownBaseY - crownSize * 0.35, crownSize * 0.7)
          treeGraphics.fillCircle(0, crownBaseY - crownSize * 0.65, crownSize * 0.55)
        }
        
        // Detalles de sombra en la copa (lado izquierdo más oscuro)
        treeGraphics.fillStyle(0x0F2A0F, 0.7)
        treeGraphics.fillCircle(-crownSize * 0.3, crownBaseY - crownSize * 0.1, crownSize * 0.6)
        treeGraphics.fillCircle(-crownSize * 0.2, crownBaseY - crownSize * 0.4, crownSize * 0.5)
        
        // Puntos de luz en la copa (lado derecho más claro - efecto de iluminación)
        treeGraphics.fillStyle(0x2D5A2D, 0.5)
        treeGraphics.fillCircle(crownSize * 0.3, crownBaseY - crownSize * 0.2, crownSize * 0.4)
        treeGraphics.fillCircle(crownSize * 0.25, crownBaseY - crownSize * 0.5, crownSize * 0.35)
        
        // Detalles de textura en la copa (pequeños círculos para simular hojas)
        treeGraphics.fillStyle(0x1B3D1B, 0.6)
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2
          const dist = crownSize * (0.4 + Math.random() * 0.3)
          const leafX = Math.cos(angle) * dist
          const leafY = crownBaseY + Math.sin(angle) * dist * 0.6
          treeGraphics.fillCircle(leafX, leafY, 3 + Math.random() * 2)
        }
        
        treeGraphics.setPosition(treeX, treeY)
        treeGraphics.setDepth(2)
        trees.push(treeGraphics)
        totalTrees++
      }
    }
    
    return trees
  }
}

