import type Phaser from 'phaser'

type CommandAction = () => void

export class CommandQueue {
  private queue: CommandAction[] = []
  private isExecuting: boolean = false
  private currentTween: Phaser.Tweens.Tween | null = null
  private delayedCall: Phaser.Time.TimerEvent | null = null
  private scene: Phaser.Scene
  private onQueueComplete?: () => void

  constructor(scene: Phaser.Scene, onQueueComplete?: () => void) {
    this.scene = scene
    this.onQueueComplete = onQueueComplete
  }

  /**
   * Agrega un comando a la cola de ejecución
   */
  public queueCommand(action: CommandAction) {
    this.queue.push(action)
    if (!this.isExecuting) {
      this.processQueue()
    }
  }

  /**
   * Procesa la cola de comandos secuencialmente
   */
  private processQueue() {
    if (this.queue.length === 0) {
      this.isExecuting = false
      // Notificar que la cola está completa
      if (this.onQueueComplete) {
        this.onQueueComplete()
      }
      return
    }

    this.isExecuting = true
    const command = this.queue.shift()
    
    if (command) {
      command()
    }
  }

  /**
   * Marca el comando actual como completado y procesa el siguiente
   */
  public onCommandComplete() {
    this.currentTween = null
    
    // Cancelar cualquier delayedCall anterior si existe
    if (this.delayedCall) {
      this.delayedCall.remove()
      this.delayedCall = null
    }
    
    // Esperar un frame antes de ejecutar el siguiente comando
    this.delayedCall = this.scene.time.delayedCall(50, () => {
      this.delayedCall = null
      this.processQueue()
    })
  }

  /**
   * Crea un tween que se ejecuta de forma secuencial
   */
  public createSequentialTween(
    config: Phaser.Types.Tweens.TweenBuilderConfig
  ): Phaser.Tweens.Tween {
    // Si hay un tween ejecutándose, lo detenemos primero
    if (this.currentTween && this.currentTween.isPlaying()) {
      this.currentTween.stop()
    }

    // Agregar callback onComplete para procesar el siguiente comando
    const originalOnComplete = config.onComplete
    config.onComplete = (tween: Phaser.Tweens.Tween, targets: any[]) => {
      if (originalOnComplete) {
        if (typeof originalOnComplete === 'function') {
          originalOnComplete(tween, targets)
        }
      }
      this.onCommandComplete()
    }

    this.currentTween = this.scene.tweens.add(config)
    return this.currentTween
  }

  /**
   * Limpia la cola de comandos y detiene animaciones actuales
   */
  public clear() {
    this.queue = []
    this.isExecuting = false
    
    // Cancelar tween actual
    if (this.currentTween) {
      this.currentTween.stop()
      this.currentTween.remove()
      this.currentTween = null
    }
    
    // Cancelar delayedCall si existe
    if (this.delayedCall) {
      this.delayedCall.remove()
      this.delayedCall = null
    }
  }

  /**
   * Obtiene el estado de ejecución
   */
  public get isExecutingQueue(): boolean {
    return this.isExecuting
  }
}


