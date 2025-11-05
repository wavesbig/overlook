import { ReactNode, useState } from 'react'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarGroupAction,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
  SidebarInput,
  useSidebar
} from '@renderer/components/ui/sidebar'
import { useGridStore } from '@renderer/store/grid'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'
import {
  IconDots,
  IconPencil,
  IconTrash,
  IconLayoutGrid,
  IconX,
  IconTablePlus
} from '@tabler/icons-react'
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
import { Input } from '@renderer/components/ui/input'
import { Button } from '@renderer/components/ui/button'

export default function NavDocuments(): ReactNode {
  const { layouts, currentLayoutId, switchLayout, renameLayout, deleteLayout, createLayout } =
    useGridStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [renameText, setRenameText] = useState('')
  const [filter, setFilter] = useState('')

  const { isMobile } = useSidebar()

  const startRename = (id: string, name: string): void => {
    setEditingId(id)
    setRenameText(name)
  }
  const confirmRename = (): void => {
    if (!editingId) return
    const name = renameText.trim() || '未命名布局'
    renameLayout(editingId, name)
    setEditingId(null)
  }
  const cancelRename = (): void => {
    setEditingId(null)
  }
  const startDelete = (id: string): void => {
    setDeletingId(id)
    setDeleteOpen(true)
  }
  const confirmDelete = (): void => {
    if (!deletingId) return
    deleteLayout(deletingId)
    setDeleteOpen(false)
    setDeletingId(null)
  }

  const filtered = filter.trim()
    ? layouts.filter((l) => l.name.toLowerCase().includes(filter.trim().toLowerCase()))
    : layouts

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>
        布局
        <span className="ml-1 text-muted-foreground">({layouts.length})</span>
      </SidebarGroupLabel>
      <SidebarGroupAction
        aria-label="快速创建布局"
        title="快速创建布局"
        onClick={() => createLayout('新布局')}
      >
        <IconTablePlus />
      </SidebarGroupAction>

      <SidebarGroupContent className="mb-3">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <SidebarInput
              placeholder="筛选布局…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            {filter && (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="清除筛选"
                onClick={() => setFilter('')}
              >
                <IconX className="size-4" />
              </Button>
            )}
          </div>
          <Button
            variant="default"
            size="sm"
            className="w-full justify-start"
            onClick={() => createLayout('新布局')}
          >
            <IconTablePlus />
            <span>新建布局</span>
          </Button>
        </div>
      </SidebarGroupContent>

      <SidebarMenu>
        {filtered.map((l) => (
          <SidebarMenuItem key={l.id}>
            <SidebarMenuButton
              tooltip={l.name}
              isActive={l.id === currentLayoutId}
              onClick={editingId === l.id ? undefined : () => switchLayout(l.id)}
            >
              <span className="text-muted-foreground mr-2">
                <IconLayoutGrid className="size-4" />
              </span>
              <div className="flex-1 mr-2 min-w-0">
                {editingId === l.id ? (
                  <Input
                    autoFocus
                    value={renameText}
                    maxLength={32}
                    className="h-7 px-2 text-sm w-full"
                    onChange={(e) => setRenameText(e.target.value)}
                    onBlur={cancelRename}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') confirmRename()
                      if (e.key === 'Escape') cancelRename()
                    }}
                  />
                ) : (
                  <span className="truncate">{l.name}</span>
                )}
              </div>
              <span className="ml-auto text-xs text-muted-foreground">{l.items?.length ?? 0}</span>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover className="data-[state=open]:bg-accent rounded-sm">
                  <IconDots />
                  <span className="sr-only">更多操作</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-24 rounded-lg"
                side={isMobile ? 'bottom' : 'right'}
                align={isMobile ? 'end' : 'start'}
              >
                <DropdownMenuItem onClick={() => startRename(l.id, l.name)}>
                  <IconPencil className="size-4" />
                  <span>重命名</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => startDelete(l.id)}>
                  <IconTrash />
                  <span>删除</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        {filtered.length === 0 && (
          <SidebarMenuItem>
            <div className="text-muted-foreground text-xs px-2 py-1">无匹配布局</div>
          </SidebarMenuItem>
        )}
        {layouts.length === 0 && !filter && (
          <SidebarMenuItem>
            <div className="text-muted-foreground text-xs px-2 py-1">
              暂无布局，点击右上角 + 创建
            </div>
          </SidebarMenuItem>
        )}
      </SidebarMenu>

      {/* Delete confirm dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除布局</AlertDialogTitle>
            <AlertDialogDescription>
              确认删除：
              {layouts.find((x) => x.id === deletingId)?.name ?? '该布局'}（
              {layouts.find((x) => x.id === deletingId)?.items?.length ?? 0} 项）？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteOpen(false)}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarGroup>
  )
}
