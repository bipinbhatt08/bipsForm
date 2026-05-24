"use client"

import * as React from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import {
  IconAlignLeft,
  IconArrowLeft,
  IconCalendar,
  IconCheckbox,
  IconChevronDown,
  IconChevronUp,
  IconHash,
  IconLetterCase,
  IconList,
  IconLoader2,
  IconMail,
  IconPhone,
  IconPlus,
  IconStar,
  IconTrash,
  IconX,
} from "@tabler/icons-react"
import { toast } from "sonner"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Separator } from "~/components/ui/separator"
import { Skeleton } from "~/components/ui/skeleton"
import { Switch } from "~/components/ui/switch"
import { cn } from "~/lib/utils"
import { useCreateFormField, useGetFormFields, useGetForms } from "~/hooks/api/form"

// ─── Types ─────────────────────────────────────────────────────────────────

type FieldType =
  | "short_text"
  | "long_text"
  | "email"
  | "number"
  | "single_select"
  | "multi_select"
  | "rating"
  | "date"
  | "phone"

interface SelectOption {
  id: string
  label: string
  value: string
}

interface Validation {
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  maxRating?: number
  minDate?: string
  maxDate?: string
}

type ConditionOperator = "equals" | "not_equals" | "contains" | "is_empty" | "is_filled"

interface Condition {
  fieldId: string
  operator: ConditionOperator
  value: string
}

interface FormField {
  id: string
  label: string
  description: string
  type: FieldType
  placeholder: string
  isRequired: boolean
  options: SelectOption[]
  validation: Validation
  condition: Condition | null
}

type PanelMode = { kind: "idle" } | { kind: "adding" } | { kind: "editing"; fieldId: string }

// ─── Field registry ─────────────────────────────────────────────────────────

