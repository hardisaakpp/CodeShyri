import type Phaser from 'phaser'

export class PathRenderer {
  constructor(
    private graphics: Phaser.GameObjects.Graphics,
    private width: number,
    private horizonY: number
  ) {}

  /**
   * Renderiza un camino/sendero que conecta el poblado con otros puntos
   */
  public render(): void {
    // Calcular posiciones de las bases de las montañas cercanas
    const mountainBaseY = this.horizonY
    const mountainPoints = 10
    const mountainVariation = 30
    const seed = mountainBaseY * 0.1
    
    // Centro del poblado
    const villageCenterX = this.width / 2
    
    // Calcular la posición Y del poblado en la base de la montaña
    const villageMountainIndex = Math.floor((villageCenterX / this.width) * mountainPoints)
    const villageVarAmount = Math.sin(villageMountainIndex * 0.5 + seed) * mountainVariation + 
                            Math.cos(villageMountainIndex * 0.3 + seed * 0.7) * (mountainVariation * 0.6) +
                            Math.sin(villageMountainIndex * 1.2 + seed * 1.3) * (mountainVariation * 0.4)
    const villageY = mountainBaseY + villageVarAmount + 25 // Posición del poblado en el terreno
    
    // Puntos de conexión del sendero
    const pathPoints: { x: number; y: number }[] = []
    
    // Punto 1: Poblado (centro)
    pathPoints.push({ x: villageCenterX, y: villageY })
    
    // Punto 2: Hacia la izquierda (hacia el lago)
    const leftPointX = this.width * 0.15
    const leftMountainIndex = Math.floor((leftPointX / this.width) * mountainPoints)
    const leftVarAmount = Math.sin(leftMountainIndex * 0.5 + seed) * mountainVariation + 
                         Math.cos(leftMountainIndex * 0.3 + seed * 0.7) * (mountainVariation * 0.6) +
                         Math.sin(leftMountainIndex * 1.2 + seed * 1.3) * (mountainVariation * 0.4)
    const leftY = mountainBaseY + leftVarAmount + 25
    pathPoints.push({ x: leftPointX, y: leftY })
    
    // Punto 3: Hacia la derecha
    const rightPointX = this.width * 0.85
    const rightMountainIndex = Math.floor((rightPointX / this.width) * mountainPoints)
    const rightVarAmount = Math.sin(rightMountainIndex * 0.5 + seed) * mountainVariation + 
                          Math.cos(rightMountainIndex * 0.3 + seed * 0.7) * (mountainVariation * 0.6) +
                          Math.sin(rightMountainIndex * 1.2 + seed * 1.3) * (mountainVariation * 0.4)
    const rightY = mountainBaseY + rightVarAmount + 25
    pathPoints.push({ x: rightPointX, y: rightY })
    
    // Dibujar el sendero con curvas suaves (más sutil)
    const pathWidth = 4 + Math.random() * 2 // Ancho del sendero: 4-6 píxeles (más delgado)
    
    // Color del sendero (tierra pisada, más sutil)
    this.graphics.fillStyle(0x4A3A2A, 0.4) // Marrón terroso con baja opacidad
    this.graphics.lineStyle(pathWidth, 0x5A4A3A, 0.35) // Borde del sendero más sutil
    
    // Función helper para crear puntos intermedios de una curva suave
    const createCurvePoints = (start: { x: number; y: number }, end: { x: number; y: number }, midX: number, midY: number, numPoints: number): { x: number; y: number }[] => {
      const points: { x: number; y: number }[] = []
      for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints
        // Interpolación cuadrática de Bézier
        const x = (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * midX + t * t * end.x
        const y = (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * midY + t * t * end.y
        points.push({ x, y })
      }
      return points
    }
    
    // Dibujar segmentos del sendero
    for (let i = 0; i < pathPoints.length - 1; i++) {
      const start = pathPoints[i]
      const end = pathPoints[i + 1]
      
      // Crear curva suave entre puntos
      const midX = (start.x + end.x) / 2
      const midY = (start.y + end.y) / 2 + (Math.random() - 0.5) * 10 // Variación en la curva
      
      // Generar puntos de la curva
      const curvePoints = createCurvePoints(start, end, midX, midY, 20)
      
      // Dibujar el sendero con líneas (más sutil)
      this.graphics.lineStyle(pathWidth, 0x5A4A3A, 0.35) // Borde del sendero más sutil
      this.graphics.beginPath()
      this.graphics.moveTo(curvePoints[0].x, curvePoints[0].y)
      for (let j = 1; j < curvePoints.length; j++) {
        this.graphics.lineTo(curvePoints[j].x, curvePoints[j].y)
      }
      this.graphics.strokePath()
      
      // Relleno del sendero (más delgado y sutil)
      this.graphics.lineStyle(pathWidth * 0.7, 0x4A3A2A, 0.25)
      this.graphics.beginPath()
      this.graphics.moveTo(curvePoints[0].x, curvePoints[0].y)
      for (let j = 1; j < curvePoints.length; j++) {
        this.graphics.lineTo(curvePoints[j].x, curvePoints[j].y)
      }
      this.graphics.strokePath()
    }
    
    // Detalles del sendero (piedras pequeñas y textura)
    for (let i = 0; i < pathPoints.length - 1; i++) {
      const start = pathPoints[i]
      const end = pathPoints[i + 1]
      
      // Crear curva suave entre puntos (misma que arriba)
      const midX = (start.x + end.x) / 2
      const midY = (start.y + end.y) / 2 + (Math.random() - 0.5) * 10
      
      // Función helper para crear puntos de curva
      const createCurvePoints = (start: { x: number; y: number }, end: { x: number; y: number }, midX: number, midY: number, numPoints: number): { x: number; y: number }[] => {
        const points: { x: number; y: number }[] = []
        for (let i = 0; i <= numPoints; i++) {
          const t = i / numPoints
          const x = (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * midX + t * t * end.x
          const y = (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * midY + t * t * end.y
          points.push({ x, y })
        }
        return points
      }
      
      const curvePoints = createCurvePoints(start, end, midX, midY, 20)
      const distance = curvePoints.reduce((sum, point, idx) => {
        if (idx === 0) return 0
        const prev = curvePoints[idx - 1]
        return sum + Math.sqrt(Math.pow(point.x - prev.x, 2) + Math.pow(point.y - prev.y, 2))
      }, 0)
      
      const numStones = Math.floor(distance / 40) // Menos piedras: cada 40 píxeles (más espaciadas)
      
      for (let j = 0; j < numStones; j++) {
        const t = j / numStones
        const pointIndex = Math.floor(t * (curvePoints.length - 1))
        const point = curvePoints[pointIndex]
        const stoneX = point.x + (Math.random() - 0.5) * 4
        const stoneY = point.y + (Math.random() - 0.5) * 4
        const stoneSize = 1 + Math.random() * 1 // Piedras más pequeñas: 1-2 píxeles
        
        this.graphics.fillStyle(0x3A2A1A, 0.3) // Piedras más sutiles con baja opacidad
        this.graphics.fillCircle(stoneX, stoneY, stoneSize)
      }
    }
  }
}

