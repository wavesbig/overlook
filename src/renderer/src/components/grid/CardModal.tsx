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
  AlertDialogCancel
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
  IconTarget,
  IconZoomIn,
  IconZoomOut
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
    // 允许不带协议的域名或路径，和运行时的 isValidUrl 保持一致
    url: z.string().refine((val) => isValidUrl(val), { message: 'URL格式不正确' }),
    refreshInterval: z.number().int().min(10, '至少10秒'),
    accessMode: z.enum(['pc', 'mobile']),
    targetSelector: z.string().optional(),
    zoomFactor: z.number().min(0.5, '至少 50%').max(3, '最多 300%').optional()
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      name: cfg?.name || '',
      url: cfg?.url || '',
      refreshInterval: cfg?.refreshInterval ?? 300,
      accessMode: (cfg?.accessMode ?? 'pc') as Grid.AccessMode,
      targetSelector: cfg?.targetSelector || '',
      zoomFactor: cfg?.zoomFactor ?? 1
    }
  })

  useEffect(() => {
    if (mode === 'edit' && cfg) {
      form.reset({
        name: cfg.name || '',
        url: cfg.url || '',
        refreshInterval: cfg.refreshInterval ?? 300,
        accessMode: (cfg.accessMode ?? 'pc') as Grid.AccessMode,
        targetSelector: cfg.targetSelector || '',
        zoomFactor: cfg.zoomFactor ?? 1
      })
    } else if (mode === 'add') {
      form.reset({
        name: '',
        url: '',
        refreshInterval: 300,
        accessMode: 'pc',
        targetSelector: '',
        zoomFactor: 1
      })
    }
  }, [mode, cfg])

  const onSubmit = (values: z.infer<typeof formSchema>): void => {
    if (!isValidUrl(values.url) || !values.name.trim()) return
    if (mode === 'add') {
      const id = `card-${crypto.randomUUID()}`
      const next = { id, ...values } as Grid.CardConfig
      const items = [
        ...(currentLayout?.items ?? []),
        { i: id, x: 0, y: 0, w: 8, h: 20, config: next }
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
                    <FormDescription>
                      只展示选择器命中的区域；留空显示整页。示例：#main .list
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="zoomFactor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm flex items-center gap-1">
                      <IconZoomIn className="size-4 text-muted-foreground" /> 页面缩放
                    </FormLabel>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label="缩小"
                        onClick={() => field.onChange(Math.max(0.5, (field.value ?? 1) - 0.05))}
                      >
                        <IconZoomOut size={16} />
                      </Button>
                      <FormControl>
                        <Input
                          type="range"
                          min={50}
                          max={300}
                          step={5}
                          className="w-40"
                          value={Math.round((field.value ?? 1) * 100)}
                          onChange={(e) => field.onChange(Number(e.target.value) / 100)}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label="放大"
                        onClick={() => field.onChange(Math.min(3, (field.value ?? 1) + 0.05))}
                      >
                        <IconZoomIn size={16} />
                      </Button>
                      <span className="w-10 text-right text-xs tabular-nums">
                        {Math.round((field.value ?? 1) * 100)}%
                      </span>
                    </div>
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
              {/* Use a plain submit button so the dialog doesn't auto-close before submit */}
              <Button type="submit" disabled={!form.formState.isValid}>
                保存
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
