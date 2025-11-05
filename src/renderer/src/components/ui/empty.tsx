import * as React from 'react'
import { cn } from '@renderer/lib/utils'
import { IconLayoutGridAdd } from '@tabler/icons-react'

type EmptyProps = {
  title?: string
  description?: string
  className?: string
  children?: React.ReactNode
}

export function Empty({ title = '暂无数据', description, className, children }: EmptyProps) {
  return (
    <div
      data-slot="empty"
      className={cn(
        'bg-muted/20 text-muted-foreground flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16',
        className
      )}
    >
      <div className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
        <IconLayoutGridAdd className="size-6" />
      </div>
      <div className="text-center">
        <div className="text-foreground text-base font-medium">{title}</div>
        {description && <div className="text-muted-foreground mt-1 text-sm">{description}</div>}
      </div>
      {children && <div className="mt-1">{children}</div>}
    </div>
  )
}

export default Empty