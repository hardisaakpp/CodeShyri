import type Phaser from 'phaser'
import { MountainRangeRenderer } from './mountain/MountainRangeRenderer'
import { VolcanoRenderer } from './mountain/VolcanoRenderer'
import { MountainEffectsRenderer } from './mountain/MountainEffectsRenderer'
import { MountainCloudRenderer } from './mountain/MountainCloudRenderer'
import type { MountainRangeOptions } from './mountain/MountainTypes'

export class MountainRenderer {
  private cloudElements: Phaser.GameObjects.Graphics[] = []

  constructor(
    private graphics: Phaser.GameObjects.Graphics,
    private scene: Phaser.Scene,
    private width: number,
    private height: number,
    private horizonY: number
  ) {}

  /**
   * Renderiza las montañas en múltiples capas con diseño de bosque mágico
   * Versión mejorada con colores vibrantes y formas más variadas
   */
  public render() {
    this.cloudElements = []
    
    // Efecto de niebla atmosférica entre capas
    MountainEffectsRenderer.renderAtmosphericFog(this.graphics, this.width, this.horizonY)
    
    // Montañas muy lejanas - capa 0 - Púrpura violeta vibrante
    this.graphics.fillStyle(0x7A5B9C, 0.75)
    MountainRangeRenderer.draw(
      this.graphics,
      this.width,
      this.height,
      this.horizonY,
      this.horizonY - 28,
      8,
      8,
      85
    )
    
    // Gradientes de color púrpura a rosa en montañas muy lejanas
    this.graphics.fillStyle(0x9A7BBC, 0.4)
    MountainEffectsRenderer.drawGradient(this.graphics, this.width, this.horizonY - 28, 8, 85, 'top')
    this.graphics.fillStyle(0xB899D8, 0.3)
    MountainEffectsRenderer.drawGradient(this.graphics, this.width, this.horizonY - 28, 8, 85, 'left')

    // Montañas lejanas - capa 1 - Azul turquesa vibrante
    this.graphics.fillStyle(0x4A8CBC, 0.9)
    MountainRangeRenderer.draw(
      this.graphics,
      this.width,
      this.height,
      this.horizonY,
      this.horizonY - 17,
      8,
      12,
      100
    )
    
    // Gradiente azul cielo
    this.graphics.fillStyle(0x6AA8D4, 0.45)
    MountainEffectsRenderer.drawGradient(this.graphics, this.width, this.horizonY - 17, 8, 100, 'top')
    
    // Nubes mágicas animadas en montañas lejanas
    const clouds1 = MountainCloudRenderer.draw(
      this.scene,
      this.width,
      this.horizonY - 17,
      8,
      100,
      0xE4F0FF,
      0.95
    )
    this.cloudElements.push(...clouds1)
    
    // Resaltes vibrantes en tonos esmeralda
    this.graphics.fillStyle(0x5AB8D4, 0.35)
    MountainEffectsRenderer.drawHighlights(this.graphics, this.width, this.horizonY - 17, 8, 100)
    this.graphics.fillStyle(0x4AC8BC, 0.25)
    MountainEffectsRenderer.drawGradient(this.graphics, this.width, this.horizonY - 17, 8, 100, 'right')

    // Montañas medias - capa 2 - Verde esmeralda brillante
    // Excluir zona del volcán (centro-derecha alrededor del 65% del ancho)
    const excludeZone: MountainRangeOptions = {
      excludeZone: { centerX: this.width * 0.65, width: 220 }
    }
    MountainRangeRenderer.draw(
      this.graphics,
      this.width,
      this.height,
      this.horizonY,
      this.horizonY - 6,
      6,
      18,
      72,
      excludeZone
    )
    
    // Capa de gradiente turquesa sobre verde
    this.graphics.fillStyle(0x4ABC8A, 0.5)
    MountainEffectsRenderer.drawGradient(this.graphics, this.width, this.horizonY - 6, 6, 72, 'top')
    
    // Sombra mágica de las montañas medias
    this.graphics.fillStyle(0x2A8C5A, 0.7)
    MountainEffectsRenderer.drawShadow(this.graphics, this.width, this.horizonY, this.horizonY - 6, 6, 18)
    
    // Nubes mágicas animadas en montañas medias (deshabilitadas para reducir cantidad)
    // const clouds2 = MountainCloudRenderer.draw(
    //   this.scene,
    //   this.width,
    //   this.horizonY - 6,
    //   6,
    //   72,
    //   0xF0F8FF,
    //   0.98
    // )
    // this.cloudElements.push(...clouds2)
    
    // Resaltes de luz mágica
    this.graphics.fillStyle(0x5ACC9A, 0.5)
    MountainEffectsRenderer.drawHighlights(this.graphics, this.width, this.horizonY - 6, 6, 72)
    this.graphics.fillStyle(0x6ADCAA, 0.35)
    MountainEffectsRenderer.drawGradient(this.graphics, this.width, this.horizonY - 6, 6, 72, 'right')
    this.graphics.fillStyle(0x7AECBA, 0.25)
    MountainEffectsRenderer.drawGradient(this.graphics, this.width, this.horizonY - 6, 6, 72, 'left')

    // Volcán Cotopaxi nevado (renderizado después de las montañas medias)
    VolcanoRenderer.render(this.graphics, this.width, this.horizonY)

    // Montañas cercanas - capa 3 - Verde jade vibrante
    this.graphics.fillStyle(0x4AAC7B, 1)
    MountainRangeRenderer.draw(
      this.graphics,
      this.width,
      this.height,
      this.horizonY,
      this.horizonY,
      5,
      25,
      50
    )
    
    // Capa de gradiente con toque púrpura
    this.graphics.fillStyle(0x6ACCAB, 0.45)
    MountainEffectsRenderer.drawGradient(this.graphics, this.width, this.horizonY, 5, 50, 'top')
    this.graphics.fillStyle(0x8A9CD4, 0.3)
    MountainEffectsRenderer.drawGradient(this.graphics, this.width, this.horizonY, 5, 50, 'left')
    
    // Sombra mágica de las montañas cercanas
    this.graphics.fillStyle(0x3A9C6B, 0.75)
    MountainEffectsRenderer.drawShadow(this.graphics, this.width, this.horizonY, this.horizonY, 5, 25)
    
    // Resaltes de luz mágica en múltiples colores
    this.graphics.fillStyle(0x6AEC9B, 0.55)
    MountainEffectsRenderer.drawHighlights(this.graphics, this.width, this.horizonY, 5, 50)
    this.graphics.fillStyle(0x7ACCF8, 0.3)
    MountainEffectsRenderer.drawHighlights(this.graphics, this.width, this.horizonY, 5, 50)
    this.graphics.fillStyle(0x8AECCB, 0.4)
    MountainEffectsRenderer.drawGradient(this.graphics, this.width, this.horizonY, 5, 50, 'right')
    
    // Detalles de textura mágica con colores vibrantes
    MountainEffectsRenderer.drawTextures(this.graphics, this.width, this.horizonY, 5, 50)
    
    return this.cloudElements
  }
}
