import type Phaser from 'phaser'

interface TreeData {
  graphics: Phaser.GameObjects.Graphics
  container: Phaser.GameObjects.Container
  shadow: Phaser.GameObjects.Graphics
  leaves: Phaser.GameObjects.Graphics[]
  x: number
  y: number
  crownSize: number
  treeHeight: number
}

export class TreeRenderer {
  private treesData: TreeData[] = []
  private leafParticles: Phaser.GameObjects.Graphics[] = []

  constructor(
    private scene: Phaser.Scene,
    private width: number,
    private horizonY: number
  ) {}

  /**
   * Renderiza los árboles en las faldas de las montañas, agrupados en pequeños bosques
   */
  public render(isOverLake?: (x: number, y: number) => boolean): Phaser.GameObjects.Graphics[] {
    const trees: Phaser.GameObjects.Graphics[] = []
    this.treesData = []
    this.leafParticles = []
    
    // Calcular posiciones de las bases de las montañas cercanas
    const mountainBaseY = this.horizonY
    const mountainPoints = 10
    const mountainVariation = 30
    const seed = mountainBaseY * 0.1
    
    // Zonas de poblados a evitar (con margen de seguridad)
    const village1Center = this.width / 2 // Poblado central
    const village1Radius = 120 // Radio del poblado central + margen
    
    // Función para verificar si una posición está demasiado cerca de un poblado
    const isTooCloseToVillage = (x: number): boolean => {
      const distToVillage1 = Math.abs(x - village1Center)
      return distToVillage1 < village1Radius
    }
    
    // Crear grupos de bosques pequeños dispersos
    // Definir posiciones de grupos de bosques (centros de cada bosquecito)
    const forestGroups: number[] = []
    const numForestGroups = 7 // 7 grupos de bosques pequeños (aumentado para compensar el segundo poblado)
    
    // Generar posiciones de grupos evitando poblados
    for (let g = 0; g < numForestGroups; g++) {
      let groupX: number
      let attempts = 0
      do {
        // Distribuir grupos a lo largo del ancho, incluyendo el área donde estaba el segundo poblado
        groupX = this.width * (0.15 + Math.random() * 0.7) // Entre 15% y 85% del ancho
        attempts++
      } while (attempts < 50 && isTooCloseToVillage(groupX))
      
      if (!isTooCloseToVillage(groupX)) {
        forestGroups.push(groupX)
      }
    }
    
    // Agregar un grupo adicional en el área donde estaba el segundo poblado (75% del ancho)
    const secondVillageAreaX = this.width * 0.75
    if (!isTooCloseToVillage(secondVillageAreaX)) {
      forestGroups.push(secondVillageAreaX)
    }
    
    // Crear árboles agrupados en cada bosquecito
    let totalTrees = 0
    const maxTrees = 40 // Aumentado para compensar el segundo poblado eliminado
    
    for (const groupCenterX of forestGroups) {
      if (totalTrees >= maxTrees) break
      
      // Cada grupo tiene un número variable de árboles (5-8)
      const treesPerGroup = 5 + Math.floor(Math.random() * 4)
      const treesInThisGroup = Math.min(treesPerGroup, maxTrees - totalTrees)
      
      for (let i = 0; i < treesInThisGroup; i++) {
        // Agrupar árboles alrededor del centro del grupo
        const groupSpread = 45 + Math.random() * 25 // Radio del grupo: 45-70 píxeles
        const angle = (Math.random() * Math.PI * 2) // Ángulo aleatorio
        const distance = Math.random() * groupSpread // Distancia del centro
        const treeX = groupCenterX + Math.cos(angle) * distance
        
        // Asegurar que el árbol no esté fuera de los límites
        if (treeX < 0 || treeX > this.width) continue
        if (isTooCloseToVillage(treeX)) continue
        
        // Calcular la posición Y en la base de la montaña más cercana
        const mountainIndex = Math.floor((treeX / this.width) * mountainPoints)
        const varAmount = Math.sin(mountainIndex * 0.5 + seed) * mountainVariation + 
                         Math.cos(mountainIndex * 0.3 + seed * 0.7) * (mountainVariation * 0.6) +
                         Math.sin(mountainIndex * 1.2 + seed * 1.3) * (mountainVariation * 0.4)
        const mountainBaseYAtX = mountainBaseY + varAmount
        
        // Colocar árbol en la falda de la montaña (más arriba en la ladera)
        const treeY = mountainBaseYAtX - 15 + Math.random() * 20
        
        // Verificar si está sobre el lago
        if (isOverLake && isOverLake(treeX, treeY)) continue
        
        const treeHeight = 40 + Math.random() * 50
        const trunkWidth = 8 + Math.random() * 6
        const crownSize = 25 + Math.random() * 30
        const treeType = Math.random() // Variación en el tipo de árbol
        
        const treeGraphics = this.scene.add.graphics()
        
        // Tronco más orgánico con forma ligeramente cónica
        const trunkTopWidth = trunkWidth * 0.7
        const trunkBottomWidth = trunkWidth
        
        // Base del tronco (más ancha)
        treeGraphics.fillStyle(0x5C4033, 1) // Marrón oscuro base
        treeGraphics.fillRect(-trunkBottomWidth / 2, treeHeight * 0.7, trunkBottomWidth, treeHeight * 0.3)
        
        // Cuerpo principal del tronco (más estrecho arriba)
        treeGraphics.beginPath()
        treeGraphics.moveTo(-trunkBottomWidth / 2, treeHeight * 0.7)
        treeGraphics.lineTo(-trunkTopWidth / 2, 0)
        treeGraphics.lineTo(trunkTopWidth / 2, 0)
        treeGraphics.lineTo(trunkBottomWidth / 2, treeHeight * 0.7)
        treeGraphics.closePath()
        treeGraphics.fillPath()
        
        // Textura del tronco con grietas verticales
        treeGraphics.fillStyle(0x3D2817, 0.6)
        treeGraphics.fillRect(-trunkWidth / 2 + 1, treeHeight * 0.1, trunkWidth * 0.25, treeHeight * 0.6)
        treeGraphics.fillRect(trunkWidth / 2 - trunkWidth * 0.25, treeHeight * 0.2, trunkWidth * 0.25, treeHeight * 0.5)
        
        // Nudos en el tronco
        const knotY = treeHeight * 0.3 + Math.random() * treeHeight * 0.3
        treeGraphics.fillStyle(0x2A1A0F, 0.8)
        treeGraphics.fillCircle(0, knotY, trunkWidth * 0.3)
        
        // Sombra lateral del tronco (iluminación desde la izquierda)
        treeGraphics.fillStyle(0x4A3428, 0.5)
        treeGraphics.beginPath()
        treeGraphics.moveTo(-trunkBottomWidth / 2, treeHeight * 0.7)
        treeGraphics.lineTo(-trunkTopWidth / 2, 0)
        treeGraphics.lineTo(-trunkTopWidth / 2 + trunkWidth * 0.2, 0)
        treeGraphics.lineTo(-trunkBottomWidth / 2 + trunkWidth * 0.2, treeHeight * 0.7)
        treeGraphics.closePath()
        treeGraphics.fillPath()
        
        // Ramas principales visibles (solo para árboles más grandes)
        if (treeHeight > 60) {
          const branchY = -treeHeight * 0.1
          treeGraphics.fillStyle(0x4A3428, 1)
          // Rama izquierda
          treeGraphics.fillRect(-trunkTopWidth / 2 - 3, branchY, 8, 3)
          // Rama derecha
          treeGraphics.fillRect(trunkTopWidth / 2 - 5, branchY - 5, 8, 3)
        }
        
        // Copa del árbol mejorada con más capas y variación
        const crownBaseY = -treeHeight * 0.15
        
        // Capa base de la copa (más grande y oscura)
        treeGraphics.fillStyle(0x1B3D1B, 0.95)
        treeGraphics.fillCircle(0, crownBaseY, crownSize)
        
        // Capas superiores de la copa (creando volumen)
        if (treeType > 0.3) {
          // Estilo más frondoso
          treeGraphics.fillCircle(crownSize * 0.5, crownBaseY - crownSize * 0.2, crownSize * 0.85)
          treeGraphics.fillCircle(-crownSize * 0.5, crownBaseY - crownSize * 0.2, crownSize * 0.85)
          treeGraphics.fillCircle(0, crownBaseY - crownSize * 0.5, crownSize * 0.75)
          
          // Capa adicional para más densidad
          treeGraphics.fillStyle(0x2A4A2A, 0.8)
          treeGraphics.fillCircle(crownSize * 0.3, crownBaseY - crownSize * 0.3, crownSize * 0.65)
          treeGraphics.fillCircle(-crownSize * 0.3, crownBaseY - crownSize * 0.3, crownSize * 0.65)
          treeGraphics.fillCircle(0, crownBaseY - crownSize * 0.4, crownSize * 0.6)
        } else {
          // Estilo más cónico/piramidal
          treeGraphics.fillCircle(0, crownBaseY - crownSize * 0.3, crownSize * 0.9)
          treeGraphics.fillCircle(0, crownBaseY - crownSize * 0.6, crownSize * 0.7)
          treeGraphics.fillCircle(0, crownBaseY - crownSize * 0.85, crownSize * 0.5)
          
          treeGraphics.fillStyle(0x2A4A2A, 0.8)
          treeGraphics.fillCircle(0, crownBaseY - crownSize * 0.35, crownSize * 0.7)
          treeGraphics.fillCircle(0, crownBaseY - crownSize * 0.65, crownSize * 0.55)
        }
        
        // Detalles de sombra en la copa (lado izquierdo más oscuro)
        treeGraphics.fillStyle(0x0F2A0F, 0.7)
        treeGraphics.fillCircle(-crownSize * 0.3, crownBaseY - crownSize * 0.1, crownSize * 0.6)
        treeGraphics.fillCircle(-crownSize * 0.2, crownBaseY - crownSize * 0.4, crownSize * 0.5)
        
        // Puntos de luz en la copa (lado derecho más claro - efecto de iluminación)
        treeGraphics.fillStyle(0x2D5A2D, 0.5)
        treeGraphics.fillCircle(crownSize * 0.3, crownBaseY - crownSize * 0.2, crownSize * 0.4)
        treeGraphics.fillCircle(crownSize * 0.25, crownBaseY - crownSize * 0.5, crownSize * 0.35)
        
        // Detalles de textura en la copa (pequeños círculos para simular hojas)
        treeGraphics.fillStyle(0x1B3D1B, 0.6)
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2
          const dist = crownSize * (0.4 + Math.random() * 0.3)
          const leafX = Math.cos(angle) * dist
          const leafY = crownBaseY + Math.sin(angle) * dist * 0.6
          treeGraphics.fillCircle(leafX, leafY, 3 + Math.random() * 2)
        }
        
        // Crear contenedor para el árbol (permite rotación con origen personalizado)
        const treeContainer = this.scene.add.container(treeX, treeY + treeHeight * 0.7)
        treeContainer.add(treeGraphics)
        treeContainer.setDepth(2)
        
        // Ajustar posición del graphics dentro del contenedor
        treeGraphics.setPosition(0, -treeHeight * 0.7)
        
        trees.push(treeGraphics)
        
        // Crear sombra dinámica del árbol
        const shadowGraphics = this.scene.add.graphics()
        this.drawTreeShadow(shadowGraphics, treeX, treeY, treeHeight, crownSize)
        shadowGraphics.setDepth(1.5) // Detrás del árbol pero visible
        
        // Guardar datos del árbol para animaciones
        const treeData: TreeData = {
          graphics: treeGraphics,
          container: treeContainer,
          shadow: shadowGraphics,
          leaves: [],
          x: treeX,
          y: treeY,
          crownSize: crownSize,
          treeHeight: treeHeight
        }
        this.treesData.push(treeData)
        
        // Añadir animación de balanceo con viento
        this.addWindSwayAnimation(treeContainer, treeData)
        
        // Iniciar sistema de hojas cayendo
        this.startFallingLeaves(treeData)
        
        totalTrees++
      }
    }
    
