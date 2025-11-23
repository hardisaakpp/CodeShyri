import type Phaser from 'phaser'

export class WaterLilyRenderer {
  constructor(
    private scene: Phaser.Scene
  ) {}

  /**
   * Renderiza lirios acuáticos en el lago
   */
  public render(lakeInfo: { centerX: number; centerY: number; width: number; height: number } | null): Phaser.GameObjects.Graphics[] {
    const lilies: Phaser.GameObjects.Graphics[] = []
    
    if (!lakeInfo) return lilies
    
    // Crear 3-4 lirios acuáticos distribuidos sobre el lago (más sutiles)
    const numLilies = 3 + Math.floor(Math.random() * 2) // 3-4 lirios
    
    for (let i = 0; i < numLilies; i++) {
      // Posición aleatoria dentro del área del lago
      const offsetX = (Math.random() - 0.5) * lakeInfo.width * 0.6
      const offsetY = (Math.random() - 0.5) * lakeInfo.height * 0.6
      const lilyX = lakeInfo.centerX + offsetX
      // Los lirios flotan sobre la superficie del lago
      const lilyY = lakeInfo.centerY + offsetY - 1 // Ligeramente por encima de la superficie
      
      const lilySize = 6 + Math.random() * 4 // Tamaño: 6-10 píxeles (más pequeños y sutiles)
      const petalCount = 5 + Math.floor(Math.random() * 2) // 5-6 pétalos (menos pétalos)
      
      const lilyGraphics = this.scene.add.graphics()
      
      // Hojas del lirio (verde, más sutiles)
      lilyGraphics.fillStyle(0x2D5A2D, 0.4) // Verde hoja oscuro con baja opacidad
      const leafSize = lilySize * 1.2
      lilyGraphics.fillEllipse(0, 2, leafSize, leafSize * 0.5)
      lilyGraphics.fillEllipse(-leafSize * 0.3, 1, leafSize * 0.6, leafSize * 0.4)
      lilyGraphics.fillEllipse(leafSize * 0.3, 1, leafSize * 0.6, leafSize * 0.4)
      
      // Pétalos de la flor (colores más apagados y sutiles)
      const petalColor = Math.random() > 0.5 ? 0xE8E8E8 : 0xF0E0E0 // Blanco/gris muy pálido o rosa muy pálido
      lilyGraphics.fillStyle(petalColor, 0.5) // Opacidad reducida
      
      const angleStep = (Math.PI * 2) / petalCount
      for (let p = 0; p < petalCount; p++) {
        const angle = p * angleStep
        const petalX = Math.cos(angle) * lilySize * 0.5
        const petalY = Math.sin(angle) * lilySize * 0.5
        const petalSize = lilySize * 0.35
        
        // Pétalo en forma de gota (usando fillEllipse)
        lilyGraphics.fillEllipse(petalX, petalY, petalSize, petalSize * 0.5)
      }
      
      // Centro de la flor (más sutil)
      lilyGraphics.fillStyle(0xD4C5A0, 0.5) // Beige/dorado apagado
      lilyGraphics.fillCircle(0, 0, lilySize * 0.2)
      
      // Detalles del centro (más sutiles)
      lilyGraphics.fillStyle(0xC4B590, 0.4) // Beige más oscuro
      lilyGraphics.fillCircle(0, 0, lilySize * 0.12)
      
      // Tallo (verde, bajo el agua, más sutil)
      lilyGraphics.fillStyle(0x1B4A1B, 0.3) // Verde tallo oscuro con baja opacidad
      lilyGraphics.fillRect(-0.8, 0, 1.6, 6)
      
      // Brillo en los pétalos (muy sutil)
      lilyGraphics.fillStyle(0xFFFFFF, 0.15)
      lilyGraphics.fillCircle(-lilySize * 0.15, -lilySize * 0.15, lilySize * 0.1)
      
      lilyGraphics.setPosition(lilyX, lilyY)
      lilyGraphics.setDepth(3.1) // Por encima del lago (lago tiene depth 3)
      lilies.push(lilyGraphics)
    }
    
    return lilies
  }
}

