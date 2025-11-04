import { ReactNode } from 'react'

export default function Team(): ReactNode {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Team</h1>
      <p className="text-muted-foreground">团队与成员管理（占位页面）。</p>
    </div>
  )
}