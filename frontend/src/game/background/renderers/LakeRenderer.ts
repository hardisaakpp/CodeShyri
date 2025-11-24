import type Phaser from 'phaser'

interface WaveData {
  graphics: Phaser.GameObjects.Graphics
  offset: number
  speed: number
}

interface ReflectionData {
  graphics: Phaser.GameObjects.Graphics
  x: number
  y: number
  size: number
  speed: number
}

export class LakeRenderer {
  private waveElements: WaveData[] = []
  private reflectionElements: ReflectionData[] = []

  constructor(
    private scene: Phaser.Scene,
    private width: number,
    private horizonY: number
  ) {}

  // Información del lago para que otros renderers la usen
  public lakeInfo: { centerX: number; centerY: number; width: number; height: number } | null = null

  /**
   * Renderiza un lago en las faldas de las montañas
   */
  public render(): Phaser.GameObjects.Graphics | null {
    // Calcular posiciones de las bases de las montañas cercanas
    const mountainBaseY = this.horizonY
    const mountainPoints = 10
    const mountainVariation = 30
    const seed = mountainBaseY * 0.1
    
    // Posición del lago (en el lado izquierdo del escenario, en las faldas)
    const lakeCenterX = this.width * 0.2 // 20% desde la izquierda
    const lakeWidth = 180 + Math.random() * 60 // Ancho del lago: 180-240 píxeles
    const lakeHeight = 80 + Math.random() * 40 // Alto del lago: 80-120 píxeles
    
    // Calcular la posición Y en la base de la montaña más cercana
    const mountainIndex = Math.floor((lakeCenterX / this.width) * mountainPoints)
    const varAmount = Math.sin(mountainIndex * 0.5 + seed) * mountainVariation + 
                     Math.cos(mountainIndex * 0.3 + seed * 0.7) * (mountainVariation * 0.6) +
                     Math.sin(mountainIndex * 1.2 + seed * 1.3) * (mountainVariation * 0.4)
    const mountainBaseYAtX = mountainBaseY + varAmount
    
    // Colocar lago completamente en el terreno plano, más abajo que la base de la montaña
    // Asegurar que la parte superior del lago no toque la base de la montaña
    // El lago debe estar en el terreno plano, similar a donde están las casitas
    const lakeY = mountainBaseYAtX + 30 + Math.random() * 25
    
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
    for (let i = 0; i < 8; i++) {
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
   * Crea ondas animadas en la superficie del agua
   */
  private createAnimatedWaves(
    lakeCenterX: number,
    lakeY: number,
    lakeWidth: number,
    lakeHeight: number
  ): void {
    const numWaves = 6
    
    for (let i = 0; i < numWaves; i++) {
      const waveGraphics = this.scene.add.graphics()
      const waveY = (Math.random() - 0.5) * lakeHeight * 0.4
      const waveWidth = lakeWidth * (0.3 + Math.random() * 0.4)
      const waveX = (Math.random() - 0.5) * lakeWidth * 0.3
      const speed = 0.02 + Math.random() * 0.03 // Velocidad de la onda
      const offset = Math.random() * Math.PI * 2 // Offset inicial aleatorio
      
      const waveData: WaveData = {
        graphics: waveGraphics,
        offset: offset,
        speed: speed
      }
      this.waveElements.push(waveData)
      
      // Función para actualizar la onda
      const updateWave = () => {
        waveGraphics.clear()
        waveGraphics.lineStyle(1.5, 0x4A9FB5, 0.4 + Math.sin(waveData.offset) * 0.1)
        waveGraphics.beginPath()
        
        const numPoints = 30
        for (let j = 0; j <= numPoints; j++) {
          const t = j / numPoints
          const x = waveX + t * waveWidth - waveWidth / 2
          // Onda sinusoidal animada
          const wavePhase = (t * Math.PI * 4) + (waveData.offset * 2)
          const y = waveY + Math.sin(wavePhase) * (2 + Math.sin(waveData.offset * 3) * 1)
          
          if (j === 0) {
            waveGraphics.moveTo(x, y)
          } else {
            waveGraphics.lineTo(x, y)
          }
        }
        waveGraphics.strokePath()
        
        // Actualizar offset para animación
        waveData.offset += waveData.speed
      }
      
      waveGraphics.setPosition(lakeCenterX, lakeY)
      waveGraphics.setDepth(3.1)
      
      // Actualizar onda continuamente
      this.scene.time.addEvent({
        delay: 16, // ~60 FPS
        callback: updateWave,
        repeat: -1
      })
      
      // Inicializar primera renderización
      updateWave()
    }
  }

  /**
   * Crea reflejos animados en el agua
   */
  private createAnimatedReflections(
    lakeCenterX: number,
    lakeY: number,
    lakeWidth: number,
    lakeHeight: number
  ): void {
    const numReflections = 8
    
    for (let i = 0; i < numReflections; i++) {
      const reflectionGraphics = this.scene.add.graphics()
      const reflectionX = (Math.random() - 0.5) * lakeWidth * 0.6
      const reflectionY = (Math.random() - 0.5) * lakeHeight * 0.6
      const reflectionSize = 15 + Math.random() * 20
      const speed = 0.5 + Math.random() * 1.0 // Velocidad de movimiento
      const direction = Math.random() * Math.PI * 2 // Dirección aleatoria
      
      const reflectionData: ReflectionData = {
        graphics: reflectionGraphics,
        x: reflectionX,
        y: reflectionY,
        size: reflectionSize,
        speed: speed
      }
      this.reflectionElements.push(reflectionData)
      
      // Función para actualizar el reflejo
      const updateReflection = () => {
        reflectionGraphics.clear()
        
        // Movimiento suave del reflejo
        reflectionData.x += Math.cos(direction) * reflectionData.speed * 0.1
        reflectionData.y += Math.sin(direction) * reflectionData.speed * 0.1
        
        // Rebotar en los bordes
        if (Math.abs(reflectionData.x) > lakeWidth * 0.3) {
          reflectionData.x = (reflectionData.x > 0 ? 1 : -1) * lakeWidth * 0.3
        }
        if (Math.abs(reflectionData.y) > lakeHeight * 0.3) {
          reflectionData.y = (reflectionData.y > 0 ? 1 : -1) * lakeHeight * 0.3
        }
        
        // Variación de tamaño y opacidad
        const time = this.scene.time.now / 1000
        const sizeVariation = reflectionData.size + Math.sin(time * 2 + i) * 3
        const alpha = 0.4 + Math.sin(time * 1.5 + i) * 0.2
        
        reflectionGraphics.fillStyle(0x5BA8C0, alpha)
        reflectionGraphics.fillEllipse(
          reflectionData.x,
          reflectionData.y,
          sizeVariation,
          sizeVariation * 0.4
        )
      }
      
      reflectionGraphics.setPosition(lakeCenterX, lakeY)
      reflectionGraphics.setDepth(3.2)
      
      // Actualizar reflejo continuamente
      this.scene.time.addEvent({
        delay: 50, // Actualizar cada 50ms
        callback: updateReflection,
        repeat: -1
      })
      
      // Inicializar primera renderización
      updateReflection()
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