    // Iniciar animación de sombras dinámicas
    this.startDynamicShadows()
    
    return [...trees, ...this.leafParticles, ...this.treesData.map(t => t.shadow)]
  }

  /**
   * Dibuja la sombra del árbol en el suelo
   */
  private drawTreeShadow(
    shadowGraphics: Phaser.GameObjects.Graphics,
    treeX: number,
    treeY: number,
    treeHeight: number,
    crownSize: number
  ): void {
    // Sombra elíptica en el suelo
    const shadowWidth = crownSize * 1.2
    const shadowHeight = crownSize * 0.6
    const shadowY = treeY + treeHeight * 0.7 // Sombra en la base del árbol
    
    shadowGraphics.fillStyle(0x000000, 0.3)
    shadowGraphics.fillEllipse(0, 0, shadowWidth, shadowHeight)
    
    // Sombra más oscura en el centro
    shadowGraphics.fillStyle(0x000000, 0.2)
    shadowGraphics.fillEllipse(0, 0, shadowWidth * 0.6, shadowHeight * 0.6)
    
    shadowGraphics.setPosition(treeX, shadowY)
  }

  /**
   * Añade animación de balanceo con viento al árbol
   */
  private addWindSwayAnimation(
    treeContainer: Phaser.GameObjects.Container,
    _treeData: TreeData
  ): void {
    // El contenedor está posicionado en la base del árbol
    // Para rotar alrededor de la base, ajustamos el origen usando el método del contenedor
    // Nota: setOrigin puede no estar en los tipos pero existe en Phaser 3
    if ('setOrigin' in treeContainer && typeof (treeContainer as any).setOrigin === 'function') {
      (treeContainer as any).setOrigin(0.5, 1)
    }
    
    // Variación aleatoria en la intensidad y velocidad del viento
    const windIntensity = 1.5 + Math.random() * 2 // Grados de rotación
    const windSpeed = 3000 + Math.random() * 2000 // Duración de la animación (3-5 segundos)
    const windDelay = Math.random() * 1000 // Delay inicial aleatorio
    
    // Animación de balanceo suave
    this.scene.tweens.add({
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
  private startFallingLeaves(treeData: TreeData): void {
    // Crear hojas que caen periódicamente
    const leafInterval = 2000 + Math.random() * 3000 // Cada 2-5 segundos
    const numLeavesPerFall = 2 + Math.floor(Math.random() * 3) // 2-4 hojas por caída
    
    const createLeaves = () => {
      for (let i = 0; i < numLeavesPerFall; i++) {
        // Delay aleatorio para cada hoja
        const delay = i * 200 + Math.random() * 300
        
        this.scene.time.delayedCall(delay, () => {
          this.createFallingLeaf(treeData)
        })
      }
      
      // Programar próxima caída de hojas
      this.scene.time.delayedCall(leafInterval, createLeaves)
    }
    
    // Iniciar primera caída después de un delay aleatorio
    this.scene.time.delayedCall(1000 + Math.random() * 2000, createLeaves)
  }

  /**
   * Crea una hoja individual que cae
   */
  private createFallingLeaf(treeData: TreeData): void {
    const leafGraphics = this.scene.add.graphics()
    
    // Posición inicial: desde la copa del árbol
    const startX = treeData.x + (Math.random() - 0.5) * treeData.crownSize * 0.8
    const startY = treeData.y - treeData.treeHeight * 0.15 + (Math.random() - 0.5) * treeData.crownSize * 0.6
    
    // Color de hoja (verde otoñal)
    const leafColors = [0x4A6B3A, 0x5A7B4A, 0x6A8B5A, 0x8B6B4A, 0x9B7B5A] // Verdes y marrones
    const leafColor = leafColors[Math.floor(Math.random() * leafColors.length)]
    
    // Dibujar hoja pequeña
    const leafSize = 2 + Math.random() * 2
    leafGraphics.fillStyle(leafColor, 0.8)
    leafGraphics.fillEllipse(0, 0, leafSize * 2, leafSize)
    
    leafGraphics.setPosition(startX, startY)
    leafGraphics.setDepth(2.1) // Por encima de los árboles
    this.leafParticles.push(leafGraphics)
    
    // Destino: suelo debajo del árbol
    const endX = startX + (Math.random() - 0.5) * 40 // Desviación horizontal
    const endY = treeData.y + treeData.treeHeight * 0.7 + 10 // Suelo
    
    // Animación de caída con rotación y movimiento horizontal
    const fallDuration = 2000 + Math.random() * 1500 // 2-3.5 segundos
    const rotationAmount = (Math.random() - 0.5) * 720 // Rotación completa aleatoria
    
    this.scene.tweens.add({
      targets: leafGraphics,
      x: endX,
      y: endY,
      angle: rotationAmount,
      duration: fallDuration,
      ease: 'Power1',
      onComplete: () => {
        // Desvanecer la hoja al llegar al suelo
        this.scene.tweens.add({
          targets: leafGraphics,
          alpha: 0,
          duration: 500,
          onComplete: () => {
            leafGraphics.destroy()
            const index = this.leafParticles.indexOf(leafGraphics)
            if (index > -1) {
              this.leafParticles.splice(index, 1)
            }
          }
        })
      }
    })
  }

  /**
   * Inicia la animación de sombras dinámicas que cambian con el tiempo
   */
  private startDynamicShadows(): void {
    // Simular cambio de iluminación durante el día
    this.scene.time.addEvent({
      delay: 100, // Actualizar cada 100ms
      callback: () => {
        const time = this.scene.time.now / 1000 // Tiempo en segundos
        const shadowIntensity = 0.2 + Math.sin(time * 0.1) * 0.1 // Variación suave
        
        this.treesData.forEach(treeData => {
          // Actualizar opacidad de la sombra
          treeData.shadow.clear()
          const shadowWidth = treeData.crownSize * 1.2
          const shadowHeight = treeData.crownSize * 0.6
          const shadowY = treeData.y + treeData.treeHeight * 0.7
          
          // Sombra base
          treeData.shadow.fillStyle(0x000000, shadowIntensity)
          treeData.shadow.fillEllipse(0, 0, shadowWidth, shadowHeight)
          
          // Sombra más oscura en el centro
          treeData.shadow.fillStyle(0x000000, shadowIntensity * 0.7)
          treeData.shadow.fillEllipse(0, 0, shadowWidth * 0.6, shadowHeight * 0.6)
          
          treeData.shadow.setPosition(treeData.x, shadowY)
        })
      },
      repeat: -1
    })
  }
}

