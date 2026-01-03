import type Phaser from 'phaser'

export class LakeRenderer {

  constructor(
    private scene: Phaser.Scene,
    private width: number,
    private horizonY: number
  ) {}

  // Información del lago para que otros renderers la usen
  public lakeInfo: { centerX: number; centerY: number; width: number; height: number } | null = null

  /**
   * Renderiza un lago en las faldas de las montañas
   * @param config Configuración opcional del lago (posición y tamaño). Si no se proporciona, se usa posición aleatoria.
   */
  public render(config?: { centerX?: number; centerY?: number; width?: number; height?: number }): Phaser.GameObjects.Graphics | null {
    let lakeCenterX: number
    let lakeY: number
    let lakeWidth: number
    let lakeHeight: number
    
    // Si hay configuración, usar valores configurados
    if (config && (config.centerX !== undefined || config.centerY !== undefined)) {
      lakeCenterX = config.centerX ?? this.width * 0.2
      lakeY = config.centerY ?? this.horizonY + 400
      lakeWidth = config.width ?? 200
      lakeHeight = config.height ?? 100
    } else {
      // Comportamiento original: posición aleatoria
      // Calcular posiciones de las bases de las montañas cercanas
      const mountainBaseY = this.horizonY
      const mountainPoints = 10
      const mountainVariation = 30
      const seed = mountainBaseY * 0.1
      
      // Posición del lago (en el lado izquierdo del escenario, en las faldas)
      lakeCenterX = this.width * 0.2 // 20% desde la izquierda
      lakeWidth = 180 + Math.random() * 60 // Ancho del lago: 180-240 píxeles
      lakeHeight = 80 + Math.random() * 40 // Alto del lago: 80-120 píxeles
      
      // Calcular la posición Y en la base de la montaña más cercana
      const mountainIndex = Math.floor((lakeCenterX / this.width) * mountainPoints)
      const varAmount = Math.sin(mountainIndex * 0.5 + seed) * mountainVariation + 
                       Math.cos(mountainIndex * 0.3 + seed * 0.7) * (mountainVariation * 0.6) +
                       Math.sin(mountainIndex * 1.2 + seed * 1.3) * (mountainVariation * 0.4)
      const mountainBaseYAtX = mountainBaseY + varAmount
      
      // Colocar lago completamente en el terreno plano, más abajo que la base de la montaña
      // Asegurar que la parte superior del lago no toque la base de la montaña
      // El lago debe estar en el terreno plano, similar a donde están las casitas
      lakeY = mountainBaseYAtX + 30 + Math.random() * 25
    }
    
    // Guardar información del lago para otros renderers
    this.lakeInfo = {
      centerX: lakeCenterX,
      centerY: lakeY,
      width: lakeWidth,
      height: lakeHeight
    }
    
    // Crear forma orgánica del lago usando puntos
    const lakePoints: { x: number; y: number }[] = []
    const numPoints = 16
    
    for (let i = 0; i <= numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2
      const radiusVariation = 0.7 + Math.random() * 0.3 // Variación del radio
      const x = Math.cos(angle) * (lakeWidth / 2) * radiusVariation
      const y = Math.sin(angle) * (lakeHeight / 2) * radiusVariation
      lakePoints.push({ x, y })
    }
    
    // Crear gráfico del lago
    const lakeGraphics = this.scene.add.graphics()
    
    // Agua base (azul verdoso)
    lakeGraphics.fillStyle(0x2E7D8F, 0.9) // Azul verdoso oscuro
    lakeGraphics.beginPath()
    lakeGraphics.moveTo(lakePoints[0].x, lakePoints[0].y)
    for (let i = 1; i < lakePoints.length; i++) {
      lakeGraphics.lineTo(lakePoints[i].x, lakePoints[i].y)
    }
    lakeGraphics.closePath()
    lakeGraphics.fillPath()
    
    // Capa intermedia de agua (más clara)
    lakeGraphics.fillStyle(0x3A8FA5, 0.7) // Azul verdoso medio
    lakeGraphics.beginPath()
    const innerPoints = lakePoints.map(p => ({ x: p.x * 0.85, y: p.y * 0.85 }))
    lakeGraphics.moveTo(innerPoints[0].x, innerPoints[0].y)
    for (let i = 1; i < innerPoints.length; i++) {
      lakeGraphics.lineTo(innerPoints[i].x, innerPoints[i].y)
    }
    lakeGraphics.closePath()
    lakeGraphics.fillPath()
    
    // Reflejos y brillos en el agua
    lakeGraphics.fillStyle(0x5BA8C0, 0.5) // Azul claro
    for (let i = 0; i < 2; i++) { // Reducido a 2 reflejos estáticos
      const reflectionX = (Math.random() - 0.5) * lakeWidth * 0.6
      const reflectionY = (Math.random() - 0.5) * lakeHeight * 0.6
      const reflectionSize = 15 + Math.random() * 20
      lakeGraphics.fillEllipse(reflectionX, reflectionY, reflectionSize, reflectionSize * 0.4)
    }
    
    // Borde del lago (orilla)
    lakeGraphics.lineStyle(3, 0x1B4A4A, 0.8) // Verde azulado oscuro
    lakeGraphics.beginPath()
    lakeGraphics.moveTo(lakePoints[0].x, lakePoints[0].y)
    for (let i = 1; i < lakePoints.length; i++) {
      lakeGraphics.lineTo(lakePoints[i].x, lakePoints[i].y)
    }
    lakeGraphics.closePath()
    lakeGraphics.strokePath()
    
    // Detalles de la orilla (piedras pequeñas)
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2
      const dist = (lakeWidth / 2) * (0.9 + Math.random() * 0.1)
      const stoneX = Math.cos(angle) * dist
      const stoneY = Math.sin(angle) * dist
      const stoneSize = 2 + Math.random() * 3
      lakeGraphics.fillStyle(0x4A5A4A, 0.7) // Gris verdoso
      lakeGraphics.fillCircle(stoneX, stoneY, stoneSize)
    }
    
