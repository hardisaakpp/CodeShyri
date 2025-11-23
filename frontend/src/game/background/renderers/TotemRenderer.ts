import type Phaser from 'phaser'

export class TotemRenderer {
  constructor(
    private scene: Phaser.Scene,
    private width: number,
    private horizonY: number
  ) {}

  /**
   * Renderiza una estatua de puma inca grande (más grande que un castillo)
   */
  public render(isOverLake?: (x: number, y: number) => boolean): Phaser.GameObjects.Graphics[] {
    const totems: Phaser.GameObjects.Graphics[] = []
    
    // Calcular posiciones de las bases de las montañas cercanas
    const mountainBaseY = this.horizonY
    const mountainPoints = 10
    const mountainVariation = 30
    const seed = mountainBaseY * 0.1
    
    // Centro del poblado
    const villageCenter = this.width / 2
    
    // Crear solo un tótem grande cerca del poblado, del lado izquierdo
    // Colocar a la izquierda del centro del poblado, pero cerca
    const totemX = villageCenter - 80 - Math.random() * 40 // 80-120 píxeles a la izquierda del centro
    
    if (isOverLake && isOverLake(totemX, 0)) {
      return totems // Si está sobre el lago, retornar vacío
    }
    
    // Calcular la posición Y en la base de la montaña más cercana
    const mountainIndex = Math.floor((totemX / this.width) * mountainPoints)
    const varAmount = Math.sin(mountainIndex * 0.5 + seed) * mountainVariation + 
                     Math.cos(mountainIndex * 0.3 + seed * 0.7) * (mountainVariation * 0.6) +
                     Math.sin(mountainIndex * 1.2 + seed * 1.3) * (mountainVariation * 0.4)
    const mountainBaseYAtX = mountainBaseY + varAmount
    
    // Colocar tótem en la base de la montaña
    const totemY = mountainBaseYAtX + 5 + Math.random() * 8
    
    if (isOverLake && isOverLake(totemX, totemY)) {
      return totems
    }
    
    // Estatua de puma grande: más grande que un castillo (castillos son 28-40 píxeles)
    const pumaHeight = 60 + Math.random() * 20 // Altura: 60-80 píxeles
    const pumaWidth = 25 + Math.random() * 10 // Ancho: 25-35 píxeles
      
    const pumaGraphics = this.scene.add.graphics()
    
    // Base de la estatua (plataforma trapezoidal, estilo inca)
    pumaGraphics.fillStyle(0x6B5B4A, 1) // Piedra inca oscura
    pumaGraphics.beginPath()
    pumaGraphics.moveTo(-pumaWidth * 0.6, 0)
    pumaGraphics.lineTo(-pumaWidth * 0.5, -pumaHeight * 0.1)
    pumaGraphics.lineTo(pumaWidth * 0.5, -pumaHeight * 0.1)
    pumaGraphics.lineTo(pumaWidth * 0.6, 0)
    pumaGraphics.closePath()
    pumaGraphics.fillPath()
    
    // Cuerpo del puma (forma ovalada/rectangular)
    pumaGraphics.fillStyle(0x7B6B5A, 1) // Piedra inca
    pumaGraphics.fillEllipse(0, -pumaHeight * 0.35, pumaWidth * 0.5, pumaHeight * 0.4)
    
    // Pecho del puma (más claro)
    pumaGraphics.fillStyle(0x8B7B6A, 0.8) // Piedra inca más clara
    pumaGraphics.fillEllipse(0, -pumaHeight * 0.25, pumaWidth * 0.35, pumaHeight * 0.25)
    
    // Cabeza del puma (redondeada)
    pumaGraphics.fillStyle(0x7B6B5A, 1) // Piedra inca
    pumaGraphics.fillEllipse(0, -pumaHeight * 0.7, pumaWidth * 0.4, pumaHeight * 0.25)
    
    // Orejas del puma (triangulares)
    pumaGraphics.fillStyle(0x6B5B4A, 1) // Piedra inca oscura
    // Oreja izquierda
    pumaGraphics.beginPath()
    pumaGraphics.moveTo(-pumaWidth * 0.25, -pumaHeight * 0.75)
    pumaGraphics.lineTo(-pumaWidth * 0.35, -pumaHeight * 0.85)
    pumaGraphics.lineTo(-pumaWidth * 0.2, -pumaHeight * 0.8)
    pumaGraphics.closePath()
    pumaGraphics.fillPath()
    // Oreja derecha
    pumaGraphics.beginPath()
    pumaGraphics.moveTo(pumaWidth * 0.25, -pumaHeight * 0.75)
    pumaGraphics.lineTo(pumaWidth * 0.35, -pumaHeight * 0.85)
    pumaGraphics.lineTo(pumaWidth * 0.2, -pumaHeight * 0.8)
    pumaGraphics.closePath()
    pumaGraphics.fillPath()
    
    // Patas delanteras
    pumaGraphics.fillStyle(0x6B5B4A, 1) // Piedra inca oscura
    pumaGraphics.fillRect(-pumaWidth * 0.3, -pumaHeight * 0.15, pumaWidth * 0.15, pumaHeight * 0.2)
    pumaGraphics.fillRect(pumaWidth * 0.15, -pumaHeight * 0.15, pumaWidth * 0.15, pumaHeight * 0.2)
    
    // Patas traseras
    pumaGraphics.fillRect(-pumaWidth * 0.4, -pumaHeight * 0.05, pumaWidth * 0.18, pumaHeight * 0.15)
    pumaGraphics.fillRect(pumaWidth * 0.22, -pumaHeight * 0.05, pumaWidth * 0.18, pumaHeight * 0.15)
    
    // Cola del puma (curvada)
    pumaGraphics.fillStyle(0x7B6B5A, 1)
    pumaGraphics.beginPath()
    pumaGraphics.moveTo(pumaWidth * 0.35, -pumaHeight * 0.2)
    pumaGraphics.lineTo(pumaWidth * 0.5, -pumaHeight * 0.1)
    pumaGraphics.lineTo(pumaWidth * 0.45, -pumaHeight * 0.05)
    pumaGraphics.lineTo(pumaWidth * 0.3, -pumaHeight * 0.15)
    pumaGraphics.closePath()
    pumaGraphics.fillPath()
    
    // Ojos del puma (círculos)
    pumaGraphics.fillStyle(0x2A2A2A, 1) // Negro para ojos
    pumaGraphics.fillCircle(-pumaWidth * 0.1, -pumaHeight * 0.72, 2)
    pumaGraphics.fillCircle(pumaWidth * 0.1, -pumaHeight * 0.72, 2)
    
    // Nariz del puma (triángulo pequeño)
    pumaGraphics.fillStyle(0x4A3A2A, 1)
    pumaGraphics.beginPath()
    pumaGraphics.moveTo(0, -pumaHeight * 0.65)
    pumaGraphics.lineTo(-pumaWidth * 0.05, -pumaHeight * 0.68)
    pumaGraphics.lineTo(pumaWidth * 0.05, -pumaHeight * 0.68)
    pumaGraphics.closePath()
    pumaGraphics.fillPath()
    
    // Detalles decorativos incas (líneas geométricas)
    pumaGraphics.lineStyle(2, 0x5A4A3A, 0.8) // Líneas decorativas
    // Línea en el pecho
    pumaGraphics.moveTo(-pumaWidth * 0.15, -pumaHeight * 0.3)
    pumaGraphics.lineTo(pumaWidth * 0.15, -pumaHeight * 0.3)
    pumaGraphics.strokePath()
    
    // Patrones geométricos en el cuerpo (estilo inca)
    pumaGraphics.fillStyle(0x4A3A2A, 0.6)
    pumaGraphics.fillRect(-pumaWidth * 0.2, -pumaHeight * 0.4, pumaWidth * 0.1, 2)
    pumaGraphics.fillRect(pumaWidth * 0.1, -pumaHeight * 0.4, pumaWidth * 0.1, 2)
    
    // Sombra de la estatua
    pumaGraphics.fillStyle(0x5A4A3A, 0.6)
    pumaGraphics.fillEllipse(0, 0, pumaWidth * 0.7, 4)
    
    // Resaltes en la estatua
    pumaGraphics.fillStyle(0x9B8B7A, 0.4)
    pumaGraphics.fillEllipse(-pumaWidth * 0.15, -pumaHeight * 0.5, pumaWidth * 0.2, pumaHeight * 0.15)
    
    pumaGraphics.setPosition(totemX, totemY)
    pumaGraphics.setDepth(1.9) // Detrás de los castillos (castillos tienen depth 2)
    totems.push(pumaGraphics)
    
    return totems
  }
}

