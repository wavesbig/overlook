import { ReactNode } from 'react'

export default function Analytics(): ReactNode {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Analytics</h1>
      <p className="text-muted-foreground">分析/报表视图（占位页面）。</p>
    </div>
  )
}