import type Phaser from 'phaser'
import type { TreeData } from './TreeTypes'
import { TreeColorGenerator } from './TreeColorGenerator'

export class TreeAnimations {
  // Pool de hojas reutilizables para optimizar rendimiento
  private static leafPool: Phaser.GameObjects.Graphics[] = []
  private static readonly MAX_LEAVES_ON_SCREEN = 8 // Reducido de 15 a 8 para mejor FPS
  private static activeLeavesCount = 0

  /**
   * Obtiene una hoja del pool o crea una nueva
   */
  private static getLeafFromPool(scene: Phaser.Scene): Phaser.GameObjects.Graphics {
    let leaf: Phaser.GameObjects.Graphics | undefined
    
    // Buscar hoja disponible en el pool
    leaf = this.leafPool.find(l => !l.active)
    
    if (!leaf) {
      // Crear nueva hoja si el pool está lleno o no hay disponibles
      leaf = scene.add.graphics()
      this.leafPool.push(leaf)
    }
    
    leaf.setActive(true)
    leaf.setVisible(true)
    leaf.setAlpha(1)
    leaf.clear()
    
    return leaf
  }

  /**
   * Devuelve una hoja al pool
   */
  private static returnLeafToPool(leaf: Phaser.GameObjects.Graphics): void {
    leaf.setActive(false)
    leaf.setVisible(false)
    leaf.clear()
    this.activeLeavesCount = Math.max(0, this.activeLeavesCount - 1)
  }

  /**
   * Añade animación de balanceo con viento al árbol
   */
  static addWindSway(
    scene: Phaser.Scene,
    treeContainer: Phaser.GameObjects.Container
  ): void {
    // El contenedor está posicionado en la base del árbol
    // Para rotar alrededor de la base, ajustamos el origen
    if ('setOrigin' in treeContainer && typeof (treeContainer as any).setOrigin === 'function') {
      (treeContainer as any).setOrigin(0.5, 1)
    }
    
    // Variación aleatoria en la intensidad y velocidad del viento
    const windIntensity = 1.5 + Math.random() * 2 // Grados de rotación
    const windSpeed = 3000 + Math.random() * 2000 // Duración de la animación (3-5 segundos)
    const windDelay = Math.random() * 1000 // Delay inicial aleatorio
    
    // Animación de balanceo suave
    scene.tweens.add({
      targets: treeContainer,
      angle: windIntensity,
      duration: windSpeed,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
      delay: windDelay
    })
  }

  /**
   * Inicia el sistema de hojas cayendo desde el árbol
   */
  static startFallingLeaves(
    scene: Phaser.Scene,
    treeData: TreeData,
    leafParticles: Phaser.GameObjects.Graphics[]
  ): void {
    // Crear hojas que caen periódicamente (intervalos aumentados para mejor rendimiento)
    const leafInterval = 4000 + Math.random() * 4000 // Cada 4-8 segundos (aumentado de 2-5)
    const numLeavesPerFall = 1 + Math.floor(Math.random() * 2) // 1-2 hojas por caída (reducido de 2-4)
    
    const createLeaves = () => {
      for (let i = 0; i < numLeavesPerFall; i++) {
        // Delay aleatorio para cada hoja
        const delay = i * 200 + Math.random() * 300
        
        scene.time.delayedCall(delay, () => {
          this.createFallingLeaf(scene, treeData, leafParticles)
        })
      }
      
      // Programar próxima caída de hojas
      scene.time.delayedCall(leafInterval, createLeaves)
    }
    
    // Iniciar primera caída después de un delay aleatorio
    scene.time.delayedCall(1000 + Math.random() * 2000, createLeaves)
  }

