import { ReactNode, useMemo, useEffect } from 'react'
import { Responsive, WidthProvider, Layout } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import GridCard from '@renderer/components/grid/GridCard'
import { useGridStore, GridLayoutItem, CardConfig } from '@renderer/store/grid'

const ResponsiveGridLayout = WidthProvider(Responsive)

export default function Dashboard(): ReactNode {
  const { cards, layout, updateLayout, exportConfig, importConfig, isOnline, upsertCard } =
    useGridStore()
  const items = useMemo(() => layout, [layout])

  const onLayoutChange = (_: Layout[], all: { [key: string]: Layout[] }) => {
    // Use lg layout as source of truth
    const lg = all.lg || []
    const next: GridLayoutItem[] = lg.map((l) => ({ i: l.i, x: l.x, y: l.y, w: l.w, h: l.h }))
    updateLayout(next)
  }

  const addTestCards = () => {
    const id1 = `card-${Math.random().toString(36).slice(2, 8)}`
    const id2 = `card-${Math.random().toString(36).slice(2, 8)}`
    const card1: CardConfig = {
      id: id1,
      name: 'React 官网',
      url: 'https://react.dev',
      refreshInterval: 300,
      accessMode: 'pc'
    }
    const card2: CardConfig = {
      id: id2,
      name: 'Vite 官网',
      url: 'https://vitejs.dev',
      refreshInterval: 300,
      accessMode: 'pc'
    }
    upsertCard(card1)
    upsertCard(card2)
    updateLayout([
      ...layout,
      { i: id1, x: 0, y: 0, w: 6, h: 8 },
      { i: id2, x: 6, y: 0, w: 6, h: 8 }
    ])
  }

  useEffect(() => {
    if (layout.length === 0 && Object.keys(cards).length === 0) {
      addTestCards()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const downloadJSON = () => {
    const data = exportConfig()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'gridcards-config.json'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const uploadJSON = async (file: File) => {
    const text = await file.text()
    const data = JSON.parse(text)
    importConfig(data)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">主看板</h1>
          {!isOnline && (
            <span className="text-xs px-2 py-1 rounded bg-amber-200/60 text-amber-900">
              离线模式，恢复后自动刷新
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button className="border px-3 py-1 rounded hover:bg-muted" onClick={addTestCards}>
            添加测试卡片
          </button>
          <button className="border px-3 py-1 rounded hover:bg-muted" onClick={downloadJSON}>
            导出配置
          </button>
          <label className="border px-3 py-1 rounded hover:bg-muted cursor-pointer">
            导入配置
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) uploadJSON(f)
              }}
            />
          </label>
        </div>
      </div>

      {/* Grid */}
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: items as unknown as Layout[] }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 8, xs: 6, xxs: 4 }}
        rowHeight={24}
        margin={[8, 8]}
        compactType={null}
        preventCollision={true}
        draggableHandle="[data-grid-drag-handle]"
        onLayoutChange={onLayoutChange}
      >
        {items.map((it) => (
          <div key={it.i} data-grid={it as any}>
            <GridCard id={it.i} />
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  )
}
