import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type GridState = {
  cards: Record<string, Grid.CardConfig>
  layout: Grid.GridLayoutItem[]
  isOnline: boolean
  // actions
  upsertCard: (card: Grid.CardConfig) => void
  removeCard: (id: string) => void
  updateLayout: (layout: Grid.GridLayoutItem[]) => void
  importConfig: (data: {
    cards: Record<string, Grid.CardConfig>
    layout: Grid.GridLayoutItem[]
  }) => void
  exportConfig: () => { cards: Record<string, Grid.CardConfig>; layout: Grid.GridLayoutItem[] }
}

type Adapter = {
  get: <T = any>(key: 'cards' | 'layout') => T | undefined
  set: (key: 'cards' | 'layout', val: any) => void
}

const storeAdapter: Adapter = {
  get<T>(key: 'cards' | 'layout'): T | undefined {
    const raw = localStorage.getItem(`gridcards:${key}`)
    return raw ? JSON.parse(raw) : undefined
  },
  set(key: 'cards' | 'layout', val: any): void {
    // Persist to localStorage for web preview fallback
    localStorage.setItem(`gridcards:${key}`, JSON.stringify(val))
    // Forward to main via preload when available
    try {
      if (window.api?.storeSet) {
        void window.api.storeSet(key, val)
      }
    } catch (_) {
      // ignore
    }
  }
}

function saveToStore(cards: Record<string, Grid.CardConfig>, layout: Grid.GridLayoutItem[]): void {
  storeAdapter.set('cards', cards)
  storeAdapter.set('layout', layout)
}

let saveTimer: number | undefined
function debounceSave(cards: Record<string, Grid.CardConfig>, layout: Grid.GridLayoutItem[]): void {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = window.setTimeout(() => saveToStore(cards, layout), 400)
}

export const useGridStore = create<GridState>()(
  persist(
    (set, get) => ({
      cards: storeAdapter.get('cards') || {},
      layout: storeAdapter.get('layout') || [],
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

// Hydrate from main electron-store asynchronously if available
async function hydrateFromMainStore(): Promise<void> {
  try {
    if (window.api?.storeGet) {
      const [cards, layout] = await Promise.all([
        window.api.storeGet<Record<string, Grid.CardConfig>>('cards'),
        window.api.storeGet<Grid.GridLayoutItem[]>('layout')
      ])
      if (cards && layout) {
        useGridStore.setState({ cards, layout })
      }
    }
  } catch (_) {
    // ignore
  }
}

void hydrateFromMainStore()

export function setupNetworkListeners(store = useGridStore.getState()): void {
  const update = (): void => {
    useGridStore.setState({ isOnline: navigator.onLine })
  }
  window.addEventListener('online', update)
  window.addEventListener('offline', update)
}
