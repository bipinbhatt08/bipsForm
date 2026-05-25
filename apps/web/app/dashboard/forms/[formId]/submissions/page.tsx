"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import {
  IconArrowLeft,
  IconClipboardList,
  IconLoader2,
  IconRefresh,
} from "@tabler/icons-react"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Skeleton } from "~/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { useGetForms, useGetFormFields } from "~/hooks/api/form"
import { useGetFormSubmissions } from "~/hooks/api/submission"

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—"
  if (Array.isArray(value)) return value.length === 0 ? "—" : value.join(", ")
  if (typeof value === "number") return String(value)
  if (typeof value === "string") return value || "—"
  return JSON.stringify(value)
}

function formatDate(date: Date | null | string): string {
  if (!date) return "—"
  return new Date(date).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function SubmissionsPage() {
  const params = useParams()
  const router = useRouter()
  const formId = params.formId as string

  const { forms, isLoading: isLoadingForms } = useGetForms()
  const form = forms.find((f) => f.id === formId)

  const { fields, isLoading: isLoadingFields } = useGetFormFields(formId)
  const { submissions, isLoading: isLoadingSubmissions, refetch, isError } = useGetFormSubmissions(formId)

  const isLoading = isLoadingForms || isLoadingFields || isLoadingSubmissions

  const sortedFields = fields

  return (
    <div className="flex flex-1 flex-col min-h-0">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b bg-background px-4 py-3 lg:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => router.push(`/dashboard/forms/${formId}`)}
        >
          <IconArrowLeft className="size-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold leading-tight truncate">
            {isLoadingForms ? "Loading…" : (form?.title ?? "Form")} — Responses
          </h1>
          {form?.description && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {form.description.length > 60
                ? form.description.slice(0, 60) + "…"
                : form.description}
            </p>
          )}
        </div>

        {!isLoading && (
          <Badge variant="secondary" className="shrink-0 text-xs tabular-nums">
            {submissions.length} {submissions.length === 1 ? "response" : "responses"}
          </Badge>
        )}

        <Button
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <IconRefresh className="size-3.5" />
          Refresh
        </Button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto px-4 py-6 lg:px-6">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-10 w-full rounded-lg" />
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <p className="font-medium text-destructive">Failed to load responses</p>
            <Button variant="outline" onClick={() => refetch()} className="gap-2">
              <IconRefresh className="size-4" />
              Try again
            </Button>
          </div>
        ) : submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-5 rounded-3xl border border-dashed py-24 text-center">
            <div className="rounded-2xl bg-muted p-5">
              <IconClipboardList className="size-7 text-muted-foreground" />
            </div>
            <div className="max-w-xs">
              <p className="font-semibold text-base">No responses yet</p>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                Share your form to start collecting responses.
              </p>
            </div>
            {form?.slug && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/forms/${form.slug}`, "_blank")}
              >
                Open form link
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted">
                  <TableRow>
                    <TableHead className="w-10 text-center">#</TableHead>
                    <TableHead className="whitespace-nowrap">Submitted</TableHead>
                    {sortedFields.map((field) => (
                      <TableHead key={field.id} className="whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {field.label || "Untitled"}
                          {field.isRequired && (
                            <span className="text-destructive text-xs">*</span>
                          )}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission, idx) => {
                    const vals = (submission.values ?? {}) as Record<string, unknown>
                    return (
                      <TableRow key={submission.id} className="hover:bg-muted/40">
                        <TableCell className="text-center text-xs text-muted-foreground tabular-nums">
                          {submissions.length - idx}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(submission.createdAt)}
                        </TableCell>
                        {sortedFields.map((field) => (
                          <TableCell key={field.id} className="text-sm max-w-[200px]">
                            <span
                              className="block truncate"
                              title={formatValue(vals[field.id])}
                            >
                              {formatValue(vals[field.id])}
                            </span>
                          </TableCell>
                        ))}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
