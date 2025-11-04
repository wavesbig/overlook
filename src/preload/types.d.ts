// Shared types used across main, preload, and renderer

declare namespace Grid {
  type RefreshInterval = 30 | 60 | 300 | 600 | 1800 | 3600 | number
  type AccessMode = 'pc' | 'mobile'

  type CardConfig = {
    id: string
    name: string
    url: string
    refreshInterval: RefreshInterval
    accessMode: AccessMode
    targetSelector?: string
  }

  type GridLayoutItem = {
    i: string
    x: number
    y: number
    w: number
    h: number
    isDraggable?: boolean
    isResizable?: boolean
  }
}
