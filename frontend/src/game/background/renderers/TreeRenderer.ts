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
        
        // Seleccionar color y forma únicos para este árbol
        const treeIndex = totalTrees
        const treeColor = this.getTreeColor(treeIndex, treeX)
        const treeColorVariations = this.getTreeColorVariations(treeColor)
        const treeShapeType = this.getTreeShapeType(treeIndex, treeX)
        
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
        
        // Dibujar la copa del árbol según su forma única
        this.drawTreeCrown(
          treeGraphics,
          treeShapeType,
          crownSize,
          treeHeight,
          treeColorVariations
        )
        
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
        
        // Guardar el color del árbol para las hojas que caen
        ;(treeData as any).treeColor = treeColor
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
    
    // Color de hoja basado en el color del árbol (con variaciones)
    const treeColor = (treeData as any).treeColor || 0x4A6B3A
    const leafColorVariations = this.getLeafColorVariations(treeColor)
    const leafColor = leafColorVariations[Math.floor(Math.random() * leafColorVariations.length)]
    
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
   * Obtiene el tipo de forma para cada árbol basado en su índice y posición
   */
  private getTreeShapeType(treeIndex: number, treeX: number): number {
    // 8 tipos diferentes de formas
    const shapeSeed = (treeIndex * 11 + treeX * 5.3) % 8
    return Math.floor(shapeSeed)
  }

  /**
   * Dibuja la copa del árbol según su tipo de forma
   */
  private drawTreeCrown(
    treeGraphics: Phaser.GameObjects.Graphics,
    shapeType: number,
    crownSize: number,
    treeHeight: number,
    colorVariations: {
      baseDark: number
      mediumDark: number
      shadowDark: number
      highlightLight: number
    }
  ): void {
    const crownBaseY = -treeHeight * 0.15
    
    switch (shapeType) {
      case 0: // Redondo/frondoso
        this.drawRoundCrown(treeGraphics, crownBaseY, crownSize, colorVariations)
        break
      case 1: // Cónico/piramidal
        this.drawConicalCrown(treeGraphics, crownBaseY, crownSize, colorVariations)
        break
      case 2: // Extendido/ancho
        this.drawWideCrown(treeGraphics, crownBaseY, crownSize, colorVariations)
        break
      case 3: // Delgado/alto
        this.drawTallCrown(treeGraphics, crownBaseY, crownSize, colorVariations)
        break
      case 4: // Irregular/asimétrico
        this.drawAsymmetricCrown(treeGraphics, crownBaseY, crownSize, colorVariations)
        break
      case 5: // Multi-copa
        this.drawMultiCrown(treeGraphics, crownBaseY, crownSize, colorVariations)
        break
      case 6: // Compacto/globular
        this.drawCompactCrown(treeGraphics, crownBaseY, crownSize, colorVariations)
        break
      case 7: // Forma de nube suave
        this.drawCloudCrown(treeGraphics, crownBaseY, crownSize, colorVariations)
        break
    }
  }

  /**
   * Forma redonda/frondosa
   */
  private drawRoundCrown(
    treeGraphics: Phaser.GameObjects.Graphics,
    crownBaseY: number,
    crownSize: number,
    colors: any
  ): void {
    treeGraphics.fillStyle(colors.baseDark, 0.95)
    treeGraphics.fillCircle(0, crownBaseY, crownSize)
    
    treeGraphics.fillCircle(crownSize * 0.5, crownBaseY - crownSize * 0.2, crownSize * 0.85)
    treeGraphics.fillCircle(-crownSize * 0.5, crownBaseY - crownSize * 0.2, crownSize * 0.85)
    treeGraphics.fillCircle(0, crownBaseY - crownSize * 0.5, crownSize * 0.75)
    
    treeGraphics.fillStyle(colors.mediumDark, 0.8)
    treeGraphics.fillCircle(crownSize * 0.3, crownBaseY - crownSize * 0.3, crownSize * 0.65)
    treeGraphics.fillCircle(-crownSize * 0.3, crownBaseY - crownSize * 0.3, crownSize * 0.65)
    
    this.addHighlightsAndShadows(treeGraphics, crownBaseY, crownSize, colors)
  }

  /**
   * Forma cónica/piramidal
   */
  private drawConicalCrown(
    treeGraphics: Phaser.GameObjects.Graphics,
    crownBaseY: number,
    crownSize: number,
    colors: any
  ): void {
    treeGraphics.fillStyle(colors.baseDark, 0.95)
    treeGraphics.fillCircle(0, crownBaseY - crownSize * 0.3, crownSize * 0.9)
    treeGraphics.fillCircle(0, crownBaseY - crownSize * 0.6, crownSize * 0.7)
    treeGraphics.fillCircle(0, crownBaseY - crownSize * 0.85, crownSize * 0.5)
    
    treeGraphics.fillStyle(colors.mediumDark, 0.8)
    treeGraphics.fillCircle(0, crownBaseY - crownSize * 0.35, crownSize * 0.7)
    treeGraphics.fillCircle(0, crownBaseY - crownSize * 0.65, crownSize * 0.55)
    
    this.addHighlightsAndShadows(treeGraphics, crownBaseY, crownSize, colors, true)
  }

  /**
   * Forma extendida/ancha
   */
  private drawWideCrown(
    treeGraphics: Phaser.GameObjects.Graphics,
    crownBaseY: number,
    crownSize: number,
    colors: any
  ): void {
    const widthFactor = 1.4
    treeGraphics.fillStyle(colors.baseDark, 0.95)
    treeGraphics.fillEllipse(0, crownBaseY, crownSize * widthFactor, crownSize * 0.8)
    
    treeGraphics.fillCircle(crownSize * 0.6, crownBaseY - crownSize * 0.15, crownSize * 0.7)
    treeGraphics.fillCircle(-crownSize * 0.6, crownBaseY - crownSize * 0.15, crownSize * 0.7)
    treeGraphics.fillCircle(0, crownBaseY - crownSize * 0.3, crownSize * 0.6)
    
    treeGraphics.fillStyle(colors.mediumDark, 0.8)
    treeGraphics.fillCircle(crownSize * 0.4, crownBaseY - crownSize * 0.2, crownSize * 0.5)
    treeGraphics.fillCircle(-crownSize * 0.4, crownBaseY - crownSize * 0.2, crownSize * 0.5)
    
    this.addHighlightsAndShadows(treeGraphics, crownBaseY, crownSize, colors)
  }

  /**
   * Forma delgada/alta
   */
  private drawTallCrown(
    treeGraphics: Phaser.GameObjects.Graphics,
    crownBaseY: number,
    crownSize: number,
    colors: any
  ): void {
    const heightFactor = 1.3
    treeGraphics.fillStyle(colors.baseDark, 0.95)
    treeGraphics.fillEllipse(0, crownBaseY - crownSize * 0.3, crownSize * 0.7, crownSize * heightFactor)
    
    treeGraphics.fillCircle(0, crownBaseY - crownSize * 0.4, crownSize * 0.75)
    treeGraphics.fillCircle(0, crownBaseY - crownSize * 0.7, crownSize * 0.65)
    treeGraphics.fillCircle(0, crownBaseY - crownSize * 1.0, crownSize * 0.5)
    
    treeGraphics.fillStyle(colors.mediumDark, 0.8)
    treeGraphics.fillCircle(0, crownBaseY - crownSize * 0.5, crownSize * 0.6)
    treeGraphics.fillCircle(0, crownBaseY - crownSize * 0.8, crownSize * 0.5)
    
    this.addHighlightsAndShadows(treeGraphics, crownBaseY, crownSize, colors, true)
  }

  /**
   * Forma irregular/asimétrica
   */
  private drawAsymmetricCrown(
    treeGraphics: Phaser.GameObjects.Graphics,
    crownBaseY: number,
    crownSize: number,
    colors: any
  ): void {
    treeGraphics.fillStyle(colors.baseDark, 0.95)
    // Copa principal desplazada a la derecha
    treeGraphics.fillCircle(crownSize * 0.2, crownBaseY - crownSize * 0.2, crownSize)
    
    // Copas secundarias asimétricas
    treeGraphics.fillCircle(-crownSize * 0.4, crownBaseY - crownSize * 0.1, crownSize * 0.7)
    treeGraphics.fillCircle(crownSize * 0.5, crownBaseY - crownSize * 0.5, crownSize * 0.6)
    treeGraphics.fillCircle(-crownSize * 0.3, crownBaseY - crownSize * 0.4, crownSize * 0.5)
    
    treeGraphics.fillStyle(colors.mediumDark, 0.8)
    treeGraphics.fillCircle(crownSize * 0.1, crownBaseY - crownSize * 0.3, crownSize * 0.65)
    treeGraphics.fillCircle(-crownSize * 0.3, crownBaseY - crownSize * 0.2, crownSize * 0.5)
    
    this.addHighlightsAndShadows(treeGraphics, crownBaseY, crownSize, colors)
  }

  /**
   * Forma multi-copa (múltiples copas)
   */
  private drawMultiCrown(
    treeGraphics: Phaser.GameObjects.Graphics,
    crownBaseY: number,
    crownSize: number,
    colors: any
  ): void {
    treeGraphics.fillStyle(colors.baseDark, 0.95)
    // Copas múltiples en diferentes niveles
    treeGraphics.fillCircle(-crownSize * 0.3, crownBaseY - crownSize * 0.1, crownSize * 0.65)
    treeGraphics.fillCircle(crownSize * 0.3, crownBaseY - crownSize * 0.2, crownSize * 0.7)
    treeGraphics.fillCircle(0, crownBaseY - crownSize * 0.5, crownSize * 0.6)
    treeGraphics.fillCircle(crownSize * 0.25, crownBaseY - crownSize * 0.7, crownSize * 0.5)
    treeGraphics.fillCircle(-crownSize * 0.2, crownBaseY - crownSize * 0.75, crownSize * 0.45)
    
    treeGraphics.fillStyle(colors.mediumDark, 0.8)
    treeGraphics.fillCircle(-crownSize * 0.25, crownBaseY - crownSize * 0.15, crownSize * 0.5)
    treeGraphics.fillCircle(crownSize * 0.25, crownBaseY - crownSize * 0.25, crownSize * 0.55)
    treeGraphics.fillCircle(0, crownBaseY - crownSize * 0.55, crownSize * 0.45)
    
    this.addHighlightsAndShadows(treeGraphics, crownBaseY, crownSize, colors)
  }

  /**
   * Forma compacta/globular
   */
  private drawCompactCrown(
    treeGraphics: Phaser.GameObjects.Graphics,
    crownBaseY: number,
    crownSize: number,
    colors: any
  ): void {
    const compactSize = crownSize * 0.85
    treeGraphics.fillStyle(colors.baseDark, 0.95)
    treeGraphics.fillCircle(0, crownBaseY, compactSize)
    
    treeGraphics.fillCircle(0, crownBaseY - compactSize * 0.2, compactSize * 0.9)
    treeGraphics.fillCircle(compactSize * 0.3, crownBaseY - compactSize * 0.1, compactSize * 0.7)
    treeGraphics.fillCircle(-compactSize * 0.3, crownBaseY - compactSize * 0.1, compactSize * 0.7)
    
    treeGraphics.fillStyle(colors.mediumDark, 0.8)
    treeGraphics.fillCircle(0, crownBaseY - compactSize * 0.15, compactSize * 0.75)
    
    this.addHighlightsAndShadows(treeGraphics, crownBaseY, compactSize, colors)
  }

  /**
   * Forma de nube suave
   */
  private drawCloudCrown(
    treeGraphics: Phaser.GameObjects.Graphics,
    crownBaseY: number,
    crownSize: number,
    colors: any
  ): void {
    treeGraphics.fillStyle(colors.baseDark, 0.95)
    // Múltiples círculos suaves superpuestos
    treeGraphics.fillCircle(0, crownBaseY, crownSize * 0.9)
    treeGraphics.fillCircle(crownSize * 0.4, crownBaseY - crownSize * 0.15, crownSize * 0.75)
    treeGraphics.fillCircle(-crownSize * 0.4, crownBaseY - crownSize * 0.15, crownSize * 0.75)
    treeGraphics.fillCircle(0, crownBaseY - crownSize * 0.35, crownSize * 0.7)
    treeGraphics.fillCircle(crownSize * 0.35, crownBaseY - crownSize * 0.4, crownSize * 0.6)
    treeGraphics.fillCircle(-crownSize * 0.35, crownBaseY - crownSize * 0.4, crownSize * 0.6)
    
    treeGraphics.fillStyle(colors.mediumDark, 0.8)
    treeGraphics.fillCircle(crownSize * 0.25, crownBaseY - crownSize * 0.25, crownSize * 0.5)
    treeGraphics.fillCircle(-crownSize * 0.25, crownBaseY - crownSize * 0.25, crownSize * 0.5)
    
    this.addHighlightsAndShadows(treeGraphics, crownBaseY, crownSize, colors)
  }

  /**
   * Añade resaltes y sombras comunes a todas las formas
   */
  private addHighlightsAndShadows(
    treeGraphics: Phaser.GameObjects.Graphics,
    crownBaseY: number,
    crownSize: number,
    colors: any,
    isConical: boolean = false
  ): void {
    // Sombras
    treeGraphics.fillStyle(colors.shadowDark, 0.7)
    if (isConical) {
      treeGraphics.fillCircle(-crownSize * 0.2, crownBaseY - crownSize * 0.2, crownSize * 0.5)
      treeGraphics.fillCircle(-crownSize * 0.15, crownBaseY - crownSize * 0.5, crownSize * 0.4)
    } else {
      treeGraphics.fillCircle(-crownSize * 0.3, crownBaseY - crownSize * 0.1, crownSize * 0.6)
      treeGraphics.fillCircle(-crownSize * 0.2, crownBaseY - crownSize * 0.4, crownSize * 0.5)
    }
    
    // Resaltes
    treeGraphics.fillStyle(colors.highlightLight, 0.5)
    if (isConical) {
      treeGraphics.fillCircle(crownSize * 0.2, crownBaseY - crownSize * 0.3, crownSize * 0.4)
      treeGraphics.fillCircle(crownSize * 0.15, crownBaseY - crownSize * 0.6, crownSize * 0.3)
    } else {
      treeGraphics.fillCircle(crownSize * 0.3, crownBaseY - crownSize * 0.2, crownSize * 0.4)
      treeGraphics.fillCircle(crownSize * 0.25, crownBaseY - crownSize * 0.5, crownSize * 0.35)
    }
    
    // Detalles de textura (hojas)
    treeGraphics.fillStyle(colors.baseDark, 0.6)
    const numLeaves = isConical ? 6 : 8
    for (let i = 0; i < numLeaves; i++) {
      const angle = (i / numLeaves) * Math.PI * 2
      const dist = crownSize * (0.4 + Math.random() * 0.3)
      const leafX = Math.cos(angle) * dist
      const leafY = crownBaseY + Math.sin(angle) * dist * 0.6
      treeGraphics.fillCircle(leafX, leafY, 3 + Math.random() * 2)
    }
  }

  /**
   * Obtiene un color único para cada árbol basado en su índice y posición
   */
  private getTreeColor(treeIndex: number, treeX: number): number {
    // Paleta de colores vibrantes y variados para los árboles
    const colorPalette = [
      // Verdes naturales
      0x2D5A2D, 0x3D6B3D, 0x4D7B4D, 0x5D8B5D,
      // Verdes esmeralda
      0x2D8B5D, 0x3D9B6D, 0x4DAB7D, 0x5DBB8D,
      // Azules verdes
      0x2D7B8B, 0x3D8B9B, 0x4D9BAB,
      // Púrpuras y magentas
      0x6B4D8B, 0x7B5D9B, 0x8B6DAB,
      // Naranjas y rojos otoñales
      0xAB6B4D, 0xBB7B5D, 0xCB8B6D,
      // Amarillos dorados
      0xAB9B4D, 0xBBAB5D,
      // Azules y turquesas
      0x4D8BAB, 0x5D9BBB, 0x6DABCB,
      // Rosas y magentas
      0xAB6D8B, 0xBB7D9B,
      // Verdes azulados
      0x4D7B8B, 0x5D8B9B, 0x6D9BAB,
    ]
    
    // Usar combinación de índice y posición para seleccionar color
    const colorSeed = (treeIndex * 7 + treeX * 3.7) % colorPalette.length
    return colorPalette[Math.floor(colorSeed)]
  }

  /**
   * Genera variaciones de color para las diferentes capas del árbol
   */
  private getTreeColorVariations(baseColor: number): {
    baseDark: number
    mediumDark: number
    shadowDark: number
    highlightLight: number
  } {
    // Extraer componentes RGB
    const r = (baseColor >> 16) & 0xFF
    const g = (baseColor >> 8) & 0xFF
    const b = baseColor & 0xFF
    
    // Crear variaciones más oscuras y más claras
    const darken = (component: number, factor: number) => Math.max(0, Math.floor(component * factor))
    const lighten = (component: number, factor: number) => Math.min(255, Math.floor(component + (255 - component) * factor))
    
    // Base oscura (80% del color original)
    const baseDark = (darken(r, 0.8) << 16) | (darken(g, 0.8) << 8) | darken(b, 0.8)
    
    // Medio oscuro (85% del color original)
    const mediumDark = (darken(r, 0.85) << 16) | (darken(g, 0.85) << 8) | darken(b, 0.85)
    
    // Sombra muy oscura (60% del color original)
    const shadowDark = (darken(r, 0.6) << 16) | (darken(g, 0.6) << 8) | darken(b, 0.6)
    
    // Resalte claro (120% del color original con saturación)
    const highlightR = lighten(r, 0.3)
    const highlightG = lighten(g, 0.25)
    const highlightB = lighten(b, 0.2)
    const highlightLight = (highlightR << 16) | (highlightG << 8) | highlightB
    
    return {
      baseDark,
      mediumDark,
      shadowDark,
      highlightLight
    }
  }

  /**
   * Genera variaciones de color para las hojas que caen
   */
  private getLeafColorVariations(treeColor: number): number[] {
    const r = (treeColor >> 16) & 0xFF
    const g = (treeColor >> 8) & 0xFF
    const b = treeColor & 0xFF
    
    const variations: number[] = []
    
    // Crear 3-4 variaciones del color base
    for (let i = 0; i < 4; i++) {
      const factor = 0.7 + (i * 0.1) // De 70% a 100%
      const leafR = Math.floor(r * factor)
      const leafG = Math.floor(g * factor)
      const leafB = Math.floor(b * factor)
      variations.push((leafR << 16) | (leafG << 8) | leafB)
    }
    
    return variations
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

