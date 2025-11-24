import type Phaser from 'phaser'

export class TreeTrunkRenderer {
  /**
   * Dibuja el tronco del árbol con Flat Shaded 3D
   */
  static render(
    graphics: Phaser.GameObjects.Graphics,
    trunkWidth: number,
    treeHeight: number
  ): void {
    const trunkTopWidth = trunkWidth * 0.7
    const trunkBottomWidth = trunkWidth
    const trunkDepth = trunkWidth * 0.15 // Profundidad 3D del tronco
    
    // Colores del tronco más realistas para 3D
    const trunkLight = 0x7C6043 // Cara iluminada (marrón más cálido)
    const trunkMid = 0x5C4033 // Cara frontal
    const trunkDark = 0x3D2817 // Cara en sombra
    const trunkBark = 0x4A3428 // Textura de corteza
    
    // Base del tronco (cara inferior) - en sombra
    graphics.fillStyle(trunkDark, 1)
    graphics.fillRect(-trunkBottomWidth / 2, treeHeight * 0.7, trunkBottomWidth, treeHeight * 0.3)
    
    // Cara frontal del tronco (iluminada)
    graphics.fillStyle(trunkLight, 1)
    graphics.beginPath()
    graphics.moveTo(-trunkBottomWidth / 2, treeHeight * 0.7)
    graphics.lineTo(-trunkTopWidth / 2, 0)
    graphics.lineTo(trunkTopWidth / 2, 0)
    graphics.lineTo(trunkBottomWidth / 2, treeHeight * 0.7)
    graphics.closePath()
    graphics.fillPath()
    
    // Textura de corteza (líneas verticales)
    graphics.lineStyle(1, trunkBark, 0.6)
    for (let i = 0; i < 3; i++) {
      const lineX = -trunkWidth / 2 + trunkWidth * 0.25 + i * trunkWidth * 0.25
      graphics.moveTo(lineX, treeHeight * 0.1)
      graphics.lineTo(lineX, treeHeight * 0.65)
      graphics.strokePath()
    }
    
    // Cara derecha del tronco (muy iluminada)
    graphics.fillStyle(trunkLight, 1)
    graphics.beginPath()
    graphics.moveTo(trunkBottomWidth / 2, treeHeight * 0.7)
    graphics.lineTo(trunkTopWidth / 2, 0)
    graphics.lineTo(trunkTopWidth / 2 + trunkDepth, -trunkDepth * 0.5)
    graphics.lineTo(trunkBottomWidth / 2 + trunkDepth, treeHeight * 0.7 + trunkDepth * 0.5)
    graphics.closePath()
    graphics.fillPath()
    
    // Cara izquierda del tronco (en sombra)
    graphics.fillStyle(trunkDark, 1)
    graphics.beginPath()
    graphics.moveTo(-trunkBottomWidth / 2, treeHeight * 0.7)
    graphics.lineTo(-trunkTopWidth / 2, 0)
    graphics.lineTo(-trunkTopWidth / 2 - trunkDepth, -trunkDepth * 0.5)
    graphics.lineTo(-trunkBottomWidth / 2 - trunkDepth, treeHeight * 0.7 + trunkDepth * 0.5)
    graphics.closePath()
    graphics.fillPath()
    
    // Nudos y texturas en el tronco (más realistas)
    const numKnots = treeHeight > 60 ? 2 : 1
    for (let i = 0; i < numKnots; i++) {
      const knotY = treeHeight * 0.2 + (Math.random() * treeHeight * 0.5)
      const knotX = (Math.random() - 0.5) * trunkWidth * 0.4
      graphics.fillStyle(0x2A1A0F, 0.85)
      graphics.fillCircle(knotX, knotY, trunkWidth * 0.2 + Math.random() * trunkWidth * 0.1)
    }
    
    // Ramas principales más realistas (solo para árboles más grandes)
    if (treeHeight > 60) {
      this.renderBranches(graphics, trunkTopWidth, treeHeight, trunkLight, trunkMid, trunkDark)
    }
  }

  /**
   * Dibuja las ramas principales del árbol
   */
  private static renderBranches(
    graphics: Phaser.GameObjects.Graphics,
    trunkTopWidth: number,
    treeHeight: number,
    trunkLight: number,
    trunkMid: number,
    trunkDark: number
  ): void {
    const numBranches = 2 + Math.floor(Math.random() * 2) // 2-3 ramas
    for (let b = 0; b < numBranches; b++) {
      const branchY = -treeHeight * 0.05 - b * (treeHeight * 0.08)
      const branchAngle = (Math.random() - 0.5) * 0.6 // Ángulo variado
      const branchLength = (trunkTopWidth / 0.7) * (2 + Math.random() * 2)
      const branchWidth = (trunkTopWidth / 0.7) * (0.4 + Math.random() * 0.3)
      
      // Rama con 3D
      const branchX = Math.sin(branchAngle) * trunkTopWidth * 0.3
      
      // Color según orientación
      const isRightSide = branchX > 0
      const branchColor = isRightSide ? trunkLight : trunkDark
      
      graphics.fillStyle(branchColor, 1)
      graphics.fillRect(
        branchX - branchWidth / 2,
        branchY,
        branchWidth,
        branchLength * 0.6
      )
      
      // Detalle de la rama
      graphics.fillStyle(isRightSide ? trunkMid : trunkDark, 0.7)
      graphics.fillRect(
        branchX - branchWidth * 0.3,
        branchY + branchLength * 0.1,
        branchWidth * 0.6,
        branchLength * 0.4
      )
    }
  }
}

