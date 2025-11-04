import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type GridState = {
  cards: Grid.Cards
  layout: Grid.Layouts
  // actions
  upsertCard: (card: Grid.CardConfig) => void
  removeCard: (id: string) => void
  updateLayout: (layout: Grid.Layouts) => void
  importConfig: (data: { cards: Grid.Cards; layout: Grid.Layouts }) => void
  exportConfig: () => { cards: Grid.Cards; layout: Grid.Layouts }
}

const DEFAULTS: { cards: Grid.Cards; layout: Grid.Layouts } = {
  cards: {},
  layout: []
}

const repository = {
  async hydrate(): Promise<{ cards: Grid.Cards; layout: Grid.Layouts } | null> {
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
  persist(cards: Grid.Cards, layout: Grid.Layouts): void {
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
function debounceSave(cards: Grid.Cards, layout: Grid.Layouts): void {
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
