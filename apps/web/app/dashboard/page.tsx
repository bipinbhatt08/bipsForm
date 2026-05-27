"use client"

import * as React from "react"
import Link from "next/link"
import { IconChartBar, IconFileDescription, IconLoader2, IconUsers } from "@tabler/icons-react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { useGetDashboardStats } from "~/hooks/api/submission"

export default function DashboardPage() {
  const { stats, isLoading } = useGetDashboardStats()

  const chartData = React.useMemo(() => {
    if (!stats) return []
    return stats.dailySubmissions.map((s) => ({
      date: new Date(s.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      responses: s.count,
    }))
  }, [stats])

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6 lg:px-6">

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center py-24">
          <IconLoader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Forms</p>
                  <p className="text-4xl font-bold tabular-nums">{stats?.totalForms ?? 0}</p>
                  <p className="text-xs text-muted-foreground">{stats?.publishedForms ?? 0} published</p>
                </div>
                <div className="rounded-xl bg-primary/10 p-3">
                  <IconFileDescription className="size-6 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Responses</p>
                  <p className="text-4xl font-bold tabular-nums">{(stats?.totalSubmissions ?? 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Across all forms</p>
                </div>
                <div className="rounded-xl bg-primary/10 p-3">
                  <IconUsers className="size-6 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-muted-foreground">Active Days</p>
                  <p className="text-4xl font-bold tabular-nums">{stats?.dailySubmissions.filter(d => d.count > 0).length ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Days with responses</p>
                </div>
                <div className="rounded-xl bg-primary/10 p-3">
                  <IconChartBar className="size-6 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Area chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Responses over time</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                  <IconChartBar className="size-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No responses yet. Share your forms to get started.</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/forms">Go to Forms</Link>
                  </Button>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="dashAreaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0891B2" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0891B2" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.3} stroke="#888" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} width={28} />
                    <Tooltip
                      cursor={{ stroke: "#0891B2", strokeWidth: 1, strokeDasharray: "4 4" }}
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13, color: "hsl(var(--foreground))" }}
                      formatter={(val) => [val, "Responses"]}
                    />
                    <Area dataKey="responses" type="monotone" stroke="#0891B2" strokeWidth={2} fill="url(#dashAreaGradient)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Top forms */}
          {(stats?.topForms?.length ?? 0) > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Top forms by responses</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {stats!.topForms.map((form, i) => (
                    <div key={form.id} className="flex items-center justify-between gap-4 px-6 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs tabular-nums text-muted-foreground w-4 shrink-0">{i + 1}</span>
                        <Link href={`/dashboard/forms/${form.id}`} className="text-sm font-medium truncate hover:underline underline-offset-2">
                          {form.title}
                        </Link>
                      </div>
                      <Badge variant="secondary" className="shrink-0 tabular-nums">
                        {form.submissions} {form.submissions === 1 ? "response" : "responses"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
