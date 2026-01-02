import type Phaser from 'phaser'

export class MushroomFlowerRenderer {
  constructor(
    private scene: Phaser.Scene,
    private width: number,
    private height: number,
    private horizonY: number
  ) {}

  /**
   * Renderiza hongos grandes, flores mágicas y arbustos en el terreno
   * @param treePositions Posiciones de los árboles para colocar arbustos cerca de ellos
   */
  public render(isOverLake?: (x: number, y: number) => boolean, treePositions?: Array<{ x: number, y: number }>): Phaser.GameObjects.Graphics[] {
    const elements: Phaser.GameObjects.Graphics[] = []
    
    // Calcular posiciones de las bases de las montañas cercanas
    const mountainBaseY = this.horizonY
    const mountainPoints = 10
    const mountainVariation = 30
    const seed = mountainBaseY * 0.1
    
    // Zonas de poblados a evitar
    const village1Center = this.width / 2
    const village1Radius = 120
    const village2Center = this.width * 0.75
    const village2Radius = 100
    
    const isTooCloseToVillage = (x: number): boolean => {
      const distToVillage1 = Math.abs(x - village1Center)
      const distToVillage2 = Math.abs(x - village2Center)
      return distToVillage1 < village1Radius || distToVillage2 < village2Radius
    }
    
    // Crear hongos grandes en la base de las montañas
    const numMushrooms = 15
    for (let i = 0; i < numMushrooms; i++) {
      let mushroomX: number
      let attempts = 0
      do {
        mushroomX = Math.random() * this.width
        attempts++
      } while (attempts < 20 && isTooCloseToVillage(mushroomX))
      
      if (isTooCloseToVillage(mushroomX)) continue
      
      // Calcular la posición Y en la base de la montaña más cercana
      const mountainIndex = Math.floor((mushroomX / this.width) * mountainPoints)
      const varAmount = Math.sin(mountainIndex * 0.5 + seed) * mountainVariation + 
                       Math.cos(mountainIndex * 0.3 + seed * 0.7) * (mountainVariation * 0.6) +
                       Math.sin(mountainIndex * 1.2 + seed * 1.3) * (mountainVariation * 0.4)
      const mountainBaseYAtX = mountainBaseY + varAmount
      
      // Colocar hongo en la base de la montaña
      const mushroomY = mountainBaseYAtX + 5 + Math.random() * 8
      
      if (isOverLake && isOverLake(mushroomX, mushroomY)) continue
      
      // Hongos más grandes: 15-22 píxeles (similar al tamaño de las casitas)
      const mushroomSize = 15 + Math.random() * 7 // Hongos: 15-22 píxeles
      const mushroomType = Math.random() // Tipo de hongo
      
      const mushroomGraphics = this.scene.add.graphics()
      
      // Aplicar Flat Shaded 3D a los hongos
      if (mushroomType > 0.4) {
        // Hongo rojo con puntos blancos (Amanita) - 3D
        this.drawMushroom3D(
          mushroomGraphics,
          mushroomSize,
          { light: 0xE42F2F, mid: 0xD32F2F, dark: 0xB71C1C }, // Rojo
          { light: 0xF0E0C0, mid: 0xE8D4B0, dark: 0xD0C090 }, // Beige para tallo
          true // Con puntos blancos
        )
      } else {
        // Hongo marrón pequeño - 3D
        this.drawMushroom3D(
          mushroomGraphics,
          mushroomSize,
          { light: 0x9B5533, mid: 0x8B4513, dark: 0x6B3413 }, // Marrón
          { light: 0xE4B584, mid: 0xD4A574, dark: 0xC49564 }, // Marrón claro para tallo
          false // Sin puntos
        )
      }
      
      mushroomGraphics.setPosition(mushroomX, mushroomY)
      mushroomGraphics.setDepth(1) // Detrás de otros elementos pero visibles
      elements.push(mushroomGraphics)
    }
    
    // Crear arbustos pequeños (colocados junto a los árboles si hay árboles)
    const numBushes = 10
    for (let i = 0; i < numBushes; i++) {
      let bushX: number
      let bushY: number
      
      // Si hay posiciones de árboles, colocar arbustos cerca de ellos
      if (treePositions && treePositions.length > 0 && Math.random() > 0.3) {
        // 70% de los arbustos se colocan cerca de árboles
        const randomTree = treePositions[Math.floor(Math.random() * treePositions.length)]
        // Colocar arbusto a una distancia aleatoria entre 20-60 píxeles del árbol
        const angle = Math.random() * Math.PI * 2
        const distance = 20 + Math.random() * 40
        bushX = randomTree.x + Math.cos(angle) * distance
        bushY = randomTree.y + Math.sin(angle) * distance + 10 // Ligeramente más abajo
        
        // Asegurar que el arbusto esté en los límites
        if (bushX < 0 || bushX > this.width) {
          bushX = Math.random() * this.width
        }
        if (bushY < this.horizonY || bushY > this.height) {
          bushY = this.horizonY + 25 + Math.random() * (this.height - this.horizonY - 40)
        }
        
        let attempts = 0
        while (attempts < 20 && isTooCloseToVillage(bushX)) {
          bushX = Math.random() * this.width
          attempts++
        }
      } else {
        // 30% de los arbustos se colocan aleatoriamente
        let attempts = 0
        do {
          bushX = Math.random() * this.width
          attempts++
        } while (attempts < 20 && isTooCloseToVillage(bushX))
        
        bushY = this.horizonY + 25 + Math.random() * (this.height - this.horizonY - 40)
      }
      
      if (isTooCloseToVillage(bushX)) continue
      
      if (isOverLake && isOverLake(bushX, bushY)) continue
      const bushSize = 12 + Math.random() * 8 // Arbustos: 12-20 píxeles
      const bushType = Math.random()
      
      const bushGraphics = this.scene.add.graphics()
      
      if (bushType > 0.5) {
        // Arbusto redondeado verde oscuro
        bushGraphics.fillStyle(0x2D4A2D, 1) // Verde oscuro
        bushGraphics.fillCircle(0, 0, bushSize)
        bushGraphics.fillCircle(bushSize * 0.4, -bushSize * 0.2, bushSize * 0.7)
        bushGraphics.fillCircle(-bushSize * 0.4, -bushSize * 0.2, bushSize * 0.7)
        bushGraphics.fillCircle(0, -bushSize * 0.3, bushSize * 0.6)
        
        // Capa intermedia
        bushGraphics.fillStyle(0x3D5A3D, 0.8) // Verde medio
        bushGraphics.fillCircle(0, -bushSize * 0.1, bushSize * 0.6)
        bushGraphics.fillCircle(bushSize * 0.3, -bushSize * 0.15, bushSize * 0.5)
        bushGraphics.fillCircle(-bushSize * 0.3, -bushSize * 0.15, bushSize * 0.5)
        
        // Resaltes
        bushGraphics.fillStyle(0x4A6A4A, 0.5) // Verde claro
        bushGraphics.fillCircle(bushSize * 0.2, -bushSize * 0.1, bushSize * 0.3)
        bushGraphics.fillCircle(-bushSize * 0.15, -bushSize * 0.12, bushSize * 0.25)
      } else {
        // Arbusto más irregular y frondoso
        bushGraphics.fillStyle(0x1B3D1B, 1) // Verde muy oscuro
        bushGraphics.fillCircle(0, 0, bushSize)
        bushGraphics.fillCircle(bushSize * 0.5, -bushSize * 0.15, bushSize * 0.75)
        bushGraphics.fillCircle(-bushSize * 0.5, -bushSize * 0.15, bushSize * 0.75)
        bushGraphics.fillCircle(bushSize * 0.3, bushSize * 0.1, bushSize * 0.6)
        bushGraphics.fillCircle(-bushSize * 0.3, bushSize * 0.1, bushSize * 0.6)
        bushGraphics.fillCircle(0, -bushSize * 0.35, bushSize * 0.65)
        
        // Capa intermedia
        bushGraphics.fillStyle(0x2A4A2A, 0.75) // Verde oscuro medio
        bushGraphics.fillCircle(0, -bushSize * 0.05, bushSize * 0.65)
        bushGraphics.fillCircle(bushSize * 0.35, -bushSize * 0.1, bushSize * 0.55)
        bushGraphics.fillCircle(-bushSize * 0.35, -bushSize * 0.1, bushSize * 0.55)
        
        // Resaltes
        bushGraphics.fillStyle(0x3D5A3D, 0.4) // Verde medio
        bushGraphics.fillCircle(bushSize * 0.25, -bushSize * 0.08, bushSize * 0.35)
        bushGraphics.fillCircle(-bushSize * 0.2, -bushSize * 0.1, bushSize * 0.3)
      }
      
      bushGraphics.setPosition(bushX, bushY)
      bushGraphics.setDepth(1) // Detrás de otros elementos pero visibles
      elements.push(bushGraphics)
    }
    
    // Crear flores mágicas en la base de las montañas
    const numFlowers = 20
    for (let i = 0; i < numFlowers; i++) {
      let flowerX: number
      let attempts = 0
      do {
        flowerX = Math.random() * this.width
        attempts++
      } while (attempts < 20 && isTooCloseToVillage(flowerX))
      
      if (isTooCloseToVillage(flowerX)) continue
      
      // Calcular la posición Y en la base de la montaña más cercana
      const mountainIndex = Math.floor((flowerX / this.width) * mountainPoints)
      const varAmount = Math.sin(mountainIndex * 0.5 + seed) * mountainVariation + 
                       Math.cos(mountainIndex * 0.3 + seed * 0.7) * (mountainVariation * 0.6) +
                       Math.sin(mountainIndex * 1.2 + seed * 1.3) * (mountainVariation * 0.4)
      const mountainBaseYAtX = mountainBaseY + varAmount
      
      // Colocar flor en la base de la montaña
      const flowerY = mountainBaseYAtX + 5 + Math.random() * 8
      
      if (isOverLake && isOverLake(flowerX, flowerY)) continue
      
      // Tamaño: mitad del tamaño de las casitas (18-28) = 9-14 píxeles
      const flowerSize = 9 + Math.random() * 5 // Flores: 9-14 píxeles
      const flowerType = Math.random()
      
      const flowerGraphics = this.scene.add.graphics()
      
      // Tallo verde
      flowerGraphics.fillStyle(0x4A7C59, 1) // Verde hoja
      flowerGraphics.fillRect(-flowerSize * 0.08, 0, flowerSize * 0.16, flowerSize * 0.4)
      
      if (flowerType > 0.66) {
        // Flor púrpura mágica (3 pétalos)
        flowerGraphics.fillStyle(0x9C27B0, 1) // Púrpura
        const petalSize = flowerSize * 0.3
        flowerGraphics.fillCircle(0, -flowerSize * 0.15, petalSize)
        flowerGraphics.fillCircle(petalSize * 0.8, -flowerSize * 0.1, petalSize * 0.9)
        flowerGraphics.fillCircle(-petalSize * 0.8, -flowerSize * 0.1, petalSize * 0.9)
        
        // Centro brillante
        flowerGraphics.fillStyle(0xFFD700, 0.8) // Dorado
        flowerGraphics.fillCircle(0, -flowerSize * 0.12, flowerSize * 0.15)
        
        // Brillo mágico
        flowerGraphics.fillStyle(0xE1BEE7, 0.4) // Púrpura claro
        flowerGraphics.fillCircle(0, -flowerSize * 0.15, flowerSize * 0.2)
      } else if (flowerType > 0.33) {
        // Flor azul mágica (5 pétalos)
        flowerGraphics.fillStyle(0x2196F3, 1) // Azul
        const petalSize = flowerSize * 0.25
        const angleStep = (Math.PI * 2) / 5
        for (let p = 0; p < 5; p++) {
          const angle = p * angleStep
          const px = Math.cos(angle) * petalSize * 0.6
          const py = -flowerSize * 0.1 + Math.sin(angle) * petalSize * 0.6
          flowerGraphics.fillCircle(px, py, petalSize)
        }
        
        // Centro brillante
        flowerGraphics.fillStyle(0x64B5F6, 0.9) // Azul claro
        flowerGraphics.fillCircle(0, -flowerSize * 0.1, flowerSize * 0.12)
        
        // Brillo mágico
        flowerGraphics.fillStyle(0xBBDEFB, 0.3) // Azul muy claro
        flowerGraphics.fillCircle(0, -flowerSize * 0.1, flowerSize * 0.18)
      } else {
        // Flor rosa mágica (4 pétalos)
        flowerGraphics.fillStyle(0xE91E63, 1) // Rosa
        const petalSize = flowerSize * 0.28
        flowerGraphics.fillCircle(0, -flowerSize * 0.12, petalSize)
        flowerGraphics.fillCircle(petalSize * 0.7, -flowerSize * 0.08, petalSize * 0.85)
        flowerGraphics.fillCircle(-petalSize * 0.7, -flowerSize * 0.08, petalSize * 0.85)
        flowerGraphics.fillCircle(0, -flowerSize * 0.04, petalSize * 0.9)
        
        // Centro brillante
        flowerGraphics.fillStyle(0xFFC1CC, 0.9) // Rosa claro
        flowerGraphics.fillCircle(0, -flowerSize * 0.08, flowerSize * 0.13)
        
        // Brillo mágico
        flowerGraphics.fillStyle(0xF8BBD0, 0.35) // Rosa muy claro
        flowerGraphics.fillCircle(0, -flowerSize * 0.1, flowerSize * 0.2)
      }
      
      flowerGraphics.setPosition(flowerX, flowerY)
      flowerGraphics.setDepth(1) // Detrás de otros elementos pero visibles
      elements.push(flowerGraphics)
    }
    
    return elements
  }

  /**
   * Dibuja un hongo con Flat Shaded 3D
   */
  private drawMushroom3D(
    graphics: Phaser.GameObjects.Graphics,
    size: number,
    capColors: { light: number; mid: number; dark: number },
    stemColors: { light: number; mid: number; dark: number },
    hasDots: boolean
  ): void {
    const depth = size * 0.1 // Profundidad 3D
    
    // TALLO 3D
    const stemWidth = size * 0.3
    const stemHeight = size * 0.6
    
    // Tallo - cara frontal (iluminada)
    graphics.fillStyle(stemColors.light, 1)
    graphics.fillRect(-stemWidth / 2, 0, stemWidth, stemHeight)
    
    // Tallo - cara derecha (muy iluminada)
    graphics.fillStyle(stemColors.light, 1)
    graphics.beginPath()
    graphics.moveTo(stemWidth / 2, 0)
    graphics.lineTo(stemWidth / 2 + depth, -depth * 0.2)
    graphics.lineTo(stemWidth / 2 + depth, stemHeight + depth * 0.2)
    graphics.lineTo(stemWidth / 2, stemHeight)
    graphics.closePath()
    graphics.fillPath()
    
    // Tallo - cara izquierda (en sombra)
    graphics.fillStyle(stemColors.dark, 1)
    graphics.beginPath()
    graphics.moveTo(-stemWidth / 2, 0)
    graphics.lineTo(-stemWidth / 2 - depth, -depth * 0.2)
    graphics.lineTo(-stemWidth / 2 - depth, stemHeight + depth * 0.2)
    graphics.lineTo(-stemWidth / 2, stemHeight)
    graphics.closePath()
    graphics.fillPath()
    
    // SOMBRERO 3D
    const capWidth = size * 0.8
    const capHeight = size * 0.5
    const capY = -size * 0.1
    
    // Sombrero - cara frontal (iluminada)
    graphics.fillStyle(capColors.light, 1)
    graphics.fillEllipse(depth * 0.2, capY - depth * 0.1, capWidth, capHeight)
    graphics.fillCircle(depth * 0.2, capY - size * 0.05 - depth * 0.1, size * 0.4)
    
    // Sombrero - cara superior (muy iluminada)
    graphics.fillStyle(capColors.light, 1)
    graphics.fillEllipse(depth * 0.3, capY - size * 0.1 - depth, capWidth * 0.85, capHeight * 0.9)
    
    // Sombrero - cara izquierda (en sombra)
    graphics.fillStyle(capColors.dark, 1)
    graphics.fillEllipse(-depth * 0.3, capY + depth * 0.1, capWidth * 0.8, capHeight * 0.85)
    
    // Sombrero - cara base (debajo del sombrero)
    graphics.fillStyle(capColors.mid, 0.7)
    graphics.fillEllipse(0, capY, capWidth * 0.95, capHeight * 0.4)
    
    // Puntos blancos (solo para Amanita) - con efecto 3D
    if (hasDots) {
      graphics.fillStyle(0xFFFFFF, 1)
      // Punto frontal (iluminado)
      graphics.fillCircle(-size * 0.15 + depth * 0.2, capY - size * 0.15, size * 0.15)
      // Punto derecho (muy iluminado)
      graphics.fillStyle(0xFFFFFF, 0.95)
      graphics.fillCircle(size * 0.15 + depth * 0.3, capY - size * 0.12, size * 0.12)
      // Punto izquierdo (en sombra)
      graphics.fillStyle(0xEEEEEE, 0.85)
      graphics.fillCircle(0, capY - size * 0.02 - depth * 0.1, size * 0.1)
    }
  }
}

