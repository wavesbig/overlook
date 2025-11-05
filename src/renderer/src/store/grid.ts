import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type GridState = {
  layouts: Grid.Layouts
  currentLayoutId?: string
  currentLayout?: Grid.Layout
  // actions
  createLayout: (name: string) => void
  switchLayout: (id: string) => void
  updateLayoutItems: (items: Grid.GridLayoutItem[]) => void
  upsertCard: (card: Grid.CardConfig) => void
  removeCard: (id: string) => void
  importAll: (data: { layouts: Grid.Layouts; currentLayoutId?: string }) => void
  exportAll: () => { layouts: Grid.Layouts; currentLayoutId?: string }
}

const DEFAULT_LAYOUT = (): Grid.Layout => ({
  id: `layout-${crypto.randomUUID()}`,
  name: '默认布局',
  items: []
})

const repository = {
  async hydrate(): Promise<{ layouts: Grid.Layouts; currentLayoutId?: string } | null> {
    try {
      if (window.api?.storeGet) {
        // 优先读取新版键
        const [layouts, currentLayoutId] = await Promise.all([
          window.api.storeGet('layouts'),
          window.api.storeGet('currentLayoutId')
        ])
        if (Array.isArray(layouts) && layouts.length > 0) {
          return { layouts, currentLayoutId }
        }
      }
    } catch {
      // ignore
    }
    return null
  },
  persist(layouts: Grid.Layouts, currentLayoutId?: string): void {
    try {
      if (window.api?.storeSet) {
        void Promise.all([
          window.api.storeSet('layouts', layouts),
          window.api.storeSet('currentLayoutId', currentLayoutId ?? '')
        ])
      }
    } catch {
      // ignore
    }
  }
}

let saveTimer: number | undefined
function debounceSave(layouts: Grid.Layouts, currentLayoutId?: string): void {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = window.setTimeout(() => repository.persist(layouts, currentLayoutId), 400)
}

export const useGridStore = create<GridState>()(
  persist(
    (set, get) => ({
      layouts: [],
      currentLayoutId: undefined,
      currentLayout: undefined,
      createLayout(name) {
        const l = DEFAULT_LAYOUT()
        l.name = name
        const layouts = [...get().layouts, l]
        set({ layouts, currentLayoutId: l.id, currentLayout: l })
        debounceSave(layouts, l.id)
      },
      switchLayout(id) {
        const next = get().layouts.find((l) => l.id === id)
        if (!next) return
        set({ currentLayoutId: id, currentLayout: next })
        debounceSave(get().layouts, id)
      },
      updateLayoutItems(items) {
        const { currentLayoutId, layouts } = get()
        if (!currentLayoutId) return
        const nextLayouts = layouts.map((l) => (l.id === currentLayoutId ? { ...l, items } : l))
        const nextCurrent = nextLayouts.find((l) => l.id === currentLayoutId)
        set({ layouts: nextLayouts, currentLayout: nextCurrent })
        debounceSave(nextLayouts, currentLayoutId)
      },
      upsertCard(card) {
        const { currentLayoutId, layouts } = get()
        if (!currentLayoutId) return
        const nextLayouts = layouts.map((l) => {
          if (l.id !== currentLayoutId) return l
          const nextItems = l.items.map((it) =>
            it.i === card.id ? { ...it, config: { ...card, name: card.name.slice(0, 32) } } : it
          )
          return { ...l, items: nextItems }
        })
        const nextCurrent = nextLayouts.find((l) => l.id === currentLayoutId)
        set({ layouts: nextLayouts, currentLayout: nextCurrent })
        debounceSave(nextLayouts, currentLayoutId)
      },
      removeCard(id) {
        const { currentLayoutId, layouts } = get()
        if (!currentLayoutId) return
        const nextLayouts = layouts.map((l) =>
          l.id === currentLayoutId ? { ...l, items: l.items.filter((it) => it.i !== id) } : l
        )
        const nextCurrent = nextLayouts.find((l) => l.id === currentLayoutId)
        set({ layouts: nextLayouts, currentLayout: nextCurrent })
        debounceSave(nextLayouts, currentLayoutId)
      },
      importAll(data) {
        set({ layouts: data.layouts, currentLayoutId: data.currentLayoutId })
        const current = data.layouts.find((l) => l.id === data.currentLayoutId) ?? data.layouts[0]
        set({ currentLayout: current })
        repository.persist(data.layouts, data.currentLayoutId)
      },
      exportAll() {
        return { layouts: get().layouts, currentLayoutId: get().currentLayoutId }
      }
    }),
    {
      name: 'gridcards-zustand',
      partialize: (state) => ({ layouts: state.layouts, currentLayoutId: state.currentLayoutId })
    }
  )
)

// Hydrate from main electron-store asynchronously if available
void (async function hydrate(): Promise<void> {
  const data = await repository.hydrate()
  if (data) {
    const id = data.currentLayoutId ?? data.layouts[0]?.id
    const current = data.layouts.find((l) => l.id === id) ?? data.layouts[0]
    useGridStore.setState({ layouts: data.layouts, currentLayoutId: id, currentLayout: current })
  } else {
    const l = DEFAULT_LAYOUT()
    useGridStore.setState({ layouts: [l], currentLayoutId: l.id, currentLayout: l })
  }
})()
