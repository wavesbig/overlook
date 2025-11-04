import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type GridState = {
  cards: ElectronStore.Cards
  layout: ElectronStore.Layout
  // actions
  upsertCard: (card: Grid.CardConfig) => void
  removeCard: (id: string) => void
  updateLayout: (layout: ElectronStore.Layout) => void
  importConfig: (data: { cards: ElectronStore.Cards; layout: ElectronStore.Layout }) => void
  exportConfig: () => { cards: ElectronStore.Cards; layout: ElectronStore.Layout }
}

const DEFAULTS: { cards: ElectronStore.Cards; layout: ElectronStore.Layout } = {
  cards: {},
  layout: []
}

const repository = {
  async hydrate(): Promise<{ cards: ElectronStore.Cards; layout: ElectronStore.Layout } | null> {
    try {
      if (window.api?.storeGet) {
        const [cards, layout] = await Promise.all([
          window.api.storeGet('cards'),
          window.api.storeGet('layout')
        ])
        return { cards: cards ?? DEFAULTS.cards, layout: layout ?? DEFAULTS.layout }
      }
    } catch {
      // ignore
    }
    return null
  },
  persist(cards: ElectronStore.Cards, layout: ElectronStore.Layout): void {
    try {
      if (window.api?.storeSet) {
        void Promise.all([
          window.api.storeSet('cards', cards),
          window.api.storeSet('layout', layout)
        ])
      }
    } catch {
      // ignore
    }
  }
}

let saveTimer: number | undefined
function debounceSave(cards: ElectronStore.Cards, layout: ElectronStore.Layout): void {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = window.setTimeout(() => repository.persist(cards, layout), 400)
}

export const useGridStore = create<GridState>()(
  persist(
    (set, get) => ({
      cards: DEFAULTS.cards,
      layout: DEFAULTS.layout,
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
        repository.persist(data.cards, data.layout)
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
void (async function hydrate(): Promise<void> {
  const data = await repository.hydrate()
  if (data) {
    useGridStore.setState({ cards: data.cards, layout: data.layout })
  }
})()
