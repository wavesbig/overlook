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
    // WebView 缩放因子，默认 1（100%），范围建议 0.5~3
    zoomFactor?: number
  }

  type GridLayoutItem = {
    i: string
    x: number
    y: number
    w: number
    h: number
    isDraggable?: boolean
    isResizable?: boolean
    // 将站点配置直接放入网格项，字段名更直观
    config: Grid.CardConfig
  }

  type Cards = Record<string, Grid.CardConfig>

  // 单个布局对象：包含网格项与其对应的卡片配置
  type Layout = {
    id: string
    name: string
    items: Grid.GridLayoutItem[]
  }

  // 布局列表
  type Layouts = Grid.Layout[]
}

declare namespace Settings {
  type ThemeMode = 'light' | 'dark' | 'system'
  type FontScale = number

  type Settings = {
    themeMode: ThemeMode
    fontScale: FontScale
  }
}

// ElectronStore namespace: centralize all Store-related typing
declare namespace ElectronStore {
  // Store value map to centralize key→value typing
  interface StoreValueMap {
    // 仅保留新版键：多布局与当前布局选择
    layouts?: Grid.Layouts
    currentLayoutId?: string
    // 新增：全局偏好设置（统一归于 settings 对象）
    settings?: Settings.Settings
  }

  // Centralized key and entry helpers
  type StoreKey = keyof StoreValueMap
  type StoreEntry<K extends StoreKey = StoreKey> = StoreValueMap[K]

  // Single generic API to reduce overload maintenance
  interface StoreAPI {
    storeGet<K extends StoreKey>(key: K): Promise<StoreEntry<K> | undefined>
    storeSet<K extends StoreKey>(key: K, val: StoreEntry<K>): Promise<void>
  }
}
