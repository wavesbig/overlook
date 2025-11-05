import { ReactNode, useState } from 'react'
import { Card, CardContent, CardHeader } from '@renderer/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@renderer/components/ui/toggle-group'
import { Label } from '@renderer/components/ui/label'
import { setTheme, getStoredTheme, type ThemeMode } from '@renderer/lib/theme'
import { IconSun, IconMoon, IconDeviceDesktop } from '@tabler/icons-react'
// import { Input } from '@renderer/components/ui/input'

export default function Settings(): ReactNode {
  const [theme, setThemeState] = useState<ThemeMode>(() => getStoredTheme())
  // const [radius, setRadius] = useState<number>(() => {
  //   const saved = localStorage.getItem('overlook-radius')
  //   return saved ? Number(saved) : 0.65
  // })

  // useEffect(() => {
  //   // Apply radius variable
  //   document.documentElement.style.setProperty('--radius', `${radius}rem`)
  //   localStorage.setItem('overlook-radius', String(radius))
  // }, [radius])

  const onThemeChange = (val: string | undefined): void => {
    if (!val) return
    const m = val as ThemeMode
    setThemeState(m)
    setTheme(m)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 顶部：标题 */}
      <div>
        <h1 className="text-2xl font-semibold">设置</h1>
        <p className="text-muted-foreground">配置常用设置，如主题模式与外观。</p>
      </div>

      {/* 外观设置 */}
      <Card>
        <CardHeader>
          <div className="text-base font-medium">外观</div>
          {/* <div className="text-muted-foreground text-sm">选择主题模式与圆角大小</div> */}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Label>主题模式</Label>
              <ToggleGroup
                type="single"
                value={theme}
                onValueChange={onThemeChange}
                spacing={0}
                variant="outline"
              >
                <ToggleGroupItem value="light">
                  <IconSun /> 浅色
                </ToggleGroupItem>
                <ToggleGroupItem value="dark">
                  <IconMoon /> 深色
                </ToggleGroupItem>
                <ToggleGroupItem value="system">
                  <IconDeviceDesktop /> 跟随系统
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* <div className="flex items-center gap-3">
              <Label>圆角大小</Label>
              <Input
                type="range"
                min={0.4}
                max={1}
                step={0.01}
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
              />
              <span className="text-xs text-muted-foreground w-12">{radius.toFixed(2)}rem</span>
            </div> */}
          </div>
        </CardContent>
      </Card>

      {/* 布局设置（占位） */}
      {/* <Card>
        <CardHeader>
          <div className="text-base font-medium">布局</div>
          <div className="text-muted-foreground text-sm">后续可在此配置侧边栏与网格布局行为</div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">目前暂无更多可配置项。</div>
        </CardContent>
      </Card> */}
    </div>
  )
}
