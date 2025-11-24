import type Phaser from 'phaser'

export class VolcanoRenderer {
  /**
   * Renderiza el volcán Cotopaxi nevado con colores vibrantes
   */
  static render(
    graphics: Phaser.GameObjects.Graphics,
    width: number,
    horizonY: number
  ): void {
    // Posición del volcán (centro-derecha del fondo)
    const volcanoX = width * 0.65
    const volcanoBaseY = horizonY - 12
    const volcanoWidth = 180
    const volcanoHeight = 190
    const snowLine = volcanoHeight * 0.32 // Línea de nieve (32% desde la cima)
    
    // Cuerpo del volcán con color púrpura oscuro y azul (roca volcánica mágica)
    graphics.fillStyle(0x5A4A7A, 0.9) // Púrpura oscuro
    graphics.beginPath()
    graphics.moveTo(volcanoX - volcanoWidth / 2, volcanoBaseY)
    
    const leftSnowX = volcanoX - (volcanoWidth / 2) * (1 - snowLine / volcanoHeight)
    const leftSnowY = volcanoBaseY - snowLine
    
    const steps1 = 4
    for (let step = 1; step <= steps1; step++) {
      const t = step / steps1
      const interpX = volcanoX - volcanoWidth / 2 + (leftSnowX - (volcanoX - volcanoWidth / 2)) * (t * t)
      const interpY = volcanoBaseY - (volcanoBaseY - leftSnowY) * (t * t)
      graphics.lineTo(interpX, interpY)
    }
    
    const steps2 = 4
    for (let step = 1; step <= steps2; step++) {
      const t = step / steps2
      const interpX = leftSnowX + (volcanoX - leftSnowX) * (t * t)
      const interpY = leftSnowY - (leftSnowY - (volcanoBaseY - volcanoHeight)) * (t * t)
      graphics.lineTo(interpX, interpY)
    }
    
    const rightSnowX = volcanoX + (volcanoWidth / 2) * (1 - snowLine / volcanoHeight)
    const rightSnowY = volcanoBaseY - snowLine
    const steps3 = 4
    for (let step = 1; step <= steps3; step++) {
      const t = step / steps3
      const interpX = volcanoX + (rightSnowX - volcanoX) * (t * t)
      const interpY = (volcanoBaseY - volcanoHeight) + (rightSnowY - (volcanoBaseY - volcanoHeight)) * (t * t)
      graphics.lineTo(interpX, interpY)
    }
    
    const steps4 = 4
    for (let step = 1; step <= steps4; step++) {
      const t = step / steps4
      const interpX = rightSnowX + (volcanoX + volcanoWidth / 2 - rightSnowX) * (t * t)
      const interpY = rightSnowY + (volcanoBaseY - rightSnowY) * (t * t)
      graphics.lineTo(interpX, interpY)
    }
    
    graphics.closePath()
    graphics.fillPath()
    
    // Capa de gradiente con toque azul
    graphics.fillStyle(0x6A5A9A, 0.6)
    graphics.beginPath()
    graphics.moveTo(volcanoX - volcanoWidth / 3, volcanoBaseY - snowLine * 0.3)
    const gradientSteps = 4
    for (let step = 1; step <= gradientSteps; step++) {
      const t = step / gradientSteps
      const interpX = volcanoX - volcanoWidth / 3 + (volcanoX + volcanoWidth / 3 - (volcanoX - volcanoWidth / 3)) * t
      const interpY = volcanoBaseY - snowLine * 0.3 - (volcanoBaseY - snowLine * 0.3 - (volcanoBaseY - volcanoHeight * 0.6)) * t
      graphics.lineTo(interpX, interpY)
    }
    graphics.lineTo(volcanoX - volcanoWidth / 3, volcanoBaseY - snowLine * 0.3)
    graphics.closePath()
    graphics.fillPath()
    
    // Sombra del volcán con toque púrpura
    graphics.fillStyle(0x3A2A5A, 0.7)
    graphics.beginPath()
    graphics.moveTo(volcanoX - volcanoWidth / 2, volcanoBaseY)
    const shadowSteps = 4
    for (let step = 1; step <= shadowSteps; step++) {
      const t = step / shadowSteps
      const interpX = volcanoX - volcanoWidth / 2 + (leftSnowX - (volcanoX - volcanoWidth / 2)) * (t * t)
      const interpY = volcanoBaseY - (volcanoBaseY - leftSnowY) * (t * t)
      graphics.lineTo(interpX, interpY)
    }
    graphics.lineTo(volcanoX - volcanoWidth / 3, volcanoBaseY - snowLine * 0.6)
    graphics.lineTo(volcanoX - volcanoWidth / 2, volcanoBaseY)
    graphics.closePath()
    graphics.fillPath()
    
    // Capa de nieve en la cima del Cotopaxi (blanca con gradiente)
    graphics.fillStyle(0xFFFFFF, 0.98)
    graphics.beginPath()
    graphics.moveTo(leftSnowX, leftSnowY)
    const snowSteps1 = 4
    for (let step = 1; step <= snowSteps1; step++) {
      const t = step / snowSteps1
      const interpX = leftSnowX + (volcanoX - leftSnowX) * (t * t)
      const interpY = leftSnowY - (leftSnowY - (volcanoBaseY - volcanoHeight)) * (t * t)
      graphics.lineTo(interpX, interpY)
    }
    const snowSteps2 = 4
    for (let step = 1; step <= snowSteps2; step++) {
      const t = step / snowSteps2
      const interpX = volcanoX + (rightSnowX - volcanoX) * (t * t)
      const interpY = (volcanoBaseY - volcanoHeight) + (rightSnowY - (volcanoBaseY - volcanoHeight)) * (t * t)
      graphics.lineTo(interpX, interpY)
    }
    
    // Borde inferior de la nieve con forma irregular y natural
    const snowPoints = 12
    for (let i = 0; i <= snowPoints; i++) {
      const t = i / snowPoints
      const x = leftSnowX + (rightSnowX - leftSnowX) * t
      // Usar múltiples ondas sinusoidales para crear una forma más natural
      const y = leftSnowY + Math.sin(t * Math.PI) * 10 + 
                Math.sin(t * Math.PI * 3) * 4 + 
                Math.sin(t * Math.PI * 5) * 2
      graphics.lineTo(x, y)
    }
    
    graphics.closePath()
    graphics.fillPath()
    
    // Detalles de nieve más brillante en la cima
    graphics.fillStyle(0xE8F4F8, 0.9)
    graphics.fillCircle(volcanoX, volcanoBaseY - volcanoHeight + 15, 35)
    graphics.fillCircle(volcanoX - 15, volcanoBaseY - volcanoHeight + 22, 22)
    graphics.fillCircle(volcanoX + 15, volcanoBaseY - volcanoHeight + 22, 22)
    graphics.fillCircle(volcanoX - 8, volcanoBaseY - volcanoHeight + 10, 15)
    graphics.fillCircle(volcanoX + 8, volcanoBaseY - volcanoHeight + 10, 15)
    
    // Resaltes de luz en el lado derecho (efecto de sol) con toque azul
    graphics.fillStyle(0x7A8ABC, 0.65)
    graphics.beginPath()
    graphics.moveTo(volcanoX + volcanoWidth / 3, volcanoBaseY - snowLine * 0.4)
    const highlightSteps1 = 4
    for (let step = 1; step <= highlightSteps1; step++) {
      const t = step / highlightSteps1
      const interpX = volcanoX + volcanoWidth / 3 + (rightSnowX - (volcanoX + volcanoWidth / 3)) * (t * t)
      const interpY = volcanoBaseY - snowLine * 0.4 - (volcanoBaseY - snowLine * 0.4 - rightSnowY) * (t * t)
      graphics.lineTo(interpX, interpY)
    }
    const highlightSteps2 = 4
    for (let step = 1; step <= highlightSteps2; step++) {
      const t = step / highlightSteps2
      const interpX = rightSnowX + (volcanoX - rightSnowX) * (t * t)
      const interpY = rightSnowY - (rightSnowY - (volcanoBaseY - volcanoHeight)) * (t * t)
      graphics.lineTo(interpX, interpY)
    }
    graphics.lineTo(volcanoX + volcanoWidth / 3, volcanoBaseY - snowLine * 0.4)
    graphics.closePath()
    graphics.fillPath()
  }
}

