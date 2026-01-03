import type Phaser from 'phaser'
import { SkyRenderer } from './renderers/SkyRenderer'
import { MountainRenderer } from './renderers/MountainRenderer'
import { GroundRenderer } from './renderers/GroundRenderer'
import { TreeRenderer } from './renderers/TreeRenderer'
import { RockRenderer } from './renderers/RockRenderer'
import { AnimatedElementsRenderer } from './renderers/AnimatedElementsRenderer'
import { IncaCastleRenderer } from './renderers/IncaCastleRenderer'
import { MushroomFlowerRenderer } from './renderers/MushroomFlowerRenderer'
import { LakeRenderer } from './renderers/LakeRenderer'
import { BirdRenderer } from './renderers/BirdRenderer'
import { SmokeRenderer } from './renderers/SmokeRenderer'
import { TotemRenderer } from './renderers/TotemRenderer'
import { WaterLilyRenderer } from './renderers/WaterLilyRenderer'
import { GridRenderer } from './renderers/GridRenderer'
import { GoalRenderer } from './renderers/GoalRenderer'
import { FireRenderer } from './renderers/FireRenderer'

/**
 * Orquestador principal para renderizar todos los elementos del fondo del juego.
 * Mantiene la interfaz pública original mientras delega la responsabilidad
 * a renderers especializados.
 */
export class BackgroundRenderer {
  private scene: Phaser.Scene
  private width: number
  private height: number
  private horizonY: number
  private gridRenderer: GridRenderer
  private groundRenderer?: GroundRenderer
  private goalRenderer?: GoalRenderer
  private fireRenderer?: FireRenderer

  constructor(scene: Phaser.Scene, width: number, height: number) {
    this.scene = scene
    this.width = width
    this.height = height
    this.horizonY = height * 0.33 // 1/3 para paisaje, 2/3 para terreno
    this.gridRenderer = new GridRenderer(scene)
  }

  /**
   * Obtiene el renderer del grid (para uso externo)
   */
  public getGridRenderer(): GridRenderer {
    return this.gridRenderer
  }

  /**
   * Obtiene el renderer del suelo
   */
  public getGroundRenderer(): GroundRenderer | undefined {
    return this.groundRenderer
  }

  /**
   * Obtiene el renderer del objetivo/premio
   */
  public getGoalRenderer(): GoalRenderer | undefined {
    return this.goalRenderer
  }

  /**
   * Obtiene el renderer de la fogata
   */
  public getFireRenderer(): FireRenderer | undefined {
    return this.fireRenderer
  }

