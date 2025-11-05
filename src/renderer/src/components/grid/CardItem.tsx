import { ReactNode, useEffect, useRef, useState } from 'react'
import { useGridStore } from '@renderer/store/grid'
import {
  UA_PC,
  UA_MOBILE,
  isValidUrl,
  normalizeUrl,
  getSearchUrl,
  highlightSelectorScript
} from '@renderer/lib/webview'
import {
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconCopy,
  IconPencil,
  IconReload,
  IconTrash,
  IconGripVertical
} from '@tabler/icons-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose
} from '@renderer/components/ui/sheet'
import { Input } from '@renderer/components/ui/input'
import { Tooltip, TooltipTrigger, TooltipContent } from '@renderer/components/ui/tooltip'
import { Button } from '@renderer/components/ui/button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '@renderer/components/ui/alert-dialog'

type Props = { id: string }

export default function CardItem({ id }: Props): ReactNode {
  const { cards, removeCard } = useGridStore()
  const cfg = cards[id]
  const [isFull, setIsFull] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const webviewRef = useRef<Electron.WebviewTag | null>(null)
  const [editing, setEditing] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [draft, setDraft] = useState({
    name: cfg?.name || '',
    url: cfg?.url || '',
    refreshInterval: cfg?.refreshInterval || 300,
    accessMode: cfg?.accessMode || 'pc',
    targetSelector: cfg?.targetSelector || ''
  })

  useEffect(() => {
    // sync draft when cfg changes
    setDraft({
      name: cfg?.name || '',
      url: cfg?.url || '',
      refreshInterval: cfg?.refreshInterval || 300,
      accessMode: cfg?.accessMode || 'pc',
      targetSelector: cfg?.targetSelector || ''
    })
  }, [cfg])

  useEffect(() => {
    if (!webviewRef.current) return
    const wv = webviewRef.current

    if (wv) {
      const u = cfg.url.trim()
      const url = !isValidUrl(u) ? getSearchUrl(u) : normalizeUrl(u)
      wv.src = url
      const ua = cfg?.accessMode === 'mobile' ? UA_MOBILE : UA_PC
      wv.useragent = ua
      wv.partition = `persist:gridcard-${id}`
      wv.allowpopups = true
    }
    const onDomReady = (): void => {
      setError(null)
      if (cfg?.targetSelector) {
        wv.executeJavaScript(highlightSelectorScript(cfg.targetSelector)).catch(() => {})
      }
    }
    const onFail = (): void => {
      setError('加载失败')
    }
    wv.addEventListener('dom-ready', onDomReady)
    wv.addEventListener('did-fail-load', onFail)
    return () => {
      wv.removeEventListener('dom-ready', onDomReady)
      wv.removeEventListener('did-fail-load', onFail)
    }
  }, [cfg])

  useEffect(() => {
    if (!cfg) return
    const id = window.setInterval(
      () => {
        webviewRef.current?.reload()
      },
      (cfg.refreshInterval || 300) * 1000
    )
    return () => clearInterval(id)
  }, [cfg?.refreshInterval])

  const onRefresh = (): void => {
    webviewRef.current?.reload()
  }
  const onCopy = async (): Promise<void> => {
    const data = JSON.stringify(cfg)
    await navigator.clipboard.writeText(data)
  }
  const onDelete = (): void => setConfirmOpen(true)
  const confirmDelete = (): void => {
    removeCard(id)
    setConfirmOpen(false)
  }

  return (
    <div
      className={`group/card relative h-full w-full overflow-hidden rounded-lg border transition-all ${isFull ? 'z-50 fixed inset-0' : ''}`}
    >
      {/* Toolbar */}
      <div className="absolute p-2 z-10 flex justify-between w-full align-center opacity-0 pointer-events-none transition-opacity duration-200 group-hover/card:opacity-100 group-hover/card:pointer-events-auto focus-within:opacity-100 focus-within:pointer-events-auto">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon-sm" data-grid-drag-handle aria-label="拖拽移动">
              <IconGripVertical size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>拖拽以移动卡片</TooltipContent>
        </Tooltip>

        <div className="pointer-events-auto flex items-center gap-2 bg-background/70 backdrop-blur-sm border rounded-md px-2 py-1">
          <Button variant="outline" size="icon-sm" aria-label="刷新" onClick={onRefresh}>
            <IconReload />
          </Button>
          <Button variant="outline" size="icon-sm" aria-label="复制配置" onClick={onCopy}>
            <IconCopy />
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="编辑"
                onClick={() => setEditing(true)}
              >
                <IconPencil />
              </Button>
            </TooltipTrigger>
            <TooltipContent>编辑卡片</TooltipContent>
          </Tooltip>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="全屏"
            onClick={() => setIsFull((v) => !v)}
          >
            {isFull ? <IconArrowsMinimize /> : <IconArrowsMaximize />}
          </Button>
          <Button variant="destructive" size="icon-sm" aria-label="删除" onClick={onDelete}>
            <IconTrash />
          </Button>
        </div>
      </div>

      {/* Delete confirm dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除卡片</AlertDialogTitle>
            <AlertDialogDescription>确认删除该卡片？此操作不可撤销。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmOpen(false)}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Error / offline banner */}
      {error && (
        <div className="absolute inset-x-0 top-0 z-10 bg-destructive/10 text-destructive px-3 py-1 text-xs">
          {error}，正在自动重试…
        </div>
      )}

      {/* WebView content */}
      <webview ref={webviewRef} className="h-full w-full" />

      {/* Edit sheet */}
      <Sheet open={editing} onOpenChange={setEditing}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>编辑卡片</SheetTitle>
            <SheetDescription>配置站点信息及刷新策略。</SheetDescription>
          </SheetHeader>
          <div className="grid gap-3 py-4">
            <label className="text-sm">网站名称</label>
            <Input
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value.slice(0, 32) }))}
            />
            <label className="text-sm">网站 URL</label>
            <Input
              aria-invalid={!isValidUrl(draft.url)}
              value={draft.url}
              onChange={(e) => setDraft((d) => ({ ...d, url: e.target.value }))}
            />
            <label className="text-sm">刷新间隔（秒）</label>
            <Input
              type="number"
              min={10}
              step={10}
              value={draft.refreshInterval}
              onChange={(e) => setDraft((d) => ({ ...d, refreshInterval: Number(e.target.value) }))}
            />
            <label className="text-sm">访问模式</label>
            <select
              className="border rounded px-2 py-1"
              value={draft.accessMode}
              onChange={(e) =>
                setDraft((d) => ({ ...d, accessMode: e.target.value as Grid.AccessMode }))
              }
            >
              <option value="pc">PC</option>
              <option value="mobile">移动端</option>
            </select>
            <label className="text-sm">目标选择器（可选）</label>
            <Input
              value={draft.targetSelector}
              onChange={(e) => setDraft((d) => ({ ...d, targetSelector: e.target.value }))}
            />
          </div>
          <div className="mt-4 flex items-center justify-end gap-2">
            <SheetClose asChild>
              <Button variant="outline">取消</Button>
            </SheetClose>
            <SheetClose asChild>
              <Button
                onClick={() => {
                  if (!cfg) return
                  if (!isValidUrl(draft.url)) return
                  const next = { ...cfg, ...draft, id }
                  useGridStore.getState().upsertCard(next)
                }}
              >
                保存
              </Button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
