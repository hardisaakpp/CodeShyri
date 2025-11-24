import type Phaser from 'phaser'
import type { TreeData } from './tree/TreeTypes'
import { TreeColorGenerator } from './tree/TreeColorGenerator'
import { TreeTrunkRenderer } from './tree/TreeTrunkRenderer'
import { TreeCrownRenderer } from './tree/TreeCrownRenderer'
import { TreeShadowRenderer } from './tree/TreeShadowRenderer'
import { TreeAnimations } from './tree/TreeAnimations'

export class TreeRenderer {
  private treesData: TreeData[] = []
  private leafParticles: Phaser.GameObjects.Graphics[] = []

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
    this.treesData = []
    this.leafParticles = []
    
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
    const forestGroups = this.generateForestGroups(isTooCloseToVillage)
    
    // Crear árboles agrupados en cada bosquecito
    let totalTrees = 0
    const maxTrees = 40
    
    for (const groupCenterX of forestGroups) {
      if (totalTrees >= maxTrees) break
      
      // Cada grupo tiene un número variable de árboles (5-8)
      const treesPerGroup = 5 + Math.floor(Math.random() * 4)
      const treesInThisGroup = Math.min(treesPerGroup, maxTrees - totalTrees)
      
      for (let i = 0; i < treesInThisGroup; i++) {
        // Calcular posición del árbol
        const treePosition = this.calculateTreePosition(
          groupCenterX,
          mountainBaseY,
          mountainPoints,
          mountainVariation,
          seed,
          isTooCloseToVillage
        )
        
        if (!treePosition) continue
        
        const { treeX, treeY } = treePosition
        
        // Verificar si está sobre el lago
        if (isOverLake && isOverLake(treeX, treeY)) continue
        
        // Generar propiedades del árbol
        const treeHeight = 40 + Math.random() * 50
        const trunkWidth = 8 + Math.random() * 6
        const crownSize = 25 + Math.random() * 30
        
        // Seleccionar color y forma únicos para este árbol
        const treeColor = TreeColorGenerator.getTreeColor(totalTrees, treeX)
        const treeColorVariations = TreeColorGenerator.getTreeColorVariations(treeColor)
        const treeShapeType = TreeColorGenerator.getTreeShapeType(totalTrees, treeX)
        
        // Crear y renderizar el árbol
        const treeGraphics = this.scene.add.graphics()
        TreeTrunkRenderer.render(treeGraphics, trunkWidth, treeHeight)
        TreeCrownRenderer.draw(treeGraphics, treeShapeType, crownSize, treeHeight, treeColorVariations)
        
        // Crear contenedor para el árbol
        const treeContainer = this.scene.add.container(treeX, treeY + treeHeight * 0.7)
        treeContainer.add(treeGraphics)
        treeContainer.setDepth(2)
        treeGraphics.setPosition(0, -treeHeight * 0.7)
        
        trees.push(treeGraphics)
        
        // Crear sombra dinámica del árbol
        const shadowGraphics = this.scene.add.graphics()
        TreeShadowRenderer.draw(shadowGraphics, treeX, treeY, treeHeight, crownSize)
        shadowGraphics.setDepth(1.5)
        
        // Guardar datos del árbol para animaciones
        const treeData: TreeData = {
          graphics: treeGraphics,
          container: treeContainer,
          shadow: shadowGraphics,
          leaves: [],
          x: treeX,
          y: treeY,
          crownSize: crownSize,
          treeHeight: treeHeight,
          treeColor: treeColor
        }
        
        this.treesData.push(treeData)
        
        // Añadir animaciones
        TreeAnimations.addWindSway(this.scene, treeContainer)
        TreeAnimations.startFallingLeaves(this.scene, treeData, this.leafParticles)
        
        totalTrees++
      }
    }
    
    // Iniciar animación de sombras dinámicas
    TreeAnimations.startDynamicShadows(this.scene, this.treesData)
    
    return [...trees, ...this.leafParticles, ...this.treesData.map(t => t.shadow)]
  }

  /**
   * Genera las posiciones de los grupos de bosques evitando poblados
   */
  private generateForestGroups(isTooCloseToVillage: (x: number) => boolean): number[] {
    const forestGroups: number[] = []
    const numForestGroups = 7
    
    // Generar posiciones de grupos evitando poblados
    for (let g = 0; g < numForestGroups; g++) {
      let groupX: number
      let attempts = 0
      do {
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
    
    return forestGroups
  }

  /**
   * Calcula la posición de un árbol dentro de un grupo
   */
  private calculateTreePosition(
    groupCenterX: number,
    mountainBaseY: number,
    mountainPoints: number,
    mountainVariation: number,
    seed: number,
    isTooCloseToVillage: (x: number) => boolean
  ): { treeX: number; treeY: number } | null {
    // Agrupar árboles alrededor del centro del grupo
    const groupSpread = 45 + Math.random() * 25 // Radio del grupo: 45-70 píxeles
    const angle = Math.random() * Math.PI * 2 // Ángulo aleatorio
    const distance = Math.random() * groupSpread // Distancia del centro
    const treeX = groupCenterX + Math.cos(angle) * distance
    
    // Asegurar que el árbol no esté fuera de los límites
    if (treeX < 0 || treeX > this.width) return null
    if (isTooCloseToVillage(treeX)) return null
    
    // Calcular la posición Y en la base de la montaña más cercana
    const mountainIndex = Math.floor((treeX / this.width) * mountainPoints)
    const varAmount = Math.sin(mountainIndex * 0.5 + seed) * mountainVariation + 
                     Math.cos(mountainIndex * 0.3 + seed * 0.7) * (mountainVariation * 0.6) +
                     Math.sin(mountainIndex * 1.2 + seed * 1.3) * (mountainVariation * 0.4)
    const mountainBaseYAtX = mountainBaseY + varAmount
    
    // Colocar árbol en la falda de la montaña (más arriba en la ladera)
    const treeY = mountainBaseYAtX - 15 + Math.random() * 20
    
    return { treeX, treeY }
  }
}
