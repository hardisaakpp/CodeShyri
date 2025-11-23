import type Phaser from 'phaser'

export class SmokeRenderer {
  constructor(
    private scene: Phaser.Scene,
    private width: number,
    private horizonY: number
  ) {}

  /**
   * Renderiza humo de chimeneas en el poblado
   */
  public render(_castlePositions?: { x: number; y: number }[]): Phaser.GameObjects.Graphics[] {
    const smokeElements: Phaser.GameObjects.Graphics[] = []
    
    // Calcular posiciones de las bases de las montañas cercanas
    const mountainBaseY = this.horizonY
    const mountainPoints = 10
    const mountainVariation = 30
    const seed = mountainBaseY * 0.1
    
    // Centro del poblado
    const villageCenterX = this.width / 2
    
    // Crear humo para algunas casitas del poblado (no todas)
    const numSmokeSources = 3 + Math.floor(Math.random() * 3) // 3-5 chimeneas con humo
    
    for (let i = 0; i < numSmokeSources; i++) {
      // Seleccionar una posición aleatoria cerca del centro del poblado
      const offsetX = (Math.random() - 0.5) * 120 // Distribución alrededor del centro
      const smokeX = villageCenterX + offsetX
      
      // Calcular la posición Y en la base de la montaña más cercana
      const mountainIndex = Math.floor((smokeX / this.width) * mountainPoints)
      const varAmount = Math.sin(mountainIndex * 0.5 + seed) * mountainVariation + 
                       Math.cos(mountainIndex * 0.3 + seed * 0.7) * (mountainVariation * 0.6) +
                       Math.sin(mountainIndex * 1.2 + seed * 1.3) * (mountainVariation * 0.4)
      const mountainBaseYAtX = mountainBaseY + varAmount
      
      // Posición de la chimenea (en el techo de una casita)
      const chimneyY = mountainBaseYAtX + 15 + Math.random() * 8
      
      const smokeGraphics = this.scene.add.graphics()
      
      // Crear múltiples partículas de humo que ascienden
      const numParticles = 8 + Math.floor(Math.random() * 4) // 8-11 partículas
      
      for (let j = 0; j < numParticles; j++) {
        const particleSize = 4 + Math.random() * 3 // Tamaño de partícula: 4-7 píxeles
        const offsetY = -j * 8 - Math.random() * 5 // Espaciado vertical
        const offsetX = (Math.random() - 0.5) * 6 // Pequeña variación horizontal
        
        // Humo con gradiente de opacidad (más opaco abajo, más transparente arriba)
        const alpha = 0.3 + (j / numParticles) * 0.4 // Aumenta la opacidad hacia arriba
        smokeGraphics.fillStyle(0x8B8B8B, alpha) // Gris humo
        smokeGraphics.fillCircle(offsetX, offsetY, particleSize)
        
        // Capa más clara para dar profundidad
        smokeGraphics.fillStyle(0xB8B8B8, alpha * 0.5)
        smokeGraphics.fillCircle(offsetX * 0.7, offsetY * 0.9, particleSize * 0.6)
      }
      
      smokeGraphics.setPosition(smokeX, chimneyY)
      smokeGraphics.setDepth(2.1) // Por encima de las casitas
      
      // Animación de humo ascendente con movimiento ondulante
      const riseDistance = 40 + Math.random() * 30
      const riseSpeed = 3000 + Math.random() * 2000 // 3-5 segundos
      
      // Animación principal (ascenso)
      this.scene.tweens.add({
        targets: smokeGraphics,
        y: chimneyY - riseDistance,
        alpha: 0,
        duration: riseSpeed,
        ease: 'Power1',
        onComplete: () => {
          // Reiniciar posición y opacidad
          smokeGraphics.setPosition(smokeX, chimneyY)
          smokeGraphics.setAlpha(1)
        },
        repeat: -1
      })
      
      // Animación de movimiento horizontal sutil (ondulación)
      this.scene.tweens.add({
        targets: smokeGraphics,
        x: smokeX + (Math.random() - 0.5) * 15,
        duration: 2000 + Math.random() * 1000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      })
      
      smokeElements.push(smokeGraphics)
    }
    
    return smokeElements
  }
}

