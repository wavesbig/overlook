import { ReactNode, useMemo, useState } from 'react'
import CardItem from '@renderer/components/grid/CardItem'
import CardModal from '@renderer/components/grid/CardModal'
import { useGridStore } from '@renderer/store/grid'
import CardGrid from '@renderer/components/grid/CardGrid'
import { Button } from '@renderer/components/ui/button'

export default function Dashboard(): ReactNode {
  const { layout, updateLayout, exportConfig, importConfig } = useGridStore()
  const items = useMemo(() => layout, [layout])
  const [adding, setAdding] = useState(false)

  const downloadJSON = (): void => {
    const data = exportConfig()
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
    importConfig(data)
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

      {/* Grid */}
      <CardGrid
        items={items}
        onLayoutChange={(next) => updateLayout(next)}
        renderItem={(it) => <CardItem id={it.i} />}
      />

      {/* Add card modal */}
      <CardModal mode="add" open={adding} onOpenChange={setAdding} />
    </div>
  )
}
