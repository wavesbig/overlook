import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 约定：布局名称最大长度
const MAX_NAME_LEN = 32

// 工具：裁剪并提供默认名称
function sanitizeName(name: string): string {
  return name.slice(0, MAX_NAME_LEN) || '未命名布局'
}

// 工具：根据 id 计算当前布局
function computeCurrent(layouts: Grid.Layouts, id?: string): Grid.Layout | undefined {
  return layouts.find((l) => l.id === id)
}

// Grid 的全局状态与操作
// - layouts：所有布局列表
// - currentLayoutId：当前布局的 id
// - currentLayout：当前布局对象（便于组件直接读取）
// - actions：所有对布局与卡片的增删改操作
type GridState = {
  layouts: Grid.Layouts
  currentLayoutId?: string
  currentLayout?: Grid.Layout
  // actions
  createLayout: (name: string) => string
  renameLayout: (id: string, name: string) => void
  deleteLayout: (id: string) => void
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

// 持久化仓库：与主进程 electron-store 交互
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
  persist(data: Partial<{ layouts: Grid.Layouts; currentLayoutId?: string }>): void {
    try {
      if (window.api?.storeSet) {
        const ops: Promise<void>[] = []
        // 仅持久化传入的字段，避免无效写入
        if ('layouts' in data) {
          ops.push(window.api.storeSet('layouts', data.layouts))
        }
        if ('currentLayoutId' in data) {
          ops.push(window.api.storeSet('currentLayoutId', data.currentLayoutId ?? ''))
        }
        if (ops.length) void Promise.all(ops)
      }
    } catch {
      // ignore
    }
  }
}

// 防抖写入：批量且延迟持久化，减少频繁 IO
let saveTimer: number | undefined
function debounceSave(payload: Partial<{ layouts: Grid.Layouts; currentLayoutId?: string }>): void {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = window.setTimeout(() => repository.persist(payload), 400)
}

export const useGridStore = create<GridState>()(
  persist(
    (set, get) => ({
      layouts: [],
      currentLayoutId: undefined,
      currentLayout: undefined,
      createLayout(name) {
        const l = DEFAULT_LAYOUT()
        l.name = sanitizeName(name)
        const layouts = [...get().layouts, l]
        set({ layouts, currentLayoutId: l.id, currentLayout: l })
        debounceSave({ layouts, currentLayoutId: l.id })
        return l.id
      },
      renameLayout(id, name) {
        const { layouts, currentLayoutId } = get()
        const nextLayouts = layouts.map((l) =>
          l.id === id ? { ...l, name: sanitizeName(name) } : l
        )
        const nextCurrent = computeCurrent(nextLayouts, currentLayoutId)
        set({ layouts: nextLayouts, currentLayout: nextCurrent })
        debounceSave({ layouts: nextLayouts, currentLayoutId })
      },
      deleteLayout(id) {
        const { layouts, currentLayoutId } = get()
        const filtered = layouts.filter((l) => l.id !== id)
        if (filtered.length === 0) {
          const l = DEFAULT_LAYOUT()
          set({ layouts: [l], currentLayoutId: l.id, currentLayout: l })
          debounceSave({ layouts: [l], currentLayoutId: l.id })
          return
        }
        let nextId = currentLayoutId
        let nextCurrent = computeCurrent(filtered, nextId)
        if (!nextCurrent || currentLayoutId === id) {
          nextId = filtered[0].id
          nextCurrent = filtered[0]
        }
        set({ layouts: filtered, currentLayoutId: nextId, currentLayout: nextCurrent })
        debounceSave({ layouts: filtered, currentLayoutId: nextId })
      },
      switchLayout(id) {
        const { currentLayoutId } = get()
        // 已是当前布局则跳过，无需重复保存
        if (currentLayoutId === id) return
        const next = get().layouts.find((l) => l.id === id)
        if (!next) return
        set({ currentLayoutId: id, currentLayout: next })
        debounceSave({ currentLayoutId: id })
      },
      updateLayoutItems(items) {
        const { currentLayoutId, layouts } = get()
        if (!currentLayoutId) return
        const nextLayouts = layouts.map((l) => (l.id === currentLayoutId ? { ...l, items } : l))
        const nextCurrent = computeCurrent(nextLayouts, currentLayoutId)
        set({ layouts: nextLayouts, currentLayout: nextCurrent })
        debounceSave({ layouts: nextLayouts })
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
        const nextCurrent = computeCurrent(nextLayouts, currentLayoutId)
        set({ layouts: nextLayouts, currentLayout: nextCurrent })
        debounceSave({ layouts: nextLayouts })
      },
      removeCard(id) {
        const { currentLayoutId, layouts } = get()
        if (!currentLayoutId) return
        const nextLayouts = layouts.map((l) =>
          l.id === currentLayoutId ? { ...l, items: l.items.filter((it) => it.i !== id) } : l
        )
        const nextCurrent = computeCurrent(nextLayouts, currentLayoutId)
        set({ layouts: nextLayouts, currentLayout: nextCurrent })
        debounceSave({ layouts: nextLayouts })
      },
      importAll(data) {
        set({ layouts: data.layouts, currentLayoutId: data.currentLayoutId })
        const current = computeCurrent(data.layouts, data.currentLayoutId) ?? data.layouts[0]
        set({ currentLayout: current })
        repository.persist({ layouts: data.layouts, currentLayoutId: data.currentLayoutId })
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
