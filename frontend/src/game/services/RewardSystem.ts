import type Phaser from 'phaser'
import { MaizeEffectRenderer } from '../effects/MaizeEffectRenderer'

/**
 * Sistema de recompensas - maneja la lógica de recolección de maíz
 */
export class RewardSystem {
  private onRewardCallback?: (amount: number, type: 'path' | 'grass' | 'command' | 'goal' | 'level', message: string) => void
  private totalMaize: number = 0
  private pathBlocksVisited: Set<string> = new Set()
  private effectRenderer?: MaizeEffectRenderer

  constructor(
    onRewardCallback?: (amount: number, type: string, message: string) => void,
    scene?: Phaser.Scene
  ) {
    this.onRewardCallback = onRewardCallback
    if (scene) {
      this.effectRenderer = new MaizeEffectRenderer(scene)
    }
  }

  /**
   * Procesa recompensa por pisar un bloque
   * SOLO da recompensa si hay maíz visible - no por pisar bloques normalmente
   */
  public rewardForBlock(gridX: number, gridY: number, isPathBlock: boolean, pixelX?: number, pixelY?: number, hasVisibleMaize: boolean = false): number {
    const blockKey = `${gridX},${gridY}`
    
    // Si no hay maíz visible, NO dar recompensa (solo marcar el bloque como visitado)
    if (!hasVisibleMaize) {
      // Solo marcar como visitado para tracking, pero NO dar recompensa
      if (!this.pathBlocksVisited.has(blockKey)) {
        this.pathBlocksVisited.add(blockKey)
      }
      return 0
    }
    
    // Solo dar recompensa una vez por bloque con maíz visible
    if (this.pathBlocksVisited.has(blockKey)) {
      return 0
    }
    this.pathBlocksVisited.add(blockKey)

    let reward = 0
    let message = ''
    let type: 'path' | 'grass' = 'grass'

    // SOLO dar recompensa cuando hay maíz visible
    if (hasVisibleMaize) {
      // Recompensa por recolectar maíz visible
      reward = isPathBlock ? 20 : 10 // Mayor recompensa en sendero
      message = `🌽 +${reward} maíz - ¡Recolectaste maíz del sendero!`
      type = 'path'
      
      // Mostrar efecto visual
      if (this.effectRenderer && pixelX !== undefined && pixelY !== undefined) {
        this.effectRenderer.showMaizeCollect(pixelX, pixelY, reward, true)
      }

      this.totalMaize += reward
      if (this.onRewardCallback) {
        this.onRewardCallback(reward, type, message)
      }
    }

    return reward
  }

  /**
   * Recompensa por ejecutar un comando válido
   * NOTA: Por ahora NO damos recompensa por comandos, solo por recolectar maíz
   */
  public rewardForCommand(commandName: string): number {
    // No dar recompensa por comandos - solo por recolectar maíz
    // Esto hace el sistema más simple y claro
    return 0
  }

  /**
   * Recompensa por alcanzar el objetivo/premio final
   */
  public rewardForGoal(pixelX?: number, pixelY?: number): number {
    const reward = 50
    const message = `🎯 ¡Premio recolectado! +${reward} maíz`
    
    // Mostrar efecto visual especial para el premio
    if (this.effectRenderer && pixelX !== undefined && pixelY !== undefined) {
      this.effectRenderer.showGoalCollect(pixelX, pixelY, reward)
    }
    
    this.totalMaize += reward
    if (this.onRewardCallback) {
      this.onRewardCallback(reward, 'goal', message)
    }

    return reward
  }

  /**
   * Recompensa por completar el nivel
   */
  public rewardForLevelCompletion(followedPath: boolean): number {
    const reward = followedPath ? 100 : 50
    const message = followedPath 
      ? `🏆 ¡Nivel completado siguiendo el sendero! +${reward} maíz bonus`
      : `🏆 ¡Nivel completado! +${reward} maíz bonus`
    
    this.totalMaize += reward
    if (this.onRewardCallback) {
      this.onRewardCallback(reward, 'level', message)
    }

    return reward
  }

  /**
   * Obtiene el total de maíz acumulado
   */
  public getTotalMaize(): number {
    return this.totalMaize
  }

  /**
   * Reinicia el sistema de recompensas
   */
  public reset(): void {
    this.totalMaize = 0
    this.pathBlocksVisited.clear()
  }
}

