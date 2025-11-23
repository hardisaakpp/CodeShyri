import type Phaser from 'phaser'

type CommandAction = () => void

export class CommandQueue {
  private queue: CommandAction[] = []
  private isExecuting: boolean = false
  private currentTween: Phaser.Tweens.Tween | null = null
  private scene: Phaser.Scene

  constructor(scene: Phaser.Scene) {
    this.scene = scene
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
    // Esperar un frame antes de ejecutar el siguiente comando
    this.scene.time.delayedCall(50, () => {
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
    if (this.currentTween) {
      this.currentTween.stop()
      this.currentTween = null
    }
  }

  /**
   * Obtiene el estado de ejecución
   */
  public get isExecutingQueue(): boolean {
    return this.isExecuting
  }
}


