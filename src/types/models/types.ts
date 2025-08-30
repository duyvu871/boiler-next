// Shared model-related types used across playground and 3D components.

export type ModelCategory = 'body' | 'top' | 'bottom'

export interface ModelInfo {
  name: string
  url: string
  category: ModelCategory
  defaultVisible?: boolean
  scale?: number
}