  /**
   * Renderiza todo el fondo del juego
   * @returns Objeto con los elementos renderizados (mantiene compatibilidad con código existente)
   */
  public render(
    pathCoordinates?: Array<{ x: number; y: number }>,
    lakeConfig?: { centerX: number; centerY: number; width?: number; height?: number }
  ) {
    const bgGraphics = this.scene.add.graphics()
    
    // Renderizar cielo
    const skyRenderer = new SkyRenderer(bgGraphics, this.width, this.horizonY)
    skyRenderer.render()
    
    // Renderizar montañas
    const mountainRenderer = new MountainRenderer(bgGraphics, this.scene, this.width, this.height, this.horizonY)
    const mountainClouds = mountainRenderer.render()
    
    // Renderizar suelo (pasar gridRenderer para bloques tipo Minecraft y scene para labels temporales)
    this.groundRenderer = new GroundRenderer(bgGraphics, this.width, this.height, this.horizonY, this.gridRenderer, this.scene)
    
    // Configurar bloques de camino (path) ANTES de renderizar si están definidos
    if (pathCoordinates && pathCoordinates.length > 0) {
      this.groundRenderer.setPathBlocks(pathCoordinates)
    }
    
    this.groundRenderer.render()
    
    // Renderizar lago primero para obtener su información (pasar configuración si existe)
    const lakeRenderer = new LakeRenderer(this.scene, this.width, this.horizonY)
    const lake = lakeRenderer.render(lakeConfig)
    
    // Función helper para verificar si una posición está sobre el lago
    const isOverLake = (x: number, y: number): boolean => {
      return lakeRenderer.isOverLake(x, y)
    }
    
    // Función helper para verificar si una posición está en el camino (path) - por coordenadas de grid
    const isGridOnPath = (gridX: number, gridY: number): boolean => {
      if (!this.groundRenderer) return false
      return this.groundRenderer.isPathBlock(gridX, gridY)
    }
    
    // Función helper para verificar si una posición en píxeles está en el camino (path)
    const isOnPath = (x: number, y: number): boolean => {
      if (!this.groundRenderer) return false
      return this.groundRenderer.isPixelOnPath(x, y, this.gridRenderer)
    }
    
    // Función combinada para verificar ambas condiciones (lago y path) - por coordenadas de grid
    const isValidGridPosition = (gridX: number, gridY: number): boolean => {
      // Convertir grid a píxeles para verificar el lago
      const pixelPos = this.gridRenderer.gridToPixel(gridX, gridY)
      return !isOverLake(pixelPos.pixelX, pixelPos.pixelY) && !isGridOnPath(gridX, gridY)
    }
    
    // Función combinada para verificar ambas condiciones (lago y path) - por coordenadas de píxel
    const isValidPosition = (x: number, y: number): boolean => {
      return !isOverLake(x, y) && !isOnPath(x, y)
    }
    
    // Set para rastrear posiciones de grid ocupadas (formato "gridX,gridY")
    const occupiedGridPositions = new Set<string>()
    
    // Renderizar castillos incas PRIMERO (evitando el lago y el camino)
    // Las casas ocupan bloques verdes individuales
    const castleRenderer = new IncaCastleRenderer(this.scene, this.width, this.horizonY)
    const castleRenderResult = castleRenderer.render(isValidGridPosition, isValidPosition, occupiedGridPositions)
    const castles = castleRenderResult.graphics
    
    // Renderizar árboles (evitando el lago, el camino, y las casas)
    const treeRenderer = new TreeRenderer(this.scene, this.width, this.horizonY)
    const treeRenderResult = treeRenderer.render(isValidGridPosition, isValidPosition, occupiedGridPositions)
    const trees = treeRenderResult.graphics
    const treePositions = treeRenderResult.positions
    
    // Renderizar rocas (evitando el lago, el camino, y las casas)
    // Las rocas ocupan bloques verdes individuales
    const rockRenderer = new RockRenderer(this.scene, this.width, this.height, this.horizonY)
    const rocks = rockRenderer.render(isValidGridPosition, occupiedGridPositions)
    
    // Renderizar elementos animados
    const animatedRenderer = new AnimatedElementsRenderer(this.scene, this.width, this.height, this.horizonY)
    const animatedElements = animatedRenderer.render()
    
    // Renderizar hongos, flores y arbustos (evitando el lago)
    // Los arbustos ocupan bloques verdes individuales y evitan casas y rocas
    const mushroomFlowerRenderer = new MushroomFlowerRenderer(this.scene, this.width, this.height, this.horizonY)
    const mushroomsFlowers = mushroomFlowerRenderer.render(isOverLake, isValidGridPosition, occupiedGridPositions)
    
    // Renderizar aves volando
    const birdRenderer = new BirdRenderer(this.scene, this.width, this.horizonY)
    const birds = birdRenderer.render()
    
    // Renderizar humo de chimeneas (no necesita posiciones específicas de castillos)
    const smokeRenderer = new SmokeRenderer(this.scene, this.width, this.horizonY)
    const smokeElements = smokeRenderer.render()
    
    // Renderizar tótems incas (evitando el lago y el camino)
    const totemRenderer = new TotemRenderer(this.scene, this.width, this.horizonY)
    const totems = totemRenderer.render(isValidGridPosition, isValidPosition)
    
    // Renderizar lirios acuáticos en el lago
    const waterLilyRenderer = new WaterLilyRenderer(this.scene)
    const waterLilies = waterLilyRenderer.render(lakeRenderer.lakeInfo)

    // Renderizar grid/grid sobre el terreno (antes de la fogata para que la fogata esté visible)
    const gridGraphics = this.gridRenderer.render(this.width, this.height, this.horizonY)

    // Renderizar fogata en el bloque (5,1)
    // TEMPORAL: Colocada en coordenadas fijas para testing
    const firePosition = { gridX: 5, gridY: 1 }
    this.fireRenderer = new FireRenderer(this.scene, this.gridRenderer, this.horizonY)
    const fireContainer = this.fireRenderer.render(firePosition.gridX, firePosition.gridY)
    if (fireContainer) {
      console.log('🔥 Fogata colocada en el bloque:', firePosition)
      console.log('🔥 Posición en píxeles:', this.gridRenderer.gridToPixel(firePosition.gridX, firePosition.gridY))
    } else {
      console.error('❌ Error: No se pudo crear la fogata')
    }

    // El premio/objetivo se renderiza después (desde GameScene) ya que necesita configuración del nivel

    return {
      backgroundGraphics: bgGraphics,
      gridGraphics: gridGraphics,
      animatedElements: [...animatedElements, ...mountainClouds, ...birds, ...smokeElements],
      trees: trees,
      rocks: rocks,
      castles: castles,
      mushroomsFlowers: mushroomsFlowers,
      lake: lake,
      totems: totems,
      waterLilies: waterLilies
    }
  }

  /**
   * Renderiza el premio final/objetivo
   */
  public renderGoal(goalGridX: number, goalGridY: number): void {
    this.goalRenderer = new GoalRenderer(
      this.scene,
      this.gridRenderer,
      goalGridX,
      goalGridY,
      this.horizonY
    )
    this.goalRenderer.render()
  }
}
