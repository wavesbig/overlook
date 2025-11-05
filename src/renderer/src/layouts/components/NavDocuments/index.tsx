import { ReactNode, useState } from 'react'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
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
import { IconDots, IconDotsVertical, IconPencil, IconTrash } from '@tabler/icons-react'
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

export default function NavDocuments(): ReactNode {
  const { layouts, currentLayoutId, switchLayout, renameLayout, deleteLayout } = useGridStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [renameText, setRenameText] = useState('')

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
    setEditingId(id)
    setDeleteOpen(true)
  }
  const confirmDelete = (): void => {
    if (!editingId) return
    deleteLayout(editingId)
    setDeleteOpen(false)
    setEditingId(null)
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>布局</SidebarGroupLabel>
      <SidebarMenu>
        {layouts.map((l) => (
          <SidebarMenuItem key={l.id}>
            <SidebarMenuButton
              tooltip={l.name}
              isActive={l.id === currentLayoutId}
              onClick={editingId === l.id ? undefined : () => switchLayout(l.id)}
            >
              {editingId === l.id ? (
                <Input
                  autoFocus
                  value={renameText}
                  maxLength={32}
                  className="h-7 px-2 text-sm"
                  onChange={(e) => setRenameText(e.target.value)}
                  onBlur={confirmRename}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') confirmRename()
                    if (e.key === 'Escape') cancelRename()
                  }}
                />
              ) : (
                <span className="truncate max-w-[180px]">{l.name}</span>
              )}
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
      </SidebarMenu>

      {/* Delete confirm dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除布局</AlertDialogTitle>
            <AlertDialogDescription>确认删除该布局？此操作不可撤销。</AlertDialogDescription>
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
