import { ReactNode } from 'react'
import { Responsive, WidthProvider, Layout, CompactType } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { GridLayoutItem } from '@renderer/store/grid'

const ResponsiveGridLayout = WidthProvider(Responsive)

export interface CardGridProps {
  items: GridLayoutItem[]
  onLayoutChange: (items: GridLayoutItem[]) => void
  renderItem: (item: GridLayoutItem) => ReactNode
  breakpoints?: { [key: string]: number }
  cols?: { [key: string]: number }
  rowHeight?: number
  margin?: [number, number]
  compactType?: CompactType | null
  preventCollision?: boolean
  draggableHandle?: string
  className?: string
}

export default function CardGrid({
  items,
  onLayoutChange,
  renderItem,
  breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
  cols = { lg: 12, md: 10, sm: 8, xs: 6, xxs: 4 },
  rowHeight = 24,
  margin = [8, 8],
  compactType = null,
  preventCollision = true,
  draggableHandle = '[data-grid-drag-handle]',
  className = 'layout'
}: CardGridProps): ReactNode {
  const handleLayoutChange = (_: Layout[], all: { [key: string]: Layout[] }): void => {
    const lg = all.lg || []
    const next: GridLayoutItem[] = lg.map((l) => ({ i: l.i, x: l.x, y: l.y, w: l.w, h: l.h }))
    onLayoutChange(next)
  }

  return (
    <ResponsiveGridLayout
      className={className}
      layouts={{ lg: items as unknown as Layout[] }}
      breakpoints={breakpoints}
      cols={cols}
      rowHeight={rowHeight}
      margin={margin}
      compactType={compactType}
      preventCollision={preventCollision}
      draggableHandle={draggableHandle}
      onLayoutChange={handleLayoutChange}
    >
      {items.map((it) => (
        <div key={it.i} data-grid={it}>
          {renderItem(it)}
        </div>
      ))}
    </ResponsiveGridLayout>
  )
}
