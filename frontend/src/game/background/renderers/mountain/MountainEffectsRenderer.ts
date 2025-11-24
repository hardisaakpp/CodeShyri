import type Phaser from 'phaser'

export class MountainEffectsRenderer {
  /**
   * Renderiza niebla atmosférica entre capas de montañas
   */
  static renderAtmosphericFog(
    graphics: Phaser.GameObjects.Graphics,
    width: number,
    horizonY: number
  ): void {
    // Niebla entre montañas lejanas y medias
    graphics.fillStyle(0xFFFFFF, 0.08)
    graphics.fillRect(0, horizonY - 20, width, 12)
    
    // Niebla entre montañas medias y cercanas
    graphics.fillStyle(0xFFFFFF, 0.06)
    graphics.fillRect(0, horizonY - 3, width, 8)
    
    // Efecto de desvanecimiento suave
    for (let i = 0; i < 2; i++) {
      const fogY = horizonY - 12 + i * 8
      const alpha = 0.05 - i * 0.015
      graphics.fillStyle(0xE8E8E8, alpha)
      graphics.fillRect(0, fogY, width, 4)
    }
  }

  /**
   * Dibuja gradientes de luz en las montañas
   */
  static drawGradient(
    graphics: Phaser.GameObjects.Graphics,
    width: number,
    baseY: number,
    points: number,
    peakHeight: number,
    side: 'left' | 'right' | 'top'
  ): void {
    const seed = baseY * 0.1
    
    for (let i = 0; i < points; i++) {
      const x = (width / points) * i + (width / points) / 2
      const varAmount = Math.sin(i * 0.5 + seed) * 22
      const currentBaseY = baseY + varAmount
      const peakVariation = 0.6 + Math.sin(i * 0.8 + seed) * 0.4
      const currentPeakY = baseY - peakHeight * peakVariation - Math.abs(varAmount) * 1.8
      
      if (side === 'right') {
        // Gradiente de luz desde la derecha (luz del sol) - múltiples círculos
        const gradientX = x + 15 + Math.random() * 10
        const gradientY = currentBaseY - (currentBaseY - currentPeakY) * (0.25 + Math.random() * 0.5)
        // Círculo principal
        graphics.fillCircle(gradientX, gradientY, 18 + Math.random() * 12)
        // Círculo secundario para suavizar
        graphics.fillCircle(gradientX + 8, gradientY - 5, 10 + Math.random() * 8)
      } else if (side === 'top') {
        // Gradiente de luz desde arriba - múltiples círculos
        const gradientY = currentPeakY + 8 + Math.random() * 5
        graphics.fillCircle(x, gradientY, 15 + Math.random() * 10)
        // Círculo adicional para mayor suavidad
        graphics.fillCircle(x + (Math.random() - 0.5) * 12, gradientY + 5, 8 + Math.random() * 6)
      } else if (side === 'left') {
        // Gradiente de luz desde la izquierda
        const gradientX = x - 15 - Math.random() * 10
        const gradientY = currentBaseY - (currentBaseY - currentPeakY) * (0.3 + Math.random() * 0.4)
        graphics.fillCircle(gradientX, gradientY, 16 + Math.random() * 10)
        // Círculo secundario
        graphics.fillCircle(gradientX - 8, gradientY - 5, 9 + Math.random() * 7)
      }
    }
  }

  /**
   * Dibuja resaltes de luz en las montañas con colores vibrantes
   */
  static drawHighlights(
    graphics: Phaser.GameObjects.Graphics,
    width: number,
    baseY: number,
    points: number,
    peakHeight: number
  ): void {
    const seed = baseY * 0.1
    
    for (let i = 0; i < points; i++) {
      const x = (width / points) * i + (width / points) / 2
      const varAmount = Math.sin(i * 0.5 + seed) * 18
      const currentBaseY = baseY + varAmount
      const peakVariation = 0.6 + Math.sin(i * 0.8 + seed) * 0.4
      const currentPeakY = baseY - peakHeight * peakVariation - Math.abs(varAmount) * 1.5
      
      // Resaltes en el lado derecho (luz del sol) - múltiples círculos
      const highlightX = x + 12 + Math.random() * 8
      const highlightY = currentBaseY - (currentBaseY - currentPeakY) * (0.35 + Math.random() * 0.4)
      
      // Círculo principal más grande
      graphics.fillCircle(highlightX, highlightY, 10 + Math.random() * 14)
      
      // Círculo secundario para suavizar y crear más profundidad
      if (Math.random() > 0.4) {
        const secondaryX = highlightX + 6 + Math.random() * 4
        const secondaryY = highlightY - 4 - Math.random() * 3
        graphics.fillCircle(secondaryX, secondaryY, 6 + Math.random() * 8)
      }
    }
  }

