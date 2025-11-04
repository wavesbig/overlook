import { ReactNode } from 'react'
import { Button } from '@renderer/components/ui/button'
import { Card, CardContent, CardHeader } from '@renderer/components/ui/card'

export default function Layouts(): ReactNode {
  return (
    <div className="flex flex-col gap-6">
      {/* 顶部：标题 + 添加布局按钮 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">布局管理</h1>
          <p className="text-muted-foreground">管理应用的页面布局与模块编排。</p>
        </div>
        <Button className="gap-2">
          {/* 可替换为实际图标 */}
          <span className="font-medium">添加布局</span>
        </Button>
      </div>

      {/* 列表占位 */}
      <Card>
        <CardHeader>
          <div className="text-sm text-muted-foreground">已有布局</div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">暂无数据，点击右上角“添加布局”创建。</div>
        </CardContent>
      </Card>
    </div>
  )
}