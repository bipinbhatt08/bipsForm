"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import {
  IconArrowLeft,
  IconArrowRight,
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconClipboardList,
  IconDownload,
  IconLoader2,
  IconRefresh,
  IconStar,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react"
import { toast } from "sonner"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet"
import { Skeleton } from "~/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { trpc } from "~/trpc/client"
import { useGetForms, useGetFormFields } from "~/hooks/api/form"
import { useGetFormSubmissions } from "~/hooks/api/submission"

function buildCSV(fields: Field[], submissions: Submission[]): string {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`
  const headers = ["#", "Submitted", ...fields.map((f) => f.label || "Untitled")]
  const rows = submissions.map((s, i) => {
    const vals = (s.values ?? {}) as Record<string, unknown>
    return [
      String(i + 1),
      s.createdAt ? new Date(s.createdAt).toISOString() : "",
      ...fields.map((f) => {
        const v = vals[f.id]
        if (v === null || v === undefined || v === "") return ""
        if (Array.isArray(v)) return v.join(", ")
        return String(v)
      }),
    ]
      .map(esc)
      .join(",")
  })
  return [headers.map(esc).join(","), ...rows].join("\n")
}

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

type Field = { id: string; label: string; type: string; validations?: unknown; options?: unknown }
type Submission = { id: string; values: unknown; createdAt: Date | null }

function FieldAnswer({ field, value }: { field: Field; value: unknown }) {
  if (value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) {
    return <span className="text-muted-foreground/60 italic text-sm">No answer</span>
  }
  if (field.type === "rating") {
    const num = typeof value === "number" ? value : Number(value)
    const max = (field.validations as { maxRating?: number } | null)?.maxRating ?? 5
    return (
      <div className="flex items-center gap-3">
        <div className="flex gap-0.5">
          {Array.from({ length: max }).map((_, i) => (
            <IconStar key={i} className={`size-4 ${i < num ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20"}`} />
          ))}
        </div>
        <span className="text-sm font-medium tabular-nums">{num}<span className="text-muted-foreground font-normal"> / {max}</span></span>
      </div>
    )
  }
  if (field.type === "multi_select" && Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {value.map((v, i) => <Badge key={i} variant="secondary" className="text-xs font-normal">{String(v)}</Badge>)}
      </div>
    )
  }
  if (field.type === "single_select") {
    return <Badge variant="secondary" className="text-xs font-normal">{String(value)}</Badge>
  }
  if (field.type === "long_text") {
    return <p className="text-sm whitespace-pre-wrap leading-relaxed text-foreground/90">{String(value)}</p>
  }
  return <p className="text-sm text-foreground/90">{String(value)}</p>
}

