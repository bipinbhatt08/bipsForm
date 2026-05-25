"use client"

import * as React from "react"
import { IconLoader2, IconStar, IconX } from "@tabler/icons-react"
import { Checkbox } from "~/components/ui/checkbox"
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTitle,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { Textarea } from "~/components/ui/textarea"
import { cn } from "~/lib/utils"
import { useGetFormFields, useGetForms } from "~/hooks/api/form"
import { THEMES, DEFAULT_THEME_KEY, themeToVars, type FormTheme } from "~/app/forms/[slug]/themes"
import * as DialogPrimitive from "@radix-ui/react-dialog"

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface FieldOption {
  label: string
  value: string
}

interface ApiField {
  id: string
  label: string
  description?: string | null
  type: string
  placeholder?: string | null
  isRequired?: boolean | null
  options?: unknown
  validations?: unknown
  conditions?: unknown
}

interface FieldCondition {
  fieldId: string
  operator: "equals" | "not_equals" | "contains" | "is_empty" | "is_filled"
  value: string
}

type FieldValues = Record<string, unknown>

function evaluateCondition(condition: FieldCondition, values: FieldValues): boolean {
  const actual = values[condition.fieldId]
  const str = Array.isArray(actual) ? actual.join(",") : String(actual ?? "")
  switch (condition.operator) {
    case "equals":     return str === condition.value
    case "not_equals": return str !== condition.value
    case "contains":   return str.includes(condition.value)
    case "is_filled":  return str.trim() !== ""
    case "is_empty":   return str.trim() === ""
    default:           return true
  }
}

function shouldShowField(field: ApiField, values: FieldValues): boolean {
  if (!field.conditions) return true
  return evaluateCondition(field.conditions as unknown as FieldCondition, values)
}

// ─── Rating input ─────────────────────────────────────────────────────────────

function RatingInput({
  max = 5,
  value,
  onChange,
  accentColor,
}: {
  max: number
  value: number
  onChange: (v: number) => void
  accentColor?: string
}) {
  const [hovered, setHovered] = React.useState(0)
  const active = hovered || value
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n === value ? 0 : n)}
          className="p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          <IconStar
            className="size-6 transition-colors"
            style={{
              fill: n <= active ? (accentColor ?? "#f59e0b") : "transparent",
              color: n <= active ? (accentColor ?? "#f59e0b") : "#a1a1aa55",
            }}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm" style={{ opacity: 0.6 }}>
          {value} / {max}
        </span>
      )}
    </div>
  )
}

// ─── Field renderer ───────────────────────────────────────────────────────────

