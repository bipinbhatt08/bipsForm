"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { IconArrowLeft, IconChartBar, IconLoader2, IconStar, IconUsers } from "@tabler/icons-react"
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { useGetFormFields, useGetForms } from "~/hooks/api/form"
import { useGetFormAnalytics, useGetFormSubmissions } from "~/hooks/api/submission"

const PIE_COLORS = [
  "hsl(var(--primary))",
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
]

function StatCard({ title, value, icon: Icon }: { title: string; value: string | number; icon: React.ElementType }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold tabular-nums">{typeof value === "number" ? value.toLocaleString() : value}</p>
      </CardContent>
    </Card>
  )
}

export default function AnalyticsPage() {
  const params = useParams()
  const router = useRouter()
  const formId = params.formId as string

  const { forms, isLoading: isLoadingForms } = useGetForms()
  const form = forms.find((f) => f.id === formId)
  const { analytics, isLoading: isLoadingAnalytics } = useGetFormAnalytics(formId)
  const { submissions, isLoading: isLoadingSubmissions } = useGetFormSubmissions(formId)
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
          <div className="flex flex-1 items-center justify-center py-24">
            <IconLoader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex flex-col gap-6 max-w-3xl">

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard title="Total Responses" value={analytics?.totalSubmissions ?? 0} icon={IconUsers} />
              <StatCard title="Active Days" value={activeDays} icon={IconChartBar} />
              <StatCard
                title="Avg / Day"
                value={activeDays > 0 ? Math.round(((analytics?.totalSubmissions ?? 0) / activeDays) * 10) / 10 : 0}
                icon={IconChartBar}
              />
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
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={allTime} barSize={12}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={32} />
                      <Tooltip
                        cursor={{ fill: "hsl(var(--muted))" }}
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }}
                        formatter={(val) => [val, "Responses"]}
                      />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Field insights */}
            {fieldInsights.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fieldInsights.map((insight) => {
                  if (insight.kind === "rating") {
                    return (
                      <Card key={insight.fieldId}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground truncate">{insight.label}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-2 py-4">
                          <div className="flex items-end gap-1">
                            <span className="text-5xl font-bold tabular-nums">{insight.average}</span>
                            <span className="text-lg text-muted-foreground mb-1">/ {insight.maxRating}</span>
                          </div>
                          <div className="flex gap-0.5">
                            {Array.from({ length: insight.maxRating }).map((_, i) => (
                              <IconStar
                                key={i}
                                className={`size-4 ${i < Math.round(insight.average) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{insight.responseCount} response{insight.responseCount !== 1 ? "s" : ""}</p>
                        </CardContent>
                      </Card>
                    )
                  }

                  return (
                    <Card key={insight.fieldId}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground truncate">{insight.label}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {insight.pieData.length === 0 ? (
                          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">No responses yet</div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <ResponsiveContainer width="100%" height={180}>
                              <PieChart>
                                <Pie
                                  data={insight.pieData}
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={70}
                                  dataKey="value"
                                  label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`}
                                  labelLine={false}
                                >
                                  {insight.pieData.map((_, i) => (
                                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip
                                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }}
                                  formatter={(val, name) => [val, name]}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                            <p className="text-xs text-center text-muted-foreground">{insight.responseCount} response{insight.responseCount !== 1 ? "s" : ""}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  )
}
