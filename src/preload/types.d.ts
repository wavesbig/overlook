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

// ElectronStore namespace: centralize all Store-related typing
declare namespace ElectronStore {
  // Store value map to centralize key→value typing
  interface StoreValueMap {
    cards: Record<string, Grid.CardConfig>
    layout: Grid.GridLayoutItem[]
  }

  // Centralized key and entry helpers
  type StoreKey = keyof StoreValueMap
  type StoreEntry<K extends StoreKey = StoreKey> = StoreValueMap[K]

  // Convenient aliases
  type Cards = StoreValueMap['cards']
  type Layout = StoreValueMap['layout']

  // Single generic API to reduce overload maintenance
  interface StoreAPI {
    storeGet<K extends StoreKey>(key: K): Promise<StoreEntry<K> | undefined>
    storeSet<K extends StoreKey>(key: K, val: StoreEntry<K>): Promise<void>
  }
}
