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
   */
  public render(isOverLake?: (x: number, y: number) => boolean): Phaser.GameObjects.Graphics[] {
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
      
      if (mushroomType > 0.4) {
        // Hongo rojo con puntos blancos (Amanita)
        // Tallo
        mushroomGraphics.fillStyle(0xE8D4B0, 1) // Beige claro
        mushroomGraphics.fillRect(-mushroomSize * 0.15, 0, mushroomSize * 0.3, mushroomSize * 0.6)
        
        // Sombrero rojo
        mushroomGraphics.fillStyle(0xD32F2F, 1) // Rojo
        mushroomGraphics.fillEllipse(0, -mushroomSize * 0.1, mushroomSize * 0.8, mushroomSize * 0.5)
        mushroomGraphics.fillCircle(0, -mushroomSize * 0.15, mushroomSize * 0.4)
        
        // Puntos blancos
        mushroomGraphics.fillStyle(0xFFFFFF, 1)
        mushroomGraphics.fillCircle(-mushroomSize * 0.2, -mushroomSize * 0.2, mushroomSize * 0.15)
        mushroomGraphics.fillCircle(mushroomSize * 0.2, -mushroomSize * 0.15, mushroomSize * 0.12)
        mushroomGraphics.fillCircle(0, -mushroomSize * 0.05, mushroomSize * 0.1)
        
        // Detalles del sombrero
        mushroomGraphics.fillStyle(0xB71C1C, 0.6) // Rojo más oscuro para sombra
        mushroomGraphics.fillEllipse(-mushroomSize * 0.1, -mushroomSize * 0.05, mushroomSize * 0.4, mushroomSize * 0.3)
      } else {
        // Hongo marrón pequeño
        // Tallo
        mushroomGraphics.fillStyle(0xD4A574, 1) // Marrón claro
        mushroomGraphics.fillRect(-mushroomSize * 0.12, 0, mushroomSize * 0.24, mushroomSize * 0.5)
        
        // Sombrero marrón
        mushroomGraphics.fillStyle(0x8B4513, 1) // Marrón
        mushroomGraphics.fillEllipse(0, -mushroomSize * 0.08, mushroomSize * 0.7, mushroomSize * 0.4)
        mushroomGraphics.fillCircle(0, -mushroomSize * 0.12, mushroomSize * 0.35)
        
        // Detalles
        mushroomGraphics.fillStyle(0x654321, 0.5) // Marrón oscuro
        mushroomGraphics.fillEllipse(-mushroomSize * 0.08, -mushroomSize * 0.06, mushroomSize * 0.3, mushroomSize * 0.25)
      }
      
      mushroomGraphics.setPosition(mushroomX, mushroomY)
      mushroomGraphics.setDepth(1) // Detrás de otros elementos pero visibles
      elements.push(mushroomGraphics)
    }
    
    // Crear arbustos pequeños
    const numBushes = 18
    for (let i = 0; i < numBushes; i++) {
      let bushX: number
      let attempts = 0
      do {
        bushX = Math.random() * this.width
        attempts++
      } while (attempts < 20 && isTooCloseToVillage(bushX))
      
      if (isTooCloseToVillage(bushX)) continue
      
      const bushY = this.horizonY + 25 + Math.random() * (this.height - this.horizonY - 40)
      
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
}

