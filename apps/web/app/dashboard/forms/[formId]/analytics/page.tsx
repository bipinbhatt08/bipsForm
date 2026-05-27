"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { IconArrowLeft, IconChartBar, IconLoader2, IconUsers } from "@tabler/icons-react"
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { useGetFormFields, useGetForms } from "~/hooks/api/form"
import { useGetFormAnalytics, useGetFormSubmissions } from "~/hooks/api/submission"

const STAR_PATH = "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"

function StarRating({ average, maxRating, size = 28 }: { average: number; maxRating: number; size?: number }) {
  const gap = 6
  const totalWidth = maxRating * size + (maxRating - 1) * gap
  const filledWidth = (average / maxRating) * totalWidth
  return (
    <div className="relative flex" style={{ width: totalWidth, height: size, gap }}>
      {Array.from({ length: maxRating }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24">
          <path d={STAR_PATH} fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      ))}
      <div className="absolute inset-0 overflow-hidden" style={{ width: filledWidth }}>
        <div className="flex" style={{ gap, width: totalWidth }}>
          {Array.from({ length: maxRating }).map((_, i) => (
            <svg key={i} width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <path d={STAR_PATH} fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          ))}
        </div>
      </div>
    </div>
  )
}

const PIE_COLORS = [
  "#0891B2",
  "#06B6D4",
  "#22d3ee",
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#f43f5e",
  "#8b5cf6",
]


export default function AnalyticsPage() {
  const params = useParams()
  const router = useRouter()
  const formId = params.formId as string

  const { forms, isLoading: isLoadingForms } = useGetForms()
  const form = forms.find((f) => f.id === formId)
  const { analytics, isLoading: isLoadingAnalytics } = useGetFormAnalytics(formId)
  const { submissions, isLoading: isLoadingSubmissions } = useGetFormSubmissions(formId, { pageSize: 100 })
  const { fields, isLoading: isLoadingFields } = useGetFormFields(formId)

  const isLoading = isLoadingAnalytics || isLoadingSubmissions || isLoadingFields

  const allTime = React.useMemo(() => {
    if (!analytics) return []
    return analytics.dailySubmissions.map((s) => ({
      date: new Date(s.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      count: s.count,
    }))
  }, [analytics])

  const activeDays = allTime.filter((d) => d.count > 0).length

  const fieldInsights = React.useMemo(() => {
    const insightFields = fields.filter((f) => ["single_select", "multi_select", "rating"].includes(f.type))

    return insightFields.map((field) => {
      const vals = submissions.map((s) => (s.values as Record<string, unknown>)[field.id])

      if (field.type === "rating") {
        const nums = vals.filter((v) => typeof v === "number") as number[]
        const avg = nums.length > 0 ? Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10 : 0
        const maxRating = (field as { validations?: { maxRating?: number } }).validations?.maxRating ?? 5
        return { kind: "rating" as const, fieldId: field.id, label: field.label, average: avg, responseCount: nums.length, maxRating }
      }

      const opts = (field.options as { label: string; value: string }[] | null) ?? []
      const counts: Record<string, number> = Object.fromEntries(opts.map((o) => [o.value, 0]))
      for (const val of vals) {
        if (field.type === "multi_select" && Array.isArray(val)) {
          for (const v of val) if (typeof v === "string") counts[v] = (counts[v] ?? 0) + 1
        } else if (typeof val === "string" && val) {
          counts[val] = (counts[val] ?? 0) + 1
        }
      }
      const pieData = opts.map((o) => ({ name: o.label, value: counts[o.value] ?? 0 })).filter((d) => d.value > 0)
      const responseCount = vals.filter((v) => v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0)).length
      return { kind: "select" as const, fieldId: field.id, label: field.label, type: field.type, pieData, responseCount }
    })
  }, [fields, submissions])

  const ratingInsights = fieldInsights.filter((i) => i.kind === "rating") as Extract<typeof fieldInsights[number], { kind: "rating" }>[]
  const selectInsights = fieldInsights.filter((i) => i.kind === "select") as Extract<typeof fieldInsights[number], { kind: "select" }>[]

  return (
    <div className="flex flex-1 flex-col min-h-0">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b bg-background px-4 py-3 lg:px-6">
        <Button variant="ghost" size="icon" className="shrink-0" onClick={() => router.push(`/dashboard/forms/${formId}`)}>
          <IconArrowLeft className="size-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold leading-tight truncate">
            {isLoadingForms ? "Loading…" : (form?.title ?? "Form")} — Analytics
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">All time</p>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto px-4 py-6 lg:px-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <IconLoader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex flex-col gap-6">

            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-muted-foreground">Total Responses</p>
                    <p className="text-4xl font-bold tabular-nums">{(analytics?.totalSubmissions ?? 0).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">All time submissions</p>
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
                    <p className="text-4xl font-bold tabular-nums">{activeDays.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Days with at least one response</p>
                  </div>
                  <div className="rounded-xl bg-primary/10 p-3">
                    <IconChartBar className="size-6 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bar chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Responses over time</CardTitle>
              </CardHeader>
              <CardContent>
                {allTime.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
                    <IconChartBar className="size-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">No responses yet</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={allTime} barSize={14}>
                      <defs>
                        <linearGradient id="brandBarGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0891B2" stopOpacity={1} />
                          <stop offset="100%" stopColor="#06B6D4" stopOpacity={0.7} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.3} stroke="#888" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} width={28} />
                      <Tooltip
                        cursor={{ fill: "rgba(8,145,178,0.08)" }}
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13, color: "hsl(var(--foreground))" }}
                        formatter={(val) => [val, "Responses"]}
                      />
                      <Bar dataKey="count" fill="url(#brandBarGradient)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Select insights */}
            {selectInsights.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectInsights.map((insight) => {
                  const pieTotal = insight.pieData.reduce((s, d) => s + d.value, 0)
                  return (
                    <Card key={insight.fieldId}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground truncate">{insight.label}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {insight.pieData.length === 0 ? (
                          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">No responses yet</div>
                        ) : (
                          <div className="flex gap-4 items-center">
                            <div className="shrink-0">
                              <ResponsiveContainer width={160} height={160}>
                                <PieChart>
                                  <Pie
                                    data={insight.pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={48}
                                    outerRadius={72}
                                    dataKey="value"
                                    paddingAngle={2}
                                    strokeWidth={0}
                                  >
                                    {insight.pieData.map((_, i) => (
                                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                    ))}
                                  </Pie>
                                  <Tooltip
                                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12, color: "hsl(var(--foreground))" }}
                                    formatter={(val, name) => [val, name]}
                                  />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="flex flex-col gap-2 flex-1 min-w-0">
                              {insight.pieData.map((d, i) => {
                                const pct = pieTotal > 0 ? Math.round((d.value / pieTotal) * 100) : 0
                                return (
                                  <div key={i} className="flex items-center justify-between gap-2 text-xs">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <span className="size-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                      <span className="truncate text-foreground/80">{d.name}</span>
                                    </div>
                                    <span className="tabular-nums text-muted-foreground shrink-0 font-medium">{d.value} <span className="font-normal">({pct}%)</span></span>
                                  </div>
                                )
                              })}
                              <p className="text-xs text-muted-foreground mt-1">{insight.responseCount} response{insight.responseCount !== 1 ? "s" : ""}</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {/* Rating insights */}
            {ratingInsights.length > 0 && (
              <div className="grid grid-cols-1 gap-4">
                {ratingInsights.map((insight) => (
                  <Card key={insight.fieldId}>
                    <CardContent className="flex items-center gap-8 px-8 py-6">
                      <div className="flex flex-col items-center gap-0.5 shrink-0">
                        <span className="text-6xl font-bold tabular-nums leading-none">{insight.average}</span>
                        <span className="text-sm text-muted-foreground">out of {insight.maxRating}</span>
                      </div>
                      <div className="flex flex-col gap-3">
                        <p className="text-base font-semibold">{insight.label}</p>
                        <StarRating average={insight.average} maxRating={insight.maxRating} />
                        <p className="text-sm text-muted-foreground">{insight.responseCount} response{insight.responseCount !== 1 ? "s" : ""}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  )
}
