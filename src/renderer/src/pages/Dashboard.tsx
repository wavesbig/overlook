import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage
} from '@renderer/components/ui/breadcrumb'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@renderer/components/ui/tabs'
import { Card, CardHeader, CardContent } from '@renderer/components/ui/card'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from '@renderer/components/ui/table'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@renderer/components/ui/chart'
import { CalendarIcon, DownloadIcon, Columns2Icon, PlusIcon } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

const chartData = [
  { month: 'Jan', revenue: 186 },
  { month: 'Feb', revenue: 305 },
  { month: 'Mar', revenue: 237 },
  { month: 'Apr', revenue: 73 },
  { month: 'May', revenue: 209 },
  { month: 'Jun', revenue: 214 },
  { month: 'Jul', revenue: 256 },
  { month: 'Aug', revenue: 312 },
  { month: 'Sep', revenue: 289 },
  { month: 'Oct', revenue: 341 },
  { month: 'Nov', revenue: 372 },
  { month: 'Dec', revenue: 398 }
]

const chartConfig = {
  views: { label: '浏览量', color: 'hsl(var(--chart-1))' },
  visits: { label: '访问量', color: 'hsl(var(--chart-2))' }
}

const recentSales = [
  { name: 'Liam Johnson', email: 'liam@example.com', amount: 250, status: 'Paid' },
  { name: 'Olivia Martin', email: 'olivia@example.com', amount: 150, status: 'Refunded' },
  { name: 'Noah Wilson', email: 'noah@example.com', amount: 350, status: 'Paid' },
  { name: 'Emma Thompson', email: 'emma@example.com', amount: 450, status: 'Paid' },
  { name: 'William Garcia', email: 'william@example.com', amount: 75, status: 'Pending' }
]

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      {/* 顶部：面包屑 + 操作区 */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Breadcrumb className="text-sm">
            <BreadcrumbItem>
              <BreadcrumbLink href="#">应用</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbPage>仪表盘</BreadcrumbPage>
            </BreadcrumbItem>
          </Breadcrumb>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">仪表盘</h1>
          <p className="text-muted-foreground">包含图表与数据表格的管理视图。</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <Input placeholder="搜索…" className="w-48" />
            <Button variant="outline" className="gap-2">
              <CalendarIcon className="h-4 w-4" />
              本月
            </Button>
          </div>
          <Button className="gap-2">
            <DownloadIcon className="h-4 w-4" /> 导出
          </Button>
        </div>
      </div>

      {/* 图表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">流量趋势</span>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[220px] w-full">
            <ResponsiveContainer>
              <AreaChart data={chartData} margin={{ left: 12, right: 12 }}>
                <defs>
                  <linearGradient id="gradient-views" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-views)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--color-views)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradient-visits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-visits)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-visits)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <Tooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="var(--color-views)"
                  fill="url(#gradient-views)"
                />
                <Area
                  type="monotone"
                  dataKey="visits"
                  stroke="var(--color-visits)"
                  fill="url(#gradient-visits)"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* 图表下的选项卡 */}
      <Tabs defaultValue="outline" className="w-full">
        <TabsList>
          <TabsTrigger value="outline">Outline</TabsTrigger>
          <TabsTrigger value="performance">Past Performance</TabsTrigger>
          <TabsTrigger value="personnel">Key Personnel</TabsTrigger>
          <TabsTrigger value="documents">Focus Documents</TabsTrigger>
        </TabsList>
        <TabsContent value="outline" />
        <TabsContent value="performance" />
        <TabsContent value="personnel" />
        <TabsContent value="documents" />
      </Tabs>

      {/* 操作栏 */}
      <div className="flex items-center justify-between">
        <div />
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Columns2Icon className="h-4 w-4" />
            Customize Columns
          </Button>
          <Button className="gap-2">
            <PlusIcon className="h-4 w-4" />
            Add Section
          </Button>
        </div>
      </div>

      {/* 数据表格 */}
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Section Title</TableHead>
                <TableHead>Section Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Limit</TableHead>
                <TableHead>Reviewer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentSales.map((sale, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{sale.name}</TableCell>
                  <TableCell className="text-muted-foreground">Narrative</TableCell>
                  <TableCell>{sale.status}</TableCell>
                  <TableCell>{Math.floor(sale.amount / 10)}</TableCell>
                  <TableCell>{Math.floor(sale.amount / 8)}</TableCell>
                  <TableCell>{sale.email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* 分页与统计 */}
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <div>0 of 68 row(s) selected.</div>
            <div className="flex items-center gap-2">
              <span>Rows per page</span>
              <span className="text-foreground">10</span>
              <span>Page 1 of 7</span>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon-sm">
                  «
                </Button>
                <Button variant="outline" size="icon-sm">
                  ‹
                </Button>
                <Button variant="outline" size="icon-sm">
                  ›
                </Button>
                <Button variant="outline" size="icon-sm">
                  »
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
