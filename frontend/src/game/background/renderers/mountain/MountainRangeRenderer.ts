import type Phaser from 'phaser'
import type { MountainPoint, MountainRangeOptions } from './MountainTypes'
import { MountainColorGenerator } from './MountainColorGenerator'

export class MountainRangeRenderer {
  /**
   * Dibuja una cadena de montañas con estilo andino: picos más angulares y dramáticos
   * Cada montaña tiene un color diferente para mayor variedad visual
   */
  static draw(
    graphics: Phaser.GameObjects.Graphics,
    width: number,
    height: number,
    horizonY: number,
    baseY: number,
    points: number,
    variation: number,
    peakHeight: number,
    options?: MountainRangeOptions
  ): void {
    const seed = baseY * 0.1
    const excludeZone = options?.excludeZone
    const excludeMinX = excludeZone ? excludeZone.centerX - excludeZone.width / 2 : -1
    const excludeMaxX = excludeZone ? excludeZone.centerX + excludeZone.width / 2 : -1
    
    // Calcular todos los puntos primero
    const mountainPoints: MountainPoint[] = []
    
    for (let i = 0; i <= points; i++) {
      const x = (width / points) * i
      const midX = x + (width / points) / 2
      
      const isInExcludeZone = excludeZone && (midX >= excludeMinX && midX <= excludeMaxX)
      let heightMultiplier = 1.0
      if (isInExcludeZone) {
        const distanceFromCenter = Math.abs(midX - excludeZone!.centerX)
        const normalizedDistance = distanceFromCenter / (excludeZone!.width / 2)
        heightMultiplier = Math.max(0.2, normalizedDistance * 0.8)
      }
      
      const varAmount = Math.sin(i * 0.5 + seed) * variation + 
                       Math.cos(i * 0.3 + seed * 0.7) * (variation * 0.6) +
                       Math.sin(i * 1.2 + seed * 1.3) * (variation * 0.4)
      const currentBaseY = baseY + varAmount
      
      const peakVariation = 0.4 + Math.sin(i * 0.7 + seed) * 0.6
      const secondaryPeak = Math.sin(i * 1.8 + seed * 2) * 0.25
      const tertiaryPeak = Math.cos(i * 2.5 + seed * 1.5) * 0.2
      const quaternaryPeak = Math.sin(i * 3.2 + seed * 0.8) * 0.15
      const adjustedPeakHeight = peakHeight * heightMultiplier
      const currentPeakY = baseY - adjustedPeakHeight * (peakVariation + secondaryPeak + tertiaryPeak + quaternaryPeak) - Math.abs(varAmount) * 2.5
      
      // Seleccionar color para este punto
      const mountainColor = MountainColorGenerator.getMountainColor(i, seed)
      
      mountainPoints.push({ x: midX, y: currentBaseY, baseY: currentBaseY, peakY: currentPeakY, color: mountainColor })
    }
    
    // Dibujar cada segmento de montaña con versión simplificada de 3D (solo cara frontal + sombra)
    for (let i = 0; i < points; i++) {
      const current = mountainPoints[i]
      const next = mountainPoints[i + 1]
      
      const segmentStartX = i === 0 ? 0 : (current.x + mountainPoints[i - 1].x) / 2
      const segmentEndX = i === points - 1 ? width : (current.x + next.x) / 2
      
      // Generar variaciones de color simplificadas (solo para sombra)
      const colorVariations = MountainColorGenerator.getMountainColorVariations(current.color)
      
      // Calcular puntos del contorno principal de la montaña (simplificado)
      const frontContour = this.calculateMountainContour(
        segmentStartX,
        current.x,
        segmentEndX,
        current.baseY,
        current.peakY,
        next.baseY
      )
      
      // Cara frontal con gradiente de color para simular 3D (más eficiente)
      graphics.fillStyle(colorVariations.lightFace, 1)
      graphics.beginPath()
      graphics.moveTo(segmentStartX, current.baseY)
      for (const point of frontContour) {
        graphics.lineTo(point.x, point.y)
      }
      if (baseY === horizonY && i === points - 1) {
        graphics.lineTo(width, height)
        graphics.lineTo(0, height)
        graphics.lineTo(segmentStartX, current.baseY)
      } else {
        graphics.lineTo(segmentStartX, current.baseY)
      }
      graphics.closePath()
      graphics.fillPath()
      
      // Sombra simple en el lado izquierdo para efecto 3D (más eficiente que 3 caras)
      graphics.fillStyle(colorVariations.darkFace, 0.6)
      graphics.beginPath()
      graphics.moveTo(segmentStartX, current.baseY)
      for (let j = 0; j < Math.min(3, frontContour.length - 1); j++) {
        const point = frontContour[j]
        graphics.lineTo(point.x - 2, point.y + 1)
      }
      graphics.lineTo(segmentStartX, current.baseY + 3)
      graphics.closePath()
      graphics.fillPath()
    }
  }

  /**
   * Calcula el contorno de una montaña
   */
  private static calculateMountainContour(
    segmentStartX: number,
    peakX: number,
    segmentEndX: number,
    startBaseY: number,
    peakY: number,
    endBaseY: number
  ): Array<{ x: number; y: number }> {
    const contour: Array<{ x: number; y: number }> = []
    const steps = 4
    
    contour.push({ x: segmentStartX, y: startBaseY })
    
    // Subida hacia el pico
    for (let step = 1; step <= steps; step++) {
      const t = step / steps
      const easedT = t * t * t
      const interpX = segmentStartX + (peakX - segmentStartX) * easedT
      const heightVariation = Math.sin(t * Math.PI) * 6 + 
                            Math.sin(t * Math.PI * 3) * 2.5 + 
                            Math.sin(t * Math.PI * 5) * 1.2
      const interpY = startBaseY + (peakY - startBaseY) * easedT - heightVariation
      
      if ((step === Math.floor(steps / 3) || step === Math.floor(steps * 2 / 3)) && Math.random() > 0.7) {
        const ridgeHeight = 8 + Math.random() * 10
        contour.push({ x: interpX - 1, y: interpY - ridgeHeight })
        contour.push({ x: interpX + 1, y: interpY - ridgeHeight * 0.5 })
      }
      
      contour.push({ x: interpX, y: interpY })
    }
    
    // Descenso desde el pico
    for (let step = 1; step <= steps; step++) {
      const t = step / steps
      const easedT = 1 - (1 - t) * (1 - t) * (1 - t)
      const interpX = peakX + (segmentEndX - peakX) * easedT
      const descentVariation = Math.sin(t * Math.PI * 0.5) * 3
      const interpY = peakY + (endBaseY - peakY) * easedT + descentVariation
      contour.push({ x: interpX, y: interpY })
    }
    
    contour.push({ x: segmentEndX, y: endBaseY })
    
    return contour
  }
}

