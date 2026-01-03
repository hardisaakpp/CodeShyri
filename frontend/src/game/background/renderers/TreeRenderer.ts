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
   * Renderiza los árboles distribuidos en el grid de tierra
   * @returns Objeto con los gráficos de los árboles y sus posiciones
   */
  public render(isOverLake?: (x: number, y: number) => boolean): { graphics: Phaser.GameObjects.Graphics[], positions: Array<{ x: number, y: number }> } {
    const trees: Phaser.GameObjects.Graphics[] = []
    this.treesData = []
    this.leafParticles = []
    
    // Tamaño de celda del grid (debe coincidir con GridRenderer)
    const cellSize = 60
    
    // Calcular dimensiones del grid de tierra
    // horizonY divide el mapa: arriba es cielo, abajo es tierra
    // Estimar groundHeight: si horizonY = height * 0.33, entonces groundHeight ≈ horizonY * 2
    const estimatedGroundHeight = this.horizonY * 2
    const numCols = Math.floor(this.width / cellSize)
    const numRows = Math.floor(estimatedGroundHeight / cellSize)
    
    // Crear árboles distribuidos en el grid de tierra
    const maxTrees = 18 // Reducido de 24 a 18
    
    // Generar posiciones disponibles en el grid de tierra (evitando bordes)
    const availablePositions: Array<{ gridX: number; gridY: number }> = []
    for (let col = 1; col < numCols - 1; col++) { // Evitar los bordes (dejar 1 columna de margen)
      for (let row = 0; row < Math.min(numRows - 1, 8); row++) { // Primeras 8 filas del terreno
        availablePositions.push({ gridX: col, gridY: row })
      }
    }
    
    // Mezclar posiciones disponibles para distribución aleatoria
    const shuffledPositions = availablePositions.sort(() => Math.random() - 0.5)
    
    // Colocar árboles en posiciones del grid
    for (let i = 0; i < maxTrees && i < shuffledPositions.length; i++) {
      const gridPos = shuffledPositions[i]
      
      // Convertir posición del grid a píxeles (centro de la celda con variación pequeña)
      const baseX = (gridPos.gridX * cellSize) + (cellSize / 2)
      const baseY = this.horizonY + (gridPos.gridY * cellSize) + (cellSize / 2)
      
      // Pequeña variación aleatoria para que no estén exactamente en el centro
      const treeX = baseX + (Math.random() - 0.5) * (cellSize * 0.4)
      const treeY = baseY + (Math.random() - 0.5) * (cellSize * 0.3)
      
      // Asegurar que el árbol no esté fuera de los límites
      if (treeX < 0 || treeX > this.width) continue
      
      // Verificar si está sobre el lago
      if (isOverLake && isOverLake(treeX, treeY)) continue
        
      // Generar propiedades del árbol
      const treeHeight = 40 + Math.random() * 50
      const trunkWidth = 8 + Math.random() * 6
      const crownSize = 25 + Math.random() * 30
      
      // Seleccionar color y forma únicos para este árbol
      const treeColor = TreeColorGenerator.getTreeColor(i, treeX)
      const treeColorVariations = TreeColorGenerator.getTreeColorVariations(treeColor)
      const treeShapeType = TreeColorGenerator.getTreeShapeType(i, treeX)
      
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
    }
    
    // Iniciar animación de sombras dinámicas
    TreeAnimations.startDynamicShadows(this.scene, this.treesData)
    
    // Extraer posiciones de los árboles
    const treePositions = this.treesData.map(t => ({ x: t.x, y: t.y }))
    
    return {
      graphics: [...trees, ...this.leafParticles, ...this.treesData.map(t => t.shadow)],
      positions: treePositions
    }
  }

}
