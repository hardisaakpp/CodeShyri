import type Phaser from 'phaser'

export interface TreeData {
  graphics: Phaser.GameObjects.Graphics
  container: Phaser.GameObjects.Container
  shadow: Phaser.GameObjects.Graphics
  leaves: Phaser.GameObjects.Graphics[]
  x: number
  y: number
  crownSize: number
  treeHeight: number
  treeColor?: number
}

export interface TreeColorVariations {
  baseDark: number
  mediumDark: number
  shadowDark: number
  highlightLight: number
  lightFace: number
  darkFace: number
  topFace: number
}

export type CrownShapeType = 
  | 'round'
  | 'conical'
  | 'wide'
  | 'tall'
  | 'asymmetric'
  | 'multi'
  | 'compact'
  | 'cloud'

export type LeafClusterType = 'base' | 'light' | 'shadow' | 'mid' | 'top'

