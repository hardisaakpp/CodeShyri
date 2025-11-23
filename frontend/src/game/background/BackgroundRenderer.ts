import type Phaser from 'phaser'
import { SkyRenderer } from './renderers/SkyRenderer'
import { MountainRenderer } from './renderers/MountainRenderer'
import { GroundRenderer } from './renderers/GroundRenderer'
import { TreeRenderer } from './renderers/TreeRenderer'
import { RockRenderer } from './renderers/RockRenderer'
import { AnimatedElementsRenderer } from './renderers/AnimatedElementsRenderer'

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
    this.horizonY = height * 0.6
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
    
    // Renderizar árboles
    const treeRenderer = new TreeRenderer(this.scene, this.width, this.horizonY)
    const trees = treeRenderer.render()
    
    // Renderizar rocas
    const rockRenderer = new RockRenderer(this.scene, this.width, this.height, this.horizonY)
    const rocks = rockRenderer.render()
    
    // Renderizar elementos animados
    const animatedRenderer = new AnimatedElementsRenderer(this.scene, this.width, this.height, this.horizonY)
    const animatedElements = animatedRenderer.render()

    return {
      backgroundGraphics: bgGraphics,
      animatedElements: [...animatedElements, ...mountainClouds],
      trees: trees,
      rocks: rocks
    }
  }
}