  /**
   * Crea una hoja individual que cae (usando pooling para optimizar)
   */
  private static createFallingLeaf(
    scene: Phaser.Scene,
    treeData: TreeData,
    leafParticles: Phaser.GameObjects.Graphics[]
  ): void {
    // Limitar número de hojas activas en pantalla
    if (this.activeLeavesCount >= this.MAX_LEAVES_ON_SCREEN) {
      return
    }
    
    const leafGraphics = this.getLeafFromPool(scene)
    this.activeLeavesCount++
    
    // Posición inicial: desde la copa del árbol
    const startX = treeData.x + (Math.random() - 0.5) * treeData.crownSize * 0.8
    const startY = treeData.y - treeData.treeHeight * 0.15 + (Math.random() - 0.5) * treeData.crownSize * 0.6
    
    // Color de hoja basado en el color del árbol (con variaciones)
    const treeColor = treeData.treeColor || 0x4A6B3A
    const leafColorVariations = TreeColorGenerator.getLeafColorVariations(treeColor)
    const leafColor = leafColorVariations[Math.floor(Math.random() * leafColorVariations.length)]
    
    // Dibujar hoja pequeña
    const leafSize = 2 + Math.random() * 2
    leafGraphics.fillStyle(leafColor, 0.8)
    leafGraphics.fillEllipse(0, 0, leafSize * 2, leafSize)
    
    leafGraphics.setPosition(startX, startY)
    leafGraphics.setDepth(2.1) // Por encima de los árboles
    
    // Agregar a la lista solo si no está ya
    if (!leafParticles.includes(leafGraphics)) {
      leafParticles.push(leafGraphics)
    }
    
    // Destino: suelo debajo del árbol
    const endX = startX + (Math.random() - 0.5) * 40 // Desviación horizontal
    const endY = treeData.y + treeData.treeHeight * 0.7 + 10 // Suelo
    
    // Animación de caída con rotación y movimiento horizontal
    const fallDuration = 2000 + Math.random() * 1500 // 2-3.5 segundos
    const rotationAmount = (Math.random() - 0.5) * 720 // Rotación completa aleatoria
    
    scene.tweens.add({
      targets: leafGraphics,
      x: endX,
      y: endY,
      angle: rotationAmount,
      duration: fallDuration,
      ease: 'Power1',
      onComplete: () => {
        // Desvanecer la hoja al llegar al suelo
        scene.tweens.add({
          targets: leafGraphics,
          alpha: 0,
          duration: 500,
          onComplete: () => {
            // Devolver al pool en lugar de destruir
            this.returnLeafToPool(leafGraphics)
            const index = leafParticles.indexOf(leafGraphics)
            if (index > -1) {
              leafParticles.splice(index, 1)
            }
          }
        })
      }
    })
  }

  /**
   * Inicia la animación de sombras estáticas con variación suave de opacidad
   * Optimizado: usa animación de alpha en lugar de redibujar constantemente
   */
  static startDynamicShadows(
    scene: Phaser.Scene,
    treesData: TreeData[]
  ): void {
    // Dibujar sombras estáticas una sola vez
    treesData.forEach(treeData => {
      const shadowWidth = treeData.crownSize * 1.2
      const shadowHeight = treeData.crownSize * 0.6
      const shadowY = treeData.y + treeData.treeHeight * 0.7
      
      // Sombra base estática
      treeData.shadow.fillStyle(0x000000, 0.25)
      treeData.shadow.fillEllipse(0, 0, shadowWidth, shadowHeight)
      
      // Sombra más oscura en el centro
      treeData.shadow.fillStyle(0x000000, 0.18)
      treeData.shadow.fillEllipse(0, 0, shadowWidth * 0.6, shadowHeight * 0.6)
      
      treeData.shadow.setPosition(treeData.x, shadowY)
      
      // Animación suave de opacidad (más eficiente que redibujar)
      const baseAlpha = 0.25 + Math.random() * 0.1
      scene.tweens.add({
        targets: treeData.shadow,
        alpha: { from: baseAlpha * 0.7, to: baseAlpha * 1.3 },
        duration: 3000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      })
    })
  }
}