  /**
   * Dibuja la sombra de las montañas mejorada
   */
  static drawShadow(
    graphics: Phaser.GameObjects.Graphics,
    width: number,
    horizonY: number,
    baseY: number,
    points: number,
    variation: number
  ): void {
    graphics.beginPath()
    graphics.moveTo(0, baseY)
    
    for (let i = 0; i <= points; i++) {
      const x = (width / points) * i
      const varAmount = Math.sin(i * 0.8) * variation + 
                       Math.cos(i * 0.3) * (variation * 0.5) +
                       Math.sin(i * 1.2) * (variation * 0.3)
      const currentBaseY = baseY + varAmount
      
      // Sombra más realista con gradiente de profundidad
      const shadowDepth = 12 + Math.abs(varAmount) * 0.3
      const shadowY = currentBaseY + shadowDepth
      const midX = x + (width / points) / 2
      
      if (i === 0) {
        graphics.lineTo(x, shadowY)
      }
      if (i < points) {
        // Usar múltiples puntos para crear sombra suave
        if (i > 0) {
          const prevX = (width / points) * (i - 1) + (width / points) / 2
          const prevVar = Math.sin((i - 1) * 0.8) * variation + 
                         Math.cos((i - 1) * 0.3) * (variation * 0.5) +
                         Math.sin((i - 1) * 1.2) * (variation * 0.3)
          const prevShadowY = baseY + prevVar + 12 + Math.abs(prevVar) * 0.3
          
          // Puntos intermedios para suavidad
          const steps = 2
          for (let step = 1; step <= steps; step++) {
            const t = step / steps
            const interpX = prevX + (midX - prevX) * t
            const interpY = prevShadowY + (shadowY - prevShadowY) * t
            graphics.lineTo(interpX, interpY)
          }
        } else {
          graphics.lineTo(midX, shadowY)
        }
        
        const nextX = x + (width / points)
        const nextVar = Math.sin((i + 1) * 0.8) * variation + 
                       Math.cos((i + 1) * 0.3) * (variation * 0.5) +
                       Math.sin((i + 1) * 1.2) * (variation * 0.3)
        const nextShadowY = baseY + nextVar + 12 + Math.abs(nextVar) * 0.3
        
        const steps = 2
        for (let step = 1; step <= steps; step++) {
          const t = step / steps
          const interpX = midX + (nextX - midX) * t
          const interpY = shadowY + (nextShadowY - shadowY) * t
          graphics.lineTo(interpX, interpY)
        }
      }
    }
    
    graphics.lineTo(width, horizonY + 8)
    graphics.lineTo(width, baseY)
    graphics.closePath()
    graphics.fillPath()
  }

  /**
   * Dibuja texturas mágicas simplificadas en las montañas
   */
  static drawTextures(
    graphics: Phaser.GameObjects.Graphics,
    width: number,
    baseY: number,
    points: number,
    peakHeight: number
  ): void {
    const seed = baseY * 0.1
    
    // Texturas mágicas reducidas (solo 12 elementos)
    for (let i = 0; i < 12; i++) {
      const x = Math.random() * width
      const varAmount = Math.sin((x / width) * points * 0.5 + seed) * 30
      const currentBaseY = baseY + varAmount
      const peakVariation = 0.5 + Math.sin((x / width) * points * 0.7 + seed) * 0.5
      const currentPeakY = baseY - peakHeight * peakVariation - Math.abs(varAmount) * 2.2
      
      if (x >= 0 && x <= width) {
        const y = currentBaseY - (currentBaseY - currentPeakY) * (0.3 + Math.random() * 0.5)
        
        // Rocas mágicas con colores vibrantes variados
        if (Math.random() > 0.5) {
          const rockSize = 4 + Math.random() * 6
          // Paleta de colores de rocas más variada
          const rockColors = [0x5A7B8C, 0x6A8BAC, 0x7A9BCC, 0x8A7BAC, 0x9A8BBC]
          const rockColor = rockColors[Math.floor(Math.random() * rockColors.length)]
          graphics.fillStyle(rockColor, 0.6)
          graphics.fillCircle(x, y, rockSize)
          
          // Resalte mágico con color complementario
          graphics.fillStyle(0x8AABCC, 0.4)
          graphics.fillCircle(x + rockSize * 0.2, y - rockSize * 0.2, rockSize * 0.5)
        } else {
          // Vegetación mágica con colores más vibrantes
          const vegSize = 3 + Math.random() * 5
          const vegColors = [0x4D9C6A, 0x5AAC7B, 0x6ABC8C, 0x7ACC9D, 0x5A8CAC, 0x6A9CBC]
          const vegColor = vegColors[Math.floor(Math.random() * vegColors.length)]
          
          graphics.fillStyle(vegColor, 0.5)
          graphics.fillCircle(x, y, vegSize)
          
          // Resalte en la vegetación
          graphics.fillStyle(0x8AECAA, 0.3)
          graphics.fillCircle(x - vegSize * 0.3, y - vegSize * 0.3, vegSize * 0.6)
        }
      }
    }
    
    // Líneas de grietas mágicas reducidas (solo 3)
    for (let i = 0; i < 3; i++) {
      const startX = Math.random() * width
      const varAmount = Math.sin((startX / width) * points * 0.5 + seed) * 30
      const currentBaseY = baseY + varAmount
      const peakVariation = 0.5 + Math.sin((startX / width) * points * 0.7 + seed) * 0.5
      const currentPeakY = baseY - peakHeight * peakVariation - Math.abs(varAmount) * 2.2
      
      const startY = currentBaseY - (currentBaseY - currentPeakY) * (0.4 + Math.random() * 0.4)
      const endX = startX + (Math.random() - 0.5) * 30
      const endY = startY + 8 + Math.random() * 15
      
      // Grietas con colores más variados
      const crackColors = [0x4A7B6C, 0x5A8B7C, 0x6A9B8C, 0x4A6BAC]
      const crackColor = crackColors[Math.floor(Math.random() * crackColors.length)]
      graphics.lineStyle(1.5, crackColor, 0.3)
      graphics.moveTo(startX, startY)
      graphics.lineTo(endX, endY)
      graphics.strokePath()
    }
  }
}

