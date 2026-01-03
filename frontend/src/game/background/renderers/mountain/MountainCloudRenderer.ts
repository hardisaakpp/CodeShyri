import type Phaser from 'phaser'

export class MountainCloudRenderer {
  /**
   * Dibuja nubes animadas en las cimas de las montañas
   */
  static draw(
    scene: Phaser.Scene,
    width: number,
    baseY: number,
    points: number,
    peakHeight: number,
    cloudColor: number,
    cloudAlpha: number
  ): Phaser.GameObjects.Graphics[] {
    const cloudElements: Phaser.GameObjects.Graphics[] = []
    const seed = baseY * 0.1
    
    for (let i = 0; i < points; i++) {
      const x = (width / points) * i + (width / points) / 2
      const varAmount = Math.sin(i * 0.5 + seed) * 18
      const peakVariation = 0.5 + Math.sin(i * 0.7 + seed) * 0.5
      const currentPeakY = baseY - peakHeight * peakVariation - Math.abs(varAmount) * 2.2
      
      // Solo dibujar nubes en picos altos (reducido probabilidad)
      if (currentPeakY < baseY - peakHeight * 0.4 && Math.random() > 0.75) {
        const cloudY = currentPeakY - 15 - Math.random() * 20
        const cloudBaseX = x + (Math.random() - 0.5) * 30
        
        // Crear nube mejorada como objeto Phaser animable
        const cloudGraphics = scene.add.graphics()
        const cloudSize = 20 + Math.random() * 25
        
        // Capa de sombra (base)
        cloudGraphics.fillStyle(cloudColor, cloudAlpha * 0.4)
        
        // Crear nube con múltiples círculos superpuestos para forma esponjosa mejorada
        const numClouds = 3 + Math.floor(Math.random() * 3)
        const cloudParts: { x: number; y: number; radius: number }[] = []
        
        for (let j = 0; j < numClouds; j++) {
          const cloudX = (Math.random() - 0.5) * cloudSize * 1.2
          const cloudYOffset = (Math.random() - 0.5) * cloudSize * 0.6
          const cloudRadius = cloudSize * (0.6 + Math.random() * 0.4)
          
          cloudParts.push({ x: cloudX, y: cloudYOffset, radius: cloudRadius })
          
          // Sombra base
          cloudGraphics.fillCircle(cloudX, cloudYOffset, cloudRadius)
        }
        
        // Capa principal
        cloudGraphics.fillStyle(cloudColor, cloudAlpha)
        for (const part of cloudParts) {
          cloudGraphics.fillCircle(part.x, part.y, part.radius * 0.95)
          
          // Círculos adicionales para volumen
          const numExtra = 1 + Math.floor(Math.random() * 2)
          for (let k = 0; k < numExtra; k++) {
            const offsetX = part.x + (Math.random() - 0.5) * part.radius * 0.7
            const offsetY = part.y + (Math.random() - 0.5) * part.radius * 0.5
            const extraRadius = part.radius * (0.4 + Math.random() * 0.3)
            cloudGraphics.fillCircle(offsetX, offsetY, extraRadius)
          }
        }
        
        // Resaltes de luz mejorados en las nubes
        cloudGraphics.fillStyle(0xFFFFFF, cloudAlpha * 0.8)
        for (const part of cloudParts) {
          const highlightX = part.x - part.radius * 0.3
          const highlightY = part.y - part.radius * 0.3
          const highlightRadius = part.radius * (0.3 + Math.random() * 0.2)
          cloudGraphics.fillCircle(highlightX, highlightY, highlightRadius)
        }
        
        // Posicionar la nube
        cloudGraphics.setPosition(cloudBaseX, cloudY)
        cloudGraphics.setDepth(2)
        
        // Animación discreta y suave (movimiento horizontal muy lento)
        const moveDistance = 15 + Math.random() * 20 // Distancia pequeña
        const moveSpeed = 8000 + Math.random() * 4000 // Muy lento (8-12 segundos)
        const direction = Math.random() > 0.5 ? 1 : -1
        
        scene.tweens.add({
          targets: cloudGraphics,
          x: cloudBaseX + (moveDistance * direction),
          duration: moveSpeed,
          ease: 'Sine.easeInOut',
          yoyo: true,
          repeat: -1
        })
        
        cloudElements.push(cloudGraphics)
      }
    }
    
    return cloudElements
  }
}

