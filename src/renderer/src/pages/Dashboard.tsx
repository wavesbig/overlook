import { ReactNode, useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import CardItem from '@renderer/components/grid/CardItem'
import CardModal from '@renderer/components/grid/CardModal'
import { useGridStore } from '@renderer/store/grid'
import CardGrid from '@renderer/components/grid/CardGrid'
import { Button } from '@renderer/components/ui/button'
import Empty from '@renderer/components/ui/empty'
import { isValidUrl, normalizeUrl } from '@renderer/lib/webview'

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
  const [dragging, setDragging] = useState(false)

  // Switch layout by ?id; fallback to first layout if missing/invalid
  useEffect(() => {
    const paramId = searchParams.get('id')
    if (!layouts.length) return
    const hasParam = paramId && layouts.some((l) => l.id === paramId)
    const targetId = hasParam ? (paramId as string) : layouts[0].id
    if (targetId && currentLayoutId !== targetId) {
      switchLayout(targetId)
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

  // Extract URL from DataTransfer across browsers
  const extractUrlFromDataTransfer = (dt: DataTransfer | null): string | null => {
    if (!dt) return null
    const uriList = dt.getData('text/uri-list')?.trim()
    if (uriList) {
      const first = uriList.split('\n').find((line) => line && !line.startsWith('#'))
      if (first && isValidUrl(first)) return first.trim()
    }
    // Firefox specific format: "text/x-moz-url" => "url\nname"
    const moz = dt.getData('text/x-moz-url')?.trim()
    if (moz) {
      const first = moz.split('\n')[0]
      if (first && isValidUrl(first)) return first.trim()
    }
    const html = dt.getData('text/html')
    if (html) {
      const m = html.match(/href=["']([^"']+)["']/i)
      if (m && isValidUrl(m[1])) return m[1].trim()
    }
    const text = dt.getData('text/plain')?.trim()
    if (text) {
      const mHttp = text.match(/https?:\/\/[^\s]+/i)
      if (mHttp && isValidUrl(mHttp[0])) return mHttp[0].trim()
      const mDomain = text.match(/([\w.-]+\.[a-zA-Z]{2,}[^\s]*)/)
      if (mDomain && isValidUrl(mDomain[1])) return mDomain[1].trim()
    }
    return null
  }

  // Quick add a card from a dropped URL
  const quickAddCard = (raw: string): void => {
    const url = raw.trim()
    if (!isValidUrl(url)) return
    const id = `card-${crypto.randomUUID()}`
    let name = url
    try {
      const u = new URL(normalizeUrl(url))
      name = u.hostname
    } catch {
      // keep raw as name
    }
    const nextCfg: Grid.CardConfig = {
      id,
      name,
      url,
      refreshInterval: 300,
      accessMode: 'pc'
    }
    const nextItems: Grid.GridLayoutItem[] = [
      ...(currentLayout?.items ?? []),
      { i: id, x: 0, y: 0, w: 8, h: 20, config: nextCfg }
    ]
    updateLayoutItems(nextItems)
  }

  const onDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'copy'
    setDragging(true)
  }
  const onDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    e.stopPropagation()
    const url = extractUrlFromDataTransfer(e.dataTransfer)
    if (url) quickAddCard(url)
    setDragging(false)
  }

  // Global handlers to prevent default navigation and show overlay above webview
  useEffect(() => {
    const handleWindowDragOver = (ev: DragEvent): void => {
      ev.preventDefault()
      ev.stopPropagation()
      setDragging(true)
    }
    const handleWindowDrop = (ev: DragEvent): void => {
      ev.preventDefault()
      ev.stopPropagation()
      const url = extractUrlFromDataTransfer(ev.dataTransfer)
      if (url) quickAddCard(url)
      setDragging(false)
    }
    window.addEventListener('dragover', handleWindowDragOver)
    window.addEventListener('drop', handleWindowDrop)
    return () => {
      window.removeEventListener('dragover', handleWindowDragOver)
      window.removeEventListener('drop', handleWindowDrop)
    }
  }, [])

  return (
    <div className="flex flex-col gap-4" onDragOver={onDragOver} onDrop={onDrop}>
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">{currentLayout?.name ?? '主看板'}</h1>
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

      {/* Drag overlay to capture drops above webviews */}
      {dragging && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-background/70 border-2 border-dashed border-muted-foreground"
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <div className="rounded-md bg-muted px-6 py-3 text-sm text-muted-foreground">
            将链接拖拽到此以添加卡片
          </div>
        </div>
      )}

      {/* Add card modal */}
      <CardModal mode="add" open={adding} onOpenChange={setAdding} />
    </div>
  )
}
