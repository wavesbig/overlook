import { create } from 'zustand'
import { persist } from 'zustand/middleware'
let ElectronStore: any = null
try {
  ElectronStore = require('electron-store')
} catch (_) {
  ElectronStore = null
}

export type RefreshInterval = 30 | 60 | 300 | 600 | 1800 | 3600 | number

export type AccessMode = 'pc' | 'mobile'

export type CardConfig = {
  id: string
  name: string
  url: string
  refreshInterval: RefreshInterval
  accessMode: AccessMode
  targetSelector?: string
}

export type GridLayoutItem = {
  i: string
  x: number
  y: number
  w: number
  h: number
  isDraggable?: boolean
  isResizable?: boolean
}

type GridState = {
  cards: Record<string, CardConfig>
  layout: GridLayoutItem[]
  isOnline: boolean
  // actions
  upsertCard: (card: CardConfig) => void
  removeCard: (id: string) => void
  updateLayout: (layout: GridLayoutItem[]) => void
  importConfig: (data: { cards: Record<string, CardConfig>; layout: GridLayoutItem[] }) => void
  exportConfig: () => { cards: Record<string, CardConfig>; layout: GridLayoutItem[] }
}

type Adapter = {
  get: <T = any>(key: string) => T | undefined
  set: (key: string, val: any) => void
}

const electronStore: Adapter = (() => {
  if (ElectronStore) {
    const store = new ElectronStore<{
      cards: Record<string, CardConfig>
      layout: GridLayoutItem[]
    }>({
      name: 'gridcards',
      schema: { cards: { type: 'object', additionalProperties: true }, layout: { type: 'array' } }
    })
    return { get: (k) => store.get(k as any), set: (k, v) => store.set(k as any, v) }
  }
  // Fallback for web preview
  return {
    get(key) {
      const raw = localStorage.getItem(`gridcards:${key}`)
      return raw ? JSON.parse(raw) : undefined
    },
    set(key, val) {
      localStorage.setItem(`gridcards:${key}`, JSON.stringify(val))
    }
  }
})()

function saveToStore(cards: Record<string, CardConfig>, layout: GridLayoutItem[]): void {
  electronStore.set('cards', cards)
  electronStore.set('layout', layout)
}

let saveTimer: number | undefined
function debounceSave(cards: Record<string, CardConfig>, layout: GridLayoutItem[]): void {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = window.setTimeout(() => saveToStore(cards, layout), 400)
}

export const useGridStore = create<GridState>()(
  persist(
    (set, get) => ({
      cards: electronStore.get('cards') || {},
      layout: electronStore.get('layout') || [],
      isOnline: navigator.onLine,
      upsertCard(card) {
        const cards = { ...get().cards, [card.id]: { ...card, name: card.name.slice(0, 32) } }
        set({ cards })
        debounceSave(cards, get().layout)
      },
      removeCard(id) {
        const cards = { ...get().cards }
        delete cards[id]
        const layout = get().layout.filter((l) => l.i !== id)
        set({ cards, layout })
        debounceSave(cards, layout)
      },
      updateLayout(layout) {
        set({ layout })
        debounceSave(get().cards, layout)
      },
      importConfig(data) {
        set({ cards: data.cards, layout: data.layout })
        saveToStore(data.cards, data.layout)
      },
      exportConfig() {
        return { cards: get().cards, layout: get().layout }
      }
    }),
    {
      name: 'gridcards-zustand',
      partialize: (state) => ({ cards: state.cards, layout: state.layout })
    }
  )
)

export function setupNetworkListeners(store = useGridStore.getState()): void {
  const update = (): void => {
    useGridStore.setState({ isOnline: navigator.onLine })
  }
  window.addEventListener('online', update)
  window.addEventListener('offline', update)
}
