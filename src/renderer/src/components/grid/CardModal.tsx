import { ReactNode, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { ToggleGroup, ToggleGroupItem } from '@renderer/components/ui/toggle-group'
import { Label } from '@renderer/components/ui/label'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage
} from '@renderer/components/ui/form'
import {
  IconClock,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconLink,
  IconTarget
} from '@tabler/icons-react'
import { useGridStore } from '@renderer/store/grid'
import { isValidUrl } from '@renderer/lib/webview'

type Mode = 'add' | 'edit'

type Props = {
  mode: Mode
  open: boolean
  onOpenChange: (open: boolean) => void
  cfg?: Grid.CardConfig
}

export default function CardModal({ mode, open, onOpenChange, cfg }: Props): ReactNode {
  const { currentLayout, upsertCard, updateLayoutItems } = useGridStore()
  const formSchema = z.object({
    name: z.string().min(1, '请填写名称').max(32, '最多32个字符'),
    url: z.string().refine(
      (val) => {
        try {
          new URL(val)
          return true
        } catch {
          return false
        }
      },
      { message: 'URL格式不正确' }
    ),
    refreshInterval: z.number().int().min(10, '至少10秒'),
    accessMode: z.enum(['pc', 'mobile']),
    targetSelector: z.string().optional()
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      name: cfg?.name || '',
      url: cfg?.url || '',
      refreshInterval: cfg?.refreshInterval ?? 300,
      accessMode: (cfg?.accessMode ?? 'pc') as Grid.AccessMode,
      targetSelector: cfg?.targetSelector || ''
    }
  })

  useEffect(() => {
    if (mode === 'edit' && cfg) {
      form.reset({
        name: cfg.name || '',
        url: cfg.url || '',
        refreshInterval: cfg.refreshInterval ?? 300,
        accessMode: (cfg.accessMode ?? 'pc') as Grid.AccessMode,
        targetSelector: cfg.targetSelector || ''
      })
    } else if (mode === 'add') {
      form.reset({ name: '', url: '', refreshInterval: 300, accessMode: 'pc', targetSelector: '' })
    }
  }, [mode, cfg])

  const onSubmit = (values: z.infer<typeof formSchema>): void => {
    if (!isValidUrl(values.url) || !values.name.trim()) return
    if (mode === 'add') {
      const id = `card-${crypto.randomUUID()}`
      const next = { id, ...values } as Grid.CardConfig
      const items = [
        ...(currentLayout?.items ?? []),
        { i: id, x: 0, y: 0, w: 6, h: 8, config: next }
      ]
      updateLayoutItems(items)
    } else if (mode === 'edit' && cfg) {
      const next = { ...cfg, ...values }
      upsertCard(next)
    }
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{mode === 'add' ? '添加卡片' : '编辑卡片'}</AlertDialogTitle>
          <AlertDialogDescription>
            {mode === 'add' ? '填写站点信息以添加到看板。' : '配置站点信息及刷新策略。'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <FormField
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm flex items-center gap-1">
                      <IconLink className="size-4 text-muted-foreground" /> 网站名称
                    </FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={32} placeholder="例如：React 官网" />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm flex items-center gap-1">
                      <IconLink className="size-4 text-muted-foreground" /> 网站 URL
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        aria-invalid={!isValidUrl(field.value)}
                        placeholder="https://example.com"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="refreshInterval"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm flex items-center gap-1">
                      <IconClock className="size-4 text-muted-foreground" /> 刷新间隔（秒）
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={10}
                        step={10}
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <IconClock size={14} /> 快速选择：
                      </span>
                      <ToggleGroup
                        type="single"
                        value={String(field.value)}
                        onValueChange={(val) => val && field.onChange(Number(val))}
                        spacing={0}
                        variant="outline"
                        size="sm"
                      >
                        <ToggleGroupItem value="10">10s</ToggleGroupItem>
                        <ToggleGroupItem value="30">30s</ToggleGroupItem>
                        <ToggleGroupItem value="60">1m</ToggleGroupItem>
                        <ToggleGroupItem value="300">5m</ToggleGroupItem>
                        <ToggleGroupItem value="600">10m</ToggleGroupItem>
                        <ToggleGroupItem value="3600">1h</ToggleGroupItem>
                        <ToggleGroupItem value="18000">5h</ToggleGroupItem>
                        <ToggleGroupItem value="86400">1天</ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="accessMode"
                render={({ field }) => (
                  <FormItem>
                    <Label className="text-sm">访问模式</Label>
                    <FormControl>
                      <ToggleGroup
                        type="single"
                        value={field.value}
                        onValueChange={(val) => val && field.onChange(val)}
                        spacing={0}
                        variant="outline"
                      >
                        <ToggleGroupItem value="pc">
                          <IconDeviceDesktop /> PC
                        </ToggleGroupItem>
                        <ToggleGroupItem value="mobile">
                          <IconDeviceMobile /> 移动端
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="targetSelector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm flex items-center gap-1">
                      <IconTarget className="size-4 text-muted-foreground" /> 目标选择器（可选）
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>用于聚焦页面特定区域，比如某个列表或卡片容器</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button type="button" variant="outline">
                  取消
                </Button>
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button type="submit" disabled={!form.formState.isValid}>
                  保存
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
