import { ReactNode } from 'react'

export default function Settings(): ReactNode {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">设置</h1>
      <p className="text-muted-foreground">在此配置应用设置。</p>
    </div>
  )
}
