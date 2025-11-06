import { ReactNode, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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
  IconGripVertical,
  IconLink
} from '@tabler/icons-react'
import CardModal from './CardModal'
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
  const { currentLayout, removeCard } = useGridStore()
  const cfg = currentLayout?.items.find((it) => it.i === id)?.config

  const [isFull, setIsFull] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const webviewRef = useRef<Electron.WebviewTag | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [editing, setEditing] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  // Re-init webview when config changes or fullscreen toggles (portal remount)
  useEffect(() => {
    if (!webviewRef.current || !cfg) return
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
  }, [cfg, isFull])

  // Track visibility of the card to avoid refreshing when off-screen
  useEffect(() => {
    if (!containerRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.2 }
    )
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!cfg) return
    const intervalSec = cfg.refreshInterval ?? 300
    if (!intervalSec || intervalSec <= 0) return
    const tick = (): void => {
      if (document.hidden) return
      if (!isVisible) return
      webviewRef.current?.reload()
    }
    const id = window.setInterval(tick, intervalSec * 1000)
    return () => clearInterval(id)
  }, [cfg?.refreshInterval, isVisible])

  const onRefresh = (): void => {
    webviewRef.current?.reload()
  }
  const onCopy = async (): Promise<void> => {
    if (!cfg) return
    const data = JSON.stringify(cfg)
    await navigator.clipboard.writeText(data)
  }
  const onDelete = (): void => setConfirmOpen(true)
  const confirmDelete = (): void => {
    removeCard(id)
    setConfirmOpen(false)
  }

  const cardContent = (
    <div
      ref={containerRef}
      className={`group/card ${isFull ? 'fixed inset-0 z-1000 bg-background' : 'relative rounded-lg border'} h-full w-full overflow-hidden transition-all`}
    >
      {/* Toolbar */}
      <div className="absolute p-2 z-10 flex justify-between w-full align-center opacity-0 pointer-events-none transition-opacity duration-200 group-hover/card:opacity-100 group-hover/card:pointer-events-auto focus-within:opacity-100 focus-within:pointer-events-auto">
        <div className="pointer-events-auto flex items-center  bg-background/70 backdrop-blur-sm border rounded-md p-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon-sm" data-grid-drag-handle aria-label="拖拽移动">
                <IconGripVertical size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>拖拽以移动卡片</TooltipContent>
          </Tooltip>
          {cfg?.name && (
            <span
              className="ml-2 flex items-center max-w-[48ch] truncate text-sm font-semibold text-foreground px-2"
              title={cfg.name}
            >
              <IconLink size={14} className="mr-1" />
              {cfg.name}
            </span>
          )}
        </div>

        <div className="pointer-events-auto flex items-center gap-2 bg-background/70 backdrop-blur-sm border rounded-md p-1">
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
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="全屏"
                onClick={() => setIsFull((v) => !v)}
              >
                {isFull ? <IconArrowsMinimize /> : <IconArrowsMaximize />}
                <TooltipContent>{isFull ? '退出全屏' : '全屏显示'}</TooltipContent>
              </Button>
            </TooltipTrigger>
          </Tooltip>
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

      {/* Edit modal */}
      {cfg && editing && (
        <CardModal mode="edit" open={editing} onOpenChange={setEditing} cfg={cfg} />
      )}
    </div>
  )

  // 当 isFull=true 时，通过 Portal 将卡片渲染到 document.body，避免被 react-grid-layout 的 transform 限制
  return isFull ? createPortal(cardContent, document.body) : cardContent
}