function SubmissionDetailSheet({
  submission,
  fields,
  index,
  total,
  isFirst,
  isLast,
  open,
  onOpenChange,
  onPrev,
  onNext,
}: {
  submission: Submission | null
  fields: Field[]
  index: number
  total: number
  isFirst: boolean
  isLast: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  onPrev: () => void
  onNext: () => void
}) {
  if (!submission) return null
  const vals = (submission.values ?? {}) as Record<string, unknown>
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0 gap-0">
        <SheetHeader className="px-5 pt-5 pb-4 border-b bg-muted/30 gap-0">
          <div className="flex items-start justify-between gap-3 pr-6">
            <div className="flex flex-col gap-1">
              <SheetTitle className="text-base font-semibold">Response #{index}</SheetTitle>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <IconCalendar className="size-3.5 shrink-0" />
                <span>{formatDate(submission.createdAt)}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="icon" className="size-7" onClick={onPrev} disabled={isFirst}>
                <IconChevronLeft className="size-4" />
              </Button>
              <span className="text-xs text-muted-foreground tabular-nums w-12 text-center">{index} / {total}</span>
              <Button variant="ghost" size="icon" className="size-7" onClick={onNext} disabled={isLast}>
                <IconChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col divide-y">
            {fields.map((field) => (
              <div key={field.id} className="flex flex-col gap-2 px-5 py-4">
                <p className="text-xs font-medium text-muted-foreground leading-none">{field.label || "Untitled"}</p>
                <FieldAnswer field={field} value={vals[field.id]} />
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

const PAGE_SIZE_OPTIONS = ["10", "25", "50"]

export default function SubmissionsPage() {
  const params = useParams()
  const router = useRouter()
  const formId = params.formId as string

  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(25)
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc")
  const [selectedIdx, setSelectedIdx] = React.useState<number | null>(null)
  const [isExporting, setIsExporting] = React.useState(false)
  const utils = trpc.useUtils()

  const { forms, isLoading: isLoadingForms } = useGetForms()
  const form = forms.find((f) => f.id === formId)
  const { fields, isLoading: isLoadingFields } = useGetFormFields(formId)
  const {
    submissions, total, totalPages,
    isLoading: isLoadingSubmissions, refetch, isError,
  } = useGetFormSubmissions(formId, { page, pageSize, sortDir })

  const isLoading = isLoadingForms || isLoadingFields || isLoadingSubmissions

  // reset to page 1 when sort or pageSize changes
  React.useEffect(() => { setPage(1); setSelectedIdx(null) }, [sortDir, pageSize])

  const selectedSubmission = selectedIdx !== null ? (submissions[selectedIdx] ?? null) : null
  // display index: for desc sort, first item on page 1 is submission #total, etc.
  const selectedDisplayIndex = React.useMemo(() => {
    if (selectedIdx === null) return 0
    const globalIdx = (page - 1) * pageSize + selectedIdx
    return sortDir === "desc" ? total - globalIdx : globalIdx + 1
  }, [selectedIdx, page, pageSize, sortDir, total])

  const isFirstItem = selectedIdx === 0 && page === 1
  const isLastItem = selectedIdx === submissions.length - 1 && page >= totalPages

  function handlePrev() {
    if (selectedIdx === null) return
    if (selectedIdx > 0) {
      setSelectedIdx(selectedIdx - 1)
    } else if (page > 1) {
      setPage(p => p - 1)
      setSelectedIdx(pageSize - 1)
    }
  }

  function handleNext() {
    if (selectedIdx === null) return
    if (selectedIdx < submissions.length - 1) {
      setSelectedIdx(selectedIdx + 1)
    } else if (page < totalPages) {
      setPage(p => p + 1)
      setSelectedIdx(0)
    }
  }

  async function handleExportCSV() {
    setIsExporting(true)
    try {
      const data = await utils.submission.getFormSubmissions.fetch({
        formId,
        page: 1,
        pageSize: 5000,
        sortDir: "desc",
      })
      const csv = buildCSV(fields as Field[], data.submissions as Submission[])
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${form?.title ?? "responses"}-responses.csv`
      link.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error("Failed to export CSV")
    } finally {
      setIsExporting(false)
    }
  }

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <div className="flex flex-1 flex-col min-h-0">
      {/* Page header */}
      <div className="flex shrink-0 items-center gap-3 border-b bg-background px-4 py-3 lg:px-6">
        <Button variant="ghost" size="icon" className="shrink-0" onClick={() => router.push(`/dashboard/forms/${formId}`)}>
          <IconArrowLeft className="size-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold leading-tight truncate">
            {isLoadingForms ? "Loading…" : (form?.title ?? "Form")} — Responses
          </h1>
          {form?.description && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {form.description.length > 60 ? form.description.slice(0, 60) + "…" : form.description}
            </p>
          )}
        </div>
        {!isLoading && (
          <Badge variant="secondary" className="shrink-0 text-xs tabular-nums">
            {total} {total === 1 ? "response" : "responses"}
          </Badge>
        )}
        <Button variant="outline" size="sm" className="shrink-0 gap-1.5" onClick={() => refetch()} disabled={isLoading}>
          <IconRefresh className="size-3.5" />
          Refresh
        </Button>
        <Button
          size="sm"
          className="shrink-0 gap-1.5"
          onClick={handleExportCSV}
          disabled={isLoading || isExporting || total === 0}
        >
          {isExporting
            ? <IconLoader2 className="size-3.5 animate-spin" />
            : <IconDownload className="size-3.5" />}
          Export CSV
        </Button>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col gap-2 p-6">
            <Skeleton className="h-10 w-full rounded-lg" />
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <p className="font-medium text-destructive">Failed to load responses</p>
            <Button variant="outline" onClick={() => refetch()} className="gap-2">
              <IconRefresh className="size-4" />Try again
            </Button>
          </div>
        ) : total === 0 ? (
          <div className="flex flex-col items-center justify-center gap-5 rounded-3xl border border-dashed m-6 py-24 text-center">
            <div className="rounded-2xl bg-muted p-5">
              <IconClipboardList className="size-7 text-muted-foreground" />
            </div>
            <div className="max-w-xs">
              <p className="font-semibold text-base">No responses yet</p>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">Share your form to start collecting responses.</p>
            </div>
            {form?.slug && (
              <Button variant="outline" size="sm" onClick={() => window.open(`/forms/${form.slug}`, "_blank")} className="gap-1.5">
                Open form link <IconArrowRight className="size-3.5" />
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col h-full">

            {/* Toolbar */}
            <div className="shrink-0 flex items-center justify-between gap-3 border-b px-4 py-2 bg-muted/20">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Sort:</span>
                <Select value={sortDir} onValueChange={(v) => setSortDir(v as "asc" | "desc")}>
                  <SelectTrigger className="h-7 w-36 text-xs gap-1.5">
                    {sortDir === "desc"
                      ? <IconSortDescending className="size-3.5 shrink-0" />
                      : <IconSortAscending className="size-3.5 shrink-0" />
                    }
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc" className="text-xs">Newest first</SelectItem>
                    <SelectItem value="asc" className="text-xs">Oldest first</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Rows:</span>
                <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                  <SelectTrigger className="h-7 w-16 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map(n => (
                      <SelectItem key={n} value={n} className="text-xs">{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-x-auto">
              <Table className="min-w-max w-full">
                <TableHeader>
                  <TableRow className="bg-muted/60 hover:bg-muted/60 border-b">
                    <TableHead className="w-10 text-center text-xs font-semibold text-muted-foreground">#</TableHead>
                    <TableHead className="whitespace-nowrap text-xs font-semibold text-muted-foreground">Submitted</TableHead>
                    {fields.map((field) => (
                      <TableHead key={field.id} className="whitespace-nowrap text-xs font-semibold text-muted-foreground min-w-40">
                        {field.label || "Untitled"}
                        {field.isRequired && <span className="text-destructive ml-0.5">*</span>}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission, idx) => {
                    const vals = (submission.values ?? {}) as Record<string, unknown>
                    const isSelected = selectedIdx === idx
                    const rowNumber = (page - 1) * pageSize + idx + 1
                    return (
                      <TableRow
                        key={submission.id}
                        className={`cursor-pointer border-b transition-colors ${isSelected ? "bg-primary/10 hover:bg-primary/10" : "hover:bg-muted/40"}`}
                        onClick={() => setSelectedIdx(idx)}
                      >
                        <TableCell className="text-center text-xs tabular-nums text-muted-foreground w-10">
                          {rowNumber}
                        </TableCell>
                        <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                          {formatDate(submission.createdAt)}
                        </TableCell>
                        {fields.map((field) => (
                          <TableCell key={field.id} className="text-sm max-w-48 py-3">
                            <span className="block truncate" title={formatValue(vals[field.id])}>
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

            {/* Pagination footer */}
            <div className="shrink-0 flex items-center justify-between gap-4 border-t px-4 py-2.5 bg-background">
              <span className="text-xs text-muted-foreground tabular-nums">
                {from}–{to} of {total} responses
              </span>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="size-7" onClick={() => setPage(1)} disabled={page === 1}>
                  <IconChevronLeft className="size-3.5" />
                  <IconChevronLeft className="size-3.5 -ml-2.5" />
                </Button>
                <Button variant="outline" size="icon" className="size-7" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                  <IconChevronLeft className="size-3.5" />
                </Button>
                <span className="text-xs text-muted-foreground tabular-nums px-2">
                  {page} / {totalPages}
                </span>
                <Button variant="outline" size="icon" className="size-7" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>
                  <IconChevronRight className="size-3.5" />
                </Button>
                <Button variant="outline" size="icon" className="size-7" onClick={() => setPage(totalPages)} disabled={page >= totalPages}>
                  <IconChevronRight className="size-3.5" />
                  <IconChevronRight className="size-3.5 -ml-2.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <SubmissionDetailSheet
        submission={selectedSubmission as Submission | null}
        fields={fields as Field[]}
        index={selectedDisplayIndex}
        total={total}
        isFirst={isFirstItem}
        isLast={isLastItem}
        open={selectedIdx !== null}
        onOpenChange={(open) => { if (!open) setSelectedIdx(null) }}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </div>
  )
}
