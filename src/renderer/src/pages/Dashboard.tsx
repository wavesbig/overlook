import { ReactNode, useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import CardItem from '@renderer/components/grid/CardItem'
import CardModal from '@renderer/components/grid/CardModal'
import { useGridStore } from '@renderer/store/grid'
import CardGrid from '@renderer/components/grid/CardGrid'
import { Button } from '@renderer/components/ui/button'
import Empty from '@renderer/components/ui/empty'

export default function Dashboard(): ReactNode {
  const {
    currentLayout,
    updateLayoutItems,
    exportAll,
    importAll,
    switchLayout,
    layouts,
    currentLayoutId
  } = useGridStore()
  const [searchParams] = useSearchParams()
  const items = useMemo(() => currentLayout?.items ?? [], [currentLayout])
  const [adding, setAdding] = useState(false)

  // When dashboard has ?id, switch to that layout; otherwise default to first
  useEffect(() => {
    const id = searchParams.get('id')
    if (layouts.length === 0) return
    if (id) {
      const target = layouts.find((l) => l.id === id)
      const fallback = layouts[0]
      if (target) {
        if (currentLayoutId !== id) switchLayout(id)
      } else if (fallback && currentLayoutId !== fallback.id) {
        switchLayout(fallback.id)
      }
    } else {
      const first = layouts[0]
      if (first && currentLayoutId !== first.id) switchLayout(first.id)
    }
  }, [searchParams, layouts, currentLayoutId, switchLayout])

  const downloadJSON = (): void => {
    const data = exportAll()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'gridcards-config.json'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const uploadJSON = async (file: File): Promise<void> => {
    const text = await file.text()
    const data = JSON.parse(text)
    importAll(data)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">主看板</h1>
          {/* {!isOnline && (
            <span className="text-xs px-2 py-1 rounded bg-amber-200/60 text-amber-900">
              离线模式，恢复后自动刷新
            </span>
          )} */}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setAdding(true)}>
            添加卡片
          </Button>
          <Button variant="outline" onClick={downloadJSON}>
            导出配置
          </Button>
          <label className="cursor-pointer">
            <Button variant="outline" asChild>
              <span>导入配置</span>
            </Button>
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

      {/* Grid / Empty State */}
      {items.length === 0 ? (
        <Empty title="暂无卡片" description="点击“添加卡片”快速开始">
          <Button variant="outline" onClick={() => setAdding(true)}>
            添加卡片
          </Button>
        </Empty>
      ) : (
        <CardGrid
          items={items}
          onLayoutChange={(next) => updateLayoutItems(next)}
          renderItem={(it) => <CardItem id={it.i} />}
        />
      )}

      {/* Add card modal */}
      <CardModal mode="add" open={adding} onOpenChange={setAdding} />
    </div>
  )
}