const FIELD_REGISTRY = [
  { value: "short_text" as FieldType, label: "Short Text", icon: IconLetterCase, iconColor: "text-blue-500", iconBg: "bg-blue-100 dark:bg-blue-900/40", badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" },
  { value: "long_text" as FieldType, label: "Long Text", icon: IconAlignLeft, iconColor: "text-violet-500", iconBg: "bg-violet-100 dark:bg-violet-900/40", badge: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400" },
  { value: "email" as FieldType, label: "Email", icon: IconMail, iconColor: "text-rose-500", iconBg: "bg-rose-100 dark:bg-rose-900/40", badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400" },
  { value: "number" as FieldType, label: "Number", icon: IconHash, iconColor: "text-amber-500", iconBg: "bg-amber-100 dark:bg-amber-900/40", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" },
  { value: "phone" as FieldType, label: "Phone", icon: IconPhone, iconColor: "text-green-500", iconBg: "bg-green-100 dark:bg-green-900/40", badge: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" },
  { value: "date" as FieldType, label: "Date", icon: IconCalendar, iconColor: "text-sky-500", iconBg: "bg-sky-100 dark:bg-sky-900/40", badge: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400" },
  { value: "single_select" as FieldType, label: "Single Select", icon: IconList, iconColor: "text-indigo-500", iconBg: "bg-indigo-100 dark:bg-indigo-900/40", badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400" },
  { value: "multi_select" as FieldType, label: "Multi Select", icon: IconCheckbox, iconColor: "text-teal-500", iconBg: "bg-teal-100 dark:bg-teal-900/40", badge: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400" },
  { value: "rating" as FieldType, label: "Rating", icon: IconStar, iconColor: "text-orange-500", iconBg: "bg-orange-100 dark:bg-orange-900/40", badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400" },
]

const SELECT_TYPES: FieldType[] = ["single_select", "multi_select"]
const PLACEHOLDER_TYPES: FieldType[] = ["short_text", "long_text", "email", "number", "phone"]
const VALIDATION_TYPES: FieldType[] = ["short_text", "long_text", "number", "rating", "date"]

const CONDITION_OPERATORS: { value: ConditionOperator; label: string }[] = [
  { value: "equals", label: "is equal to" },
  { value: "not_equals", label: "is not equal to" },
  { value: "contains", label: "contains" },
  { value: "is_filled", label: "is filled" },
  { value: "is_empty", label: "is empty" },
]

function getFieldMeta(type: FieldType) {
  return FIELD_REGISTRY.find((r) => r.value === type)!
}

function makeOption(): SelectOption {
  return { id: crypto.randomUUID(), label: "", value: "" }
}

function emptyDraft(): Omit<FormField, "id"> {
  return {
    label: "",
    description: "",
    type: "short_text",
    placeholder: "",
    isRequired: false,
    options: [],
    validation: {},
    condition: null,
  }
}

// ─── Type picker grid ────────────────────────────────────────────────────────

function TypeGrid({ value, onChange }: { value: FieldType; onChange: (v: FieldType) => void }) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {FIELD_REGISTRY.map((t) => {
        const Icon = t.icon
        const active = value === t.value
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(t.value)}
            className={cn(
              "group flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-transparent bg-muted/50 hover:border-border hover:bg-muted"
            )}
          >
            <span className={cn("rounded-lg p-2 transition-colors", active ? t.iconBg : "bg-background")}>
              <Icon className={cn("size-4", active ? t.iconColor : "text-muted-foreground")} />
            </span>
            <span className={cn("text-[11px] font-semibold leading-tight", active ? "text-foreground" : "text-muted-foreground")}>
              {t.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Section label ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
      {children}
    </p>
  )
}

// ─── Field card ──────────────────────────────────────────────────────────────

function FieldCard({
  field,
  index,
  total,
  isSelected,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  field: FormField
  index: number
  total: number
  isSelected: boolean
  onSelect: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
}) {
  const meta = getFieldMeta(field.type)
  const Icon = meta.icon

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      className={cn(
        "group relative rounded-2xl border bg-card px-5 py-4 cursor-pointer transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isSelected
          ? "border-primary ring-[3px] ring-primary/15 shadow-sm"
          : "border-border hover:border-foreground/25 hover:shadow-sm"
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
          isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          {index + 1}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <p className={cn("font-semibold text-sm leading-snug", !field.label && "italic text-muted-foreground font-normal")}>
              {field.label || "Untitled field"}
            </p>
            {field.isRequired && <span className="text-destructive text-sm font-semibold leading-none">*</span>}
          </div>
          {field.description && (
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{field.description}</p>
          )}
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span className={cn("inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-semibold", meta.badge)}>
              <Icon className="size-3" />
              {meta.label}
            </span>
            {field.options.filter((o) => o.label).length > 0 && (
              <span className="text-[11px] text-muted-foreground">
                {field.options.filter((o) => o.label).length} options
              </span>
            )}
            {field.condition && (
              <span className="text-[11px] text-muted-foreground">Conditional</span>
            )}
          </div>
        </div>

        <div className={cn(
          "flex items-center gap-0.5 transition-opacity duration-150",
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}>
          <Button variant="ghost" size="icon" className="size-7 text-muted-foreground disabled:opacity-20" disabled={index === 0} onClick={(e) => { e.stopPropagation(); onMoveUp() }}>
            <IconChevronUp className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="size-7 text-muted-foreground disabled:opacity-20" disabled={index === total - 1} onClick={(e) => { e.stopPropagation(); onMoveDown() }}>
            <IconChevronDown className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 ml-0.5" onClick={(e) => { e.stopPropagation(); onDelete() }}>
            <IconTrash className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Config panel ────────────────────────────────────────────────────────────

function ConfigPanel({
  draft,
  isNew,
  otherFields,
  onChange,
  onSave,
  onClose,
  isSaving,
}: {
  draft: Omit<FormField, "id">
  isNew: boolean
  otherFields: FormField[]
  onChange: <K extends keyof Omit<FormField, "id">>(k: K, v: Omit<FormField, "id">[K]) => void
  onSave: () => void
  onClose: () => void
  isSaving?: boolean
}) {
  const isSelectType = SELECT_TYPES.includes(draft.type)
  const hasPlaceholder = PLACEHOLDER_TYPES.includes(draft.type)
  const hasValidation = VALIDATION_TYPES.includes(draft.type)
  const needsValue = draft.condition?.operator !== "is_empty" && draft.condition?.operator !== "is_filled"

  function setValidation(key: keyof Validation, raw: string) {
    const asNum = raw === "" ? undefined : Number(raw)
    onChange("validation", { ...draft.validation, [key]: asNum })
  }

  function setValidationStr(key: keyof Validation, val: string) {
    onChange("validation", { ...draft.validation, [key]: val || undefined })
  }

  function addOption() {
    onChange("options", [...draft.options, makeOption()])
  }

  function updateOption(id: string, label: string) {
    onChange("options", draft.options.map((o) =>
      o.id === id ? { ...o, label, value: label.toLowerCase().replace(/\s+/g, "_") } : o
    ))
  }

  function removeOption(id: string) {
    onChange("options", draft.options.filter((o) => o.id !== id))
  }

  function setConditionField(fieldId: string) {
    onChange("condition", { fieldId, operator: "equals", value: "" })
  }

  function setConditionOperator(operator: ConditionOperator) {
    if (!draft.condition) return
    onChange("condition", { ...draft.condition, operator, value: "" })
  }

  function setConditionValue(value: string) {
    if (!draft.condition) return
    onChange("condition", { ...draft.condition, value })
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Panel header */}
      <div className="flex shrink-0 items-center justify-between border-b px-6 py-4">
        <div>
          <p className="font-semibold">{isNew ? "Add a field" : "Edit field"}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isNew ? "Choose a type and configure" : "Changes save when you click Save"}
          </p>
        </div>
        <Button variant="ghost" size="icon" className="size-8 -mr-1 shrink-0" onClick={onClose}>
          <IconX className="size-4" />
        </Button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-6 px-6 py-6">

          {/* ── Field type ── */}
          <section className="flex flex-col gap-3">
            <SectionLabel>Field type</SectionLabel>
            <TypeGrid value={draft.type} onChange={(v) => onChange("type", v)} />
          </section>

          <Separator />

          {/* ── Content ── */}
          <section className="flex flex-col gap-4">
            <SectionLabel>Content</SectionLabel>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cfg-label">
                Question / Label <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cfg-label"
                placeholder="e.g. What is your full name?"
                value={draft.label}
                onChange={(e) => onChange("label", e.target.value)}
                autoFocus={isNew}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cfg-desc">
                Helper text
                <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="cfg-desc"
                placeholder="Shown below the question to guide respondents"
                value={draft.description}
                onChange={(e) => onChange("description", e.target.value)}
              />
            </div>

            {hasPlaceholder && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cfg-ph">
                  Placeholder
                  <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="cfg-ph"
                  placeholder="e.g. Type your answer here…"
                  value={draft.placeholder}
                  onChange={(e) => onChange("placeholder", e.target.value)}
                />
              </div>
            )}
          </section>

          {/* ── Options (select types) ── */}
          {isSelectType && (
            <>
              <Separator />
              <section className="flex flex-col gap-3">
                <SectionLabel>Answer choices</SectionLabel>
                <div className="flex flex-col gap-2">
                  {draft.options.length === 0 && (
                    <p className="rounded-xl bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
                      No options yet — add at least one so respondents can pick an answer.
                    </p>
                  )}
                  {draft.options.map((opt, i) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <span className="w-5 shrink-0 text-right text-xs font-medium text-muted-foreground">
                        {i + 1}.
                      </span>
                      <Input
                        placeholder={`Option ${i + 1}`}
                        value={opt.label}
                        onChange={(e) => updateOption(opt.id, e.target.value)}
                        className="h-8 flex-1 text-sm"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeOption(opt.id)}
                      >
                        <IconX className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addOption}
                    className="flex items-center gap-2 rounded-xl border border-dashed px-4 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground hover:bg-muted/40"
                  >
                    <IconPlus className="size-3.5" />
                    Add option
                  </button>
                </div>
              </section>
            </>
          )}

          {/* ── Validations ── */}
          {hasValidation && (
            <>
              <Separator />
              <section className="flex flex-col gap-3">
                <div>
                  <SectionLabel>Validation rules</SectionLabel>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Leave blank to skip a rule.
                  </p>
                </div>

                {(draft.type === "short_text" || draft.type === "long_text") && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs">Min characters</Label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="e.g. 10"
                        value={draft.validation.minLength ?? ""}
                        onChange={(e) => setValidation("minLength", e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs">Max characters</Label>
                      <Input
                        type="number"
                        min={1}
                        placeholder="e.g. 200"
                        value={draft.validation.maxLength ?? ""}
                        onChange={(e) => setValidation("maxLength", e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                )}

                {draft.type === "number" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs">Min value</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 0"
                        value={draft.validation.min ?? ""}
                        onChange={(e) => setValidation("min", e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs">Max value</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 100"
                        value={draft.validation.max ?? ""}
                        onChange={(e) => setValidation("max", e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                )}

                {draft.type === "rating" && (
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs">Rating scale</Label>
                    <Select
                      value={String(draft.validation.maxRating ?? 5)}
                      onValueChange={(v) => setValidation("maxRating", v)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">Out of 5 stars</SelectItem>
                        <SelectItem value="10">Out of 10 stars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {draft.type === "date" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs">Earliest date</Label>
                      <Input
                        type="date"
                        value={draft.validation.minDate ?? ""}
                        onChange={(e) => setValidationStr("minDate", e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs">Latest date</Label>
                      <Input
                        type="date"
                        value={draft.validation.maxDate ?? ""}
                        onChange={(e) => setValidationStr("maxDate", e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                )}
              </section>
            </>
          )}

          {/* ── Conditions ── */}
          <Separator />
          <section className="flex flex-col gap-3">
            <SectionLabel>Conditional visibility</SectionLabel>

            <div className="flex items-start justify-between gap-4 rounded-2xl border bg-muted/30 px-4 py-3.5">
              <div className="min-w-0">
                <p className="text-sm font-medium leading-snug">Show conditionally</p>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                  Only show this field when a previous field matches a condition.
                </p>
              </div>
              <Switch
                checked={draft.condition !== null}
                onCheckedChange={(on) =>
                  onChange("condition", on && otherFields.length > 0
                    ? { fieldId: otherFields[0]!.id, operator: "equals", value: "" }
                    : null)
                }
                disabled={otherFields.length === 0}
              />
            </div>

            {otherFields.length === 0 && (
              <p className="text-xs text-muted-foreground px-1">
                Add more fields first to set up conditions.
              </p>
            )}

            {draft.condition !== null && otherFields.length > 0 && (
              <div className="flex flex-col gap-2.5 rounded-2xl border bg-muted/20 p-4">
                <p className="text-xs font-medium text-muted-foreground">Show this field when…</p>

                <div className="flex flex-col gap-2">
                  <Select value={draft.condition.fieldId} onValueChange={setConditionField}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Select a field" />
                    </SelectTrigger>
                    <SelectContent>
                      {otherFields.map((f, i) => (
                        <SelectItem key={f.id} value={f.id}>
                          Q{i + 1} — {f.label || "Untitled"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={draft.condition.operator} onValueChange={(v) => setConditionOperator(v as ConditionOperator)}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONDITION_OPERATORS.map((op) => (
                        <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {needsValue && (
                    <Input
                      placeholder="Enter value…"
                      value={draft.condition.value}
                      onChange={(e) => setConditionValue(e.target.value)}
                      className="h-8 text-sm"
                    />
                  )}
                </div>
              </div>
            )}
          </section>

          {/* ── Settings ── */}
          <Separator />
          <section className="flex flex-col gap-3">
            <SectionLabel>Settings</SectionLabel>
            <div className="flex items-start justify-between gap-4 rounded-2xl border bg-muted/30 px-4 py-3.5">
              <div className="min-w-0">
                <p className="text-sm font-medium leading-snug">Required</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Respondents must answer this field to submit the form.
                </p>
              </div>
              <Switch
                checked={draft.isRequired}
                onCheckedChange={(v) => onChange("isRequired", v)}
              />
            </div>
          </section>

          {/* Bottom padding */}
          <div className="h-2" />
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t bg-background px-6 py-4">
        <Button
          className="w-full font-semibold"
          disabled={!draft.label.trim() || isSaving}
          onClick={onSave}
        >
          {isSaving ? (
            <>
              <IconLoader2 className="size-4 animate-spin" />
              {isNew ? "Adding…" : "Saving…"}
            </>
          ) : isNew ? "Add field to form" : "Save changes"}
        </Button>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function FormBuilderPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isNew = searchParams.get("new") === "true"
  const formId = params.formId as string

  const { forms } = useGetForms()
  const form = forms.find((f) => f.id === formId)
  const { createFormFieldAsync, isPending: isSaving } = useCreateFormField()
  const { fields: apiFields, isLoading: isLoadingFields } = useGetFormFields(formId)

  const [fields, setFields] = React.useState<FormField[]>([])
  const [panel, setPanel] = React.useState<PanelMode>({ kind: "idle" })
  const [draft, setDraft] = React.useState<Omit<FormField, "id">>(emptyDraft())

  const seededRef = React.useRef(false)
  React.useEffect(() => {
    if (seededRef.current || isLoadingFields) return
    seededRef.current = true
    setFields(
      apiFields.map((f) => ({
        id: f.id,
        label: f.label,
        description: f.description ?? "",
        type: f.type as FieldType,
        placeholder: f.placeholder ?? "",
        isRequired: f.isRequired ?? false,
        options: ((f.options ?? []) as { label: string; value: string }[]).map((o) => ({
          ...o,
          id: crypto.randomUUID(),
        })),
        validation: (f.validations ?? {}) as Validation,
        condition: f.conditions ? (f.conditions as unknown as Condition) : null,
      }))
    )
  }, [isLoadingFields, apiFields])

  const panelOpen = panel.kind !== "idle"
  const isAdding = panel.kind === "adding"
  const editingId = panel.kind === "editing" ? panel.fieldId : null

  function openAdd() {
    setDraft(emptyDraft())
    setPanel({ kind: "adding" })
  }

  function openEdit(field: FormField) {
    const { id, ...rest } = field
    setDraft(rest)
    setPanel({ kind: "editing", fieldId: id })
  }

  function closePanel() {
    setPanel({ kind: "idle" })
  }

  function updateDraft<K extends keyof Omit<FormField, "id">>(k: K, v: Omit<FormField, "id">[K]) {
    setDraft((prev) => {
      if (k === "type") {
        const t = v as FieldType
        return {
          ...prev,
          type: t,
          options: SELECT_TYPES.includes(t) ? prev.options : [],
          placeholder: PLACEHOLDER_TYPES.includes(t) ? prev.placeholder : "",
          validation: {},
        }
      }
      return { ...prev, [k]: v }
    })
  }

  async function commitAdd() {
    if (!draft.label.trim()) return
    try {
      const { id } = await createFormFieldAsync({
        formId,
        label: draft.label,
        description: draft.description || undefined,
        placeholder: draft.placeholder || undefined,
        isRequired: draft.isRequired,
        type: draft.type,
        options: SELECT_TYPES.includes(draft.type)
          ? draft.options.map(({ label, value }) => ({ label, value }))
          : undefined,
        validations:
          Object.keys(draft.validation).length > 0
            ? (draft.validation as Record<string, unknown>)
            : undefined,
        conditions: draft.condition
          ? (draft.condition as unknown as Record<string, unknown>)
          : undefined,
      })
      setFields((prev) => [...prev, { ...draft, id }])
      closePanel()
      toast.success("Field added")
    } catch {
      toast.error("Failed to add field")
    }
  }

  function commitEdit() {
    if (!editingId || !draft.label.trim()) return
    setFields((prev) => prev.map((f) => (f.id === editingId ? { ...draft, id: f.id } : f)))
    closePanel()
  }

  function deleteField(id: string) {
    setFields((prev) => prev.filter((f) => f.id !== id))
    if (editingId === id) closePanel()
  }

  function moveField(id: string, dir: "up" | "down") {
    setFields((prev) => {
      const idx = prev.findIndex((f) => f.id === id)
      if (dir === "up" && idx === 0) return prev
      if (dir === "down" && idx === prev.length - 1) return prev
      const next = [...prev]
      const swap = dir === "up" ? idx - 1 : idx + 1
      ;[next[idx], next[swap]] = [next[swap]!, next[idx]!]
      return next
    })
  }

  // Other fields for condition builder (exclude the one being edited)
  const otherFields = fields.filter((f) => f.id !== editingId)

  return (
    <div className="flex flex-1 flex-col min-h-0">
      {/* Sub-header */}
      <div className="flex shrink-0 items-center gap-3 border-b bg-background px-4 py-3 lg:px-6">
        <Button variant="ghost" size="icon" className="shrink-0" onClick={() => router.push("/dashboard/forms")}>
          <IconArrowLeft className="size-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold leading-tight truncate">
            {form?.title ?? "Form Builder"}
          </h1>
          {form?.description && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {form.description.length > 60 ? form.description.slice(0, 60) + "…" : form.description}
            </p>
          )}
        </div>
        <Badge variant="secondary" className="shrink-0 text-xs tabular-nums">
          {fields.length} {fields.length === 1 ? "field" : "fields"}
        </Badge>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Canvas */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-xl px-4 py-8 lg:px-6">
            <div className="flex flex-col gap-3">

              {/* Loading skeleton */}
              {isLoadingFields && (
                <div className="flex flex-col gap-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-[72px] w-full rounded-2xl" />
                  ))}
                </div>
              )}

              {/* Welcome banner — shown only on first visit after create */}
              {!isLoadingFields && isNew && fields.length === 0 && !isAdding && (
                <div className="mb-2 rounded-2xl border border-primary/20 bg-primary/5 px-6 py-5">
                  <p className="font-semibold text-sm">Form created!</p>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    Now add some fields to your form. You can reorder, edit, or remove them at any time.
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <Button size="sm" className="gap-2 font-semibold" onClick={openAdd}>
                      <IconPlus className="size-3.5" />
                      Add first field
                    </Button>
                    <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => router.push("/dashboard/forms")}>
                      Skip for now
                    </Button>
                  </div>
                </div>
              )}

              {/* Empty state — shown on revisit when no fields */}
              {!isLoadingFields && !isNew && fields.length === 0 && !isAdding && (
                <div className="flex flex-col items-center gap-5 rounded-3xl border border-dashed py-24 text-center">
                  <div className="rounded-2xl bg-muted p-5">
                    <IconPlus className="size-7 text-muted-foreground" />
                  </div>
                  <div className="max-w-xs">
                    <p className="font-semibold text-base">No fields yet</p>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      Add your first field to start building this form.
                    </p>
                  </div>
                  <Button onClick={openAdd} size="lg" className="gap-2 rounded-xl font-semibold">
                    <IconPlus className="size-4" />
                    Add first field
                  </Button>
                </div>
              )}

              {/* Field list */}
              {fields.map((field, idx) => (
                <FieldCard
                  key={field.id}
                  field={field}
                  index={idx}
                  total={fields.length}
                  isSelected={editingId === field.id}
                  onSelect={() => openEdit(field)}
                  onMoveUp={() => moveField(field.id, "up")}
                  onMoveDown={() => moveField(field.id, "down")}
                  onDelete={() => deleteField(field.id)}
                />
              ))}

              {/* Add more fields */}
              {fields.length > 0 && (
                <button
                  type="button"
                  onClick={openAdd}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-2xl border border-dashed py-4 text-sm font-medium transition-all duration-150",
                    isAdding
                      ? "border-primary/50 text-primary bg-primary/5"
                      : "text-muted-foreground hover:border-foreground/25 hover:text-foreground hover:bg-muted/40"
                  )}
                >
                  <IconPlus className="size-4" />
                  Add field
                </button>
              )}
            </div>
          </div>
        </main>

        {/* Config panel */}
        <aside
          className={cn(
            "shrink-0 border-l overflow-hidden transition-[width] duration-200 ease-in-out",
            panelOpen ? "w-[480px]" : "w-0"
          )}
        >
          <div className="h-full w-[480px]">
            {panelOpen && (
              <ConfigPanel
                draft={draft}
                isNew={isAdding}
                otherFields={otherFields}
                onChange={updateDraft}
                onSave={isAdding ? commitAdd : commitEdit}
                onClose={closePanel}
                isSaving={isSaving}
              />
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