    lakeGraphics.setPosition(lakeCenterX, lakeY)
    lakeGraphics.setDepth(3) // Por encima de todos los elementos decorativos
    
    // Crear ondas animadas
    this.createAnimatedWaves(lakeCenterX, lakeY, lakeWidth, lakeHeight)
    
    // Crear reflejos animados
    this.createAnimatedReflections(lakeCenterX, lakeY, lakeWidth, lakeHeight)
    
    return lakeGraphics
  }

  /**
   * Crea ondas animadas en la superficie del agua (optimizado: usar tweens en lugar de redibujar)
   */
  private createAnimatedWaves(
    lakeCenterX: number,
    lakeY: number,
    lakeWidth: number,
    lakeHeight: number
  ): void {
    // Reducir número de ondas para mejor rendimiento
    const numWaves = 3 // Reducido de 4 a 3 para mejor FPS
    
    for (let i = 0; i < numWaves; i++) {
      const waveGraphics = this.scene.add.graphics()
      const waveY = (Math.random() - 0.5) * lakeHeight * 0.4
      const waveWidth = lakeWidth * (0.3 + Math.random() * 0.4)
      const waveX = (Math.random() - 0.5) * lakeWidth * 0.3
      
      // Dibujar onda estática una sola vez (sin redibujar)
      waveGraphics.lineStyle(1.5, 0x4A9FB5, 0.4)
      waveGraphics.beginPath()
      
      // Crear forma de onda estática simplificada
      const numPoints = 15 // Reducido de 20 a 15 para menos complejidad
      for (let j = 0; j <= numPoints; j++) {
        const t = j / numPoints
        const x = waveX + t * waveWidth - waveWidth / 2
        // Onda sinusoidal estática (sin animación de fase)
        const wavePhase = t * Math.PI * 4
        const y = waveY + Math.sin(wavePhase) * 2
        
        if (j === 0) {
          waveGraphics.moveTo(x, y)
        } else {
          waveGraphics.lineTo(x, y)
        }
      }
      waveGraphics.strokePath()
      
      waveGraphics.setPosition(lakeCenterX, lakeY)
      waveGraphics.setDepth(3.1)
      
      // Usar tweens para animación en lugar de redibujar constantemente
      // Animación de movimiento horizontal suave
      const moveDistance = waveWidth * 0.3
      this.scene.tweens.add({
        targets: waveGraphics,
        x: lakeCenterX + waveX + moveDistance,
        duration: 4000 + Math.random() * 2000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      })
      
      // Animación de opacidad sutil (efecto de brillo)
      this.scene.tweens.add({
        targets: waveGraphics,
        alpha: { from: 0.3, to: 0.5 },
        duration: 2000 + Math.random() * 1000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 1000
      })
      
      // Animación vertical muy sutil
      this.scene.tweens.add({
        targets: waveGraphics,
        y: lakeY + waveY + (Math.random() - 0.5) * 3,
        duration: 3000 + Math.random() * 2000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      })
    }
  }

  /**
   * Crea reflejos animados en el agua (optimizado: usar tweens en lugar de redibujar)
   */
  private createAnimatedReflections(
    lakeCenterX: number,
    lakeY: number,
    lakeWidth: number,
    lakeHeight: number
  ): void {
    // Reducir número de reflejos para mejor rendimiento
    const numReflections = 1 // Reducido a 1 reflejo animado
    
    for (let i = 0; i < numReflections; i++) {
      const reflectionGraphics = this.scene.add.graphics()
      const startX = (Math.random() - 0.5) * lakeWidth * 0.6
      const startY = (Math.random() - 0.5) * lakeHeight * 0.6
      const reflectionSize = 15 + Math.random() * 20
      
      // Dibujar reflejo estático una sola vez
      reflectionGraphics.fillStyle(0x5BA8C0, 0.4)
      reflectionGraphics.fillEllipse(0, 0, reflectionSize, reflectionSize * 0.4)
      
      reflectionGraphics.setPosition(lakeCenterX + startX, lakeY + startY)
      reflectionGraphics.setDepth(3.2)
      
      // Usar tweens para animación en lugar de redibujar constantemente
      // Animación de movimiento horizontal
      const endX = startX + (Math.random() - 0.5) * lakeWidth * 0.4
      this.scene.tweens.add({
        targets: reflectionGraphics,
        x: lakeCenterX + endX,
        duration: 3000 + Math.random() * 2000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      })
      
      // Animación de movimiento vertical
      const endY = startY + (Math.random() - 0.5) * lakeHeight * 0.3
      this.scene.tweens.add({
        targets: reflectionGraphics,
        y: lakeY + endY,
        duration: 2500 + Math.random() * 1500,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 1000
      })
      
      // Animación de opacidad (parpadeo suave)
      this.scene.tweens.add({
        targets: reflectionGraphics,
        alpha: { from: 0.3, to: 0.5 },
        duration: 2000 + Math.random() * 1000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 500
      })
      
      // Animación de escala (tamaño variado)
      this.scene.tweens.add({
        targets: reflectionGraphics,
        scaleX: { from: 0.9, to: 1.1 },
        scaleY: { from: 0.9, to: 1.1 },
        duration: 1800 + Math.random() * 1200,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 800
      })
    }
  }

  /**
   * Verifica si una posición está dentro del área del lago
   */
  public isOverLake(x: number, y: number): boolean {
    if (!this.lakeInfo) return false
    
    const dx = x - this.lakeInfo.centerX
    const dy = y - this.lakeInfo.centerY
    // Verificar si está dentro del área rectangular del lago (con margen)
    return Math.abs(dx) < (this.lakeInfo.width / 2) + 20 && 
           Math.abs(dy) < (this.lakeInfo.height / 2) + 20
  }
}

