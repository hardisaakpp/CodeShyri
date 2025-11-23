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
import { PathRenderer } from './renderers/PathRenderer'
import { TotemRenderer } from './renderers/TotemRenderer'
import { WaterLilyRenderer } from './renderers/WaterLilyRenderer'

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

  constructor(scene: Phaser.Scene, width: number, height: number) {
    this.scene = scene
    this.width = width
    this.height = height
    this.horizonY = height * 0.33 // 1/3 para paisaje, 2/3 para terreno
  }

  /**
   * Renderiza todo el fondo del juego
   * @returns Objeto con los elementos renderizados (mantiene compatibilidad con código existente)
   */
  public render() {
    const bgGraphics = this.scene.add.graphics()
    
    // Renderizar cielo
    const skyRenderer = new SkyRenderer(bgGraphics, this.width, this.horizonY)
    skyRenderer.render()
    
    // Renderizar montañas
    const mountainRenderer = new MountainRenderer(bgGraphics, this.scene, this.width, this.height, this.horizonY)
    const mountainClouds = mountainRenderer.render()
    
    // Renderizar suelo
    const groundRenderer = new GroundRenderer(bgGraphics, this.width, this.height, this.horizonY)
    groundRenderer.render()
    
    // Renderizar lago primero para obtener su información
    const lakeRenderer = new LakeRenderer(this.scene, this.width, this.horizonY)
    const lake = lakeRenderer.render()
    
    // Función helper para verificar si una posición está sobre el lago
    const isOverLake = (x: number, y: number): boolean => {
      return lakeRenderer.isOverLake(x, y)
    }
    
    // Renderizar árboles (evitando el lago)
    const treeRenderer = new TreeRenderer(this.scene, this.width, this.horizonY)
    const trees = treeRenderer.render(isOverLake)
    
    // Renderizar rocas (evitando el lago)
    const rockRenderer = new RockRenderer(this.scene, this.width, this.height, this.horizonY)
    const rocks = rockRenderer.render(isOverLake)
    
    // Renderizar castillos incas (evitando el lago)
    const castleRenderer = new IncaCastleRenderer(this.scene, this.width, this.horizonY)
    const castles = castleRenderer.render(isOverLake)
    
    // Renderizar elementos animados
    const animatedRenderer = new AnimatedElementsRenderer(this.scene, this.width, this.height, this.horizonY)
    const animatedElements = animatedRenderer.render()
    
    // Renderizar hongos y flores mágicas (evitando el lago)
    const mushroomFlowerRenderer = new MushroomFlowerRenderer(this.scene, this.width, this.height, this.horizonY)
    const mushroomsFlowers = mushroomFlowerRenderer.render(isOverLake)
    
    // Renderizar aves volando
    const birdRenderer = new BirdRenderer(this.scene, this.width, this.horizonY)
    const birds = birdRenderer.render()
    
    // Renderizar humo de chimeneas (necesita posiciones de los castillos)
    const smokeRenderer = new SmokeRenderer(this.scene, this.width, this.horizonY)
    const smokeElements = smokeRenderer.render(castles.map(c => ({ x: c.x, y: c.y })))
    
    // Renderizar camino/sendero
    const pathRenderer = new PathRenderer(bgGraphics, this.width, this.horizonY)
    pathRenderer.render()
    
    // Renderizar tótems incas
    const totemRenderer = new TotemRenderer(this.scene, this.width, this.horizonY)
    const totems = totemRenderer.render(isOverLake)
    
    // Renderizar lirios acuáticos en el lago
    const waterLilyRenderer = new WaterLilyRenderer(this.scene)
    const waterLilies = waterLilyRenderer.render(lakeRenderer.lakeInfo)

    return {
      backgroundGraphics: bgGraphics,
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
}