function FieldRenderer({
  field,
  value,
  onChange,
  theme,
}: {
  field: ApiField
  value: unknown
  onChange: (v: unknown) => void
  theme: FormTheme
}) {
  const type = field.type as FieldType
  const options = (field.options ?? []) as FieldOption[]
  const validations = (field.validations ?? {}) as Record<string, number>
  const maxRating = validations.maxRating ?? 5

  const inputStyle: React.CSSProperties = {
    backgroundColor: theme.inputBackground,
    color: theme.textColor,
    borderColor: theme.borderColor,
  }

  const inputCls = "mt-1"
  let control: React.ReactNode

  switch (type) {
    case "short_text":
      control = <Input type="text" placeholder={field.placeholder ?? undefined} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} className={inputCls} style={inputStyle} />
      break
    case "long_text":
      control = <Textarea placeholder={field.placeholder ?? undefined} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} className="mt-1 min-h-[90px]" style={inputStyle} />
      break
    case "email":
      control = <Input type="email" placeholder={field.placeholder ?? "you@example.com"} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} className={inputCls} style={inputStyle} />
      break
    case "number":
      control = <Input type="number" placeholder={field.placeholder ?? undefined} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} className={inputCls} style={inputStyle} />
      break
    case "phone":
      control = <Input type="tel" placeholder={field.placeholder ?? undefined} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} className={inputCls} style={inputStyle} />
      break
    case "date":
      control = <Input type="date" value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} className={cn("mt-1 w-fit")} style={inputStyle} />
      break
    case "single_select":
      control = (
        <RadioGroup value={(value as string) ?? ""} onValueChange={onChange} className="mt-2 gap-2.5">
          {options.map((opt) => (
            <div key={opt.value} className="flex items-center gap-2.5">
              <RadioGroupItem value={opt.value} id={`prev-${field.id}-${opt.value}`} />
              <Label htmlFor={`prev-${field.id}-${opt.value}`} className="font-normal cursor-pointer" style={{ color: theme.textColor }}>
                {opt.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )
      break
    case "multi_select": {
      const selected = (value as string[]) ?? []
      control = (
        <div className="mt-2 flex flex-col gap-2.5">
          {options.map((opt) => (
            <div key={opt.value} className="flex items-center gap-2.5">
              <Checkbox
                id={`prev-${field.id}-${opt.value}`}
                checked={selected.includes(opt.value)}
                onCheckedChange={(checked) =>
                  onChange(checked ? [...selected, opt.value] : selected.filter((x) => x !== opt.value))
                }
              />
              <Label htmlFor={`prev-${field.id}-${opt.value}`} className="font-normal cursor-pointer" style={{ color: theme.textColor }}>
                {opt.label}
              </Label>
            </div>
          ))}
        </div>
      )
      break
    }
    case "rating":
      control = (
        <div className="mt-2">
          <RatingInput max={maxRating} value={(value as number) ?? 0} onChange={onChange} accentColor={theme.accentColor} />
        </div>
      )
      break
    default:
      control = <Input placeholder={field.placeholder ?? undefined} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} className={inputCls} style={inputStyle} />
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline gap-1">
        <Label className="text-sm font-medium leading-snug" style={{ color: theme.textColor }}>
          {field.label || "Untitled field"}
        </Label>
        {field.isRequired && (
          <span className="text-destructive text-sm font-semibold leading-none">*</span>
        )}
      </div>
      {field.description && (
        <p className="text-xs -mt-0.5" style={{ color: theme.mutedColor }}>
          {field.description}
        </p>
      )}
      {control}
    </div>
  )
}

// ─── Preview modal ────────────────────────────────────────────────────────────

interface FormPreviewSheetProps {
  formId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FormPreviewSheet({ formId, open, onOpenChange }: FormPreviewSheetProps) {
  const { forms } = useGetForms()
  const form = forms.find((f) => f.id === formId)
  const { fields, isLoading } = useGetFormFields(formId ?? "")

  const [values, setValues] = React.useState<FieldValues>({})

  React.useEffect(() => {
    if (open) setValues({})
  }, [open, formId])

  const themeKey = (form?.themeId && THEMES[form.themeId]) ? form.themeId : DEFAULT_THEME_KEY
  const theme = THEMES[themeKey]!.theme
  const themeVars = themeToVars(theme)

  const cardStyle: React.CSSProperties = {
    backgroundColor: theme.cardBackground,
    borderColor: theme.borderColor,
    borderRadius: theme.borderRadius,
    boxShadow: theme.cardShadow,
  }

  function setFieldValue(fieldId: string, value: unknown) {
    setValues((prev) => ({ ...prev, [fieldId]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/60 backdrop-blur-sm" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]",
            "w-full max-w-xl max-h-[90vh]",
            "flex flex-col overflow-hidden outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "duration-200"
          )}
          style={{
            ...themeVars,
            backgroundColor: theme.backgroundColor,
            color: theme.textColor,
            fontFamily: theme.fontFamily,
            borderRadius: theme.borderRadius,
            boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
          }}
        >
          {/* Header card — matches the real form's header card */}
          <div
            className="shrink-0 px-8 py-6 border-b"
            style={{ backgroundColor: theme.cardBackground, borderColor: theme.borderColor }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <DialogTitle
                  className="text-xl font-bold tracking-tight leading-snug"
                  style={{ color: theme.textColor }}
                >
                  {form?.title ?? "Form Preview"}
                </DialogTitle>
                {form?.description && (
                  <p className="mt-1.5 text-sm leading-relaxed" style={{ color: theme.mutedColor }}>
                    {form.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  style={{ backgroundColor: `${theme.accentColor}22`, color: theme.accentColor }}
                >
                  Preview
                </span>
                <DialogPrimitive.Close
                  className="rounded-full p-1 transition-opacity opacity-60 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{ color: theme.textColor }}
                >
                  <IconX className="size-4" />
                </DialogPrimitive.Close>
              </div>
            </div>
          </div>

          {/* Scrollable fields area */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {isLoading ? (
              <div className="flex items-center justify-center py-16 gap-2" style={{ color: theme.mutedColor }}>
                <IconLoader2 className="size-4 animate-spin" />
                <span className="text-sm">Loading fields…</span>
              </div>
            ) : fields.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                <p className="text-sm font-medium" style={{ color: theme.mutedColor }}>No fields yet</p>
                <p className="text-xs" style={{ color: theme.mutedColor }}>
                  Add fields in the form builder to see them here.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {fields.map((field) => {
                  const visible = shouldShowField(field, values)
                  return (
                    <div
                      key={field.id}
                      className="border px-6 py-5 transition-all duration-300"
                      style={{ ...cardStyle, display: visible ? undefined : "none" }}
                    >
                      <FieldRenderer
                        field={field}
                        value={values[field.id]}
                        onChange={(v) => setFieldValue(field.id, v)}
                        theme={theme}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="shrink-0 border-t px-6 py-4"
            style={{ borderColor: theme.borderColor, backgroundColor: theme.cardBackground }}
          >
            <button
              type="button"
              disabled
              className="w-full px-4 py-2.5 text-sm font-semibold opacity-50 cursor-not-allowed"
              style={{
                backgroundColor: theme.accentColor,
                color: theme.accentForeground ?? "#ffffff",
                borderRadius: theme.borderRadius,
              }}
            >
              Submit (preview only)
            </button>
            <p className="mt-3 text-center text-xs" style={{ color: theme.mutedColor }}>
              Powered by BipsForm
            </p>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}
