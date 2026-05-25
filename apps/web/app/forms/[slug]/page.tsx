"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { IconLoader2, IconStar } from "@tabler/icons-react"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { Textarea } from "~/components/ui/textarea"
import { cn } from "~/lib/utils"
import { useGetFormBySlug } from "~/hooks/api/form"
import { THEMES, DEFAULT_THEME_KEY, themeToVars, type FormTheme } from "./themes"

// ─── Types derived from the API ───────────────────────────────────────────────

type FormData = NonNullable<ReturnType<typeof useGetFormBySlug>["form"]>
type FormField = FormData["fields"][number]
type FieldOption = { label: string; value: string }

type FieldValues = Record<string, unknown>
type FieldErrors = Record<string, string>

interface FieldCondition {
  fieldId: string
  operator: "equals" | "not_equals" | "contains" | "is_empty" | "is_filled"
  value: string
}

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

function shouldShowField(field: FormField, values: FieldValues): boolean {
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
        <span className="ml-2 text-sm text-muted-foreground">{value} / {max}</span>
      )}
    </div>
  )
}

// ─── Single field renderer ────────────────────────────────────────────────────

function FieldRenderer({
  field,
  value,
  onChange,
  error,
  theme,
}: {
  field: FormField
  value: unknown
  onChange: (v: unknown) => void
  error?: string
  theme: FormTheme
}) {
  const options = (field.options ?? []) as FieldOption[]
  const validations = (field.validations ?? {}) as Record<string, number>
  const maxRating = validations.maxRating ?? 5

  const inputStyle: React.CSSProperties = {
    backgroundColor: theme.inputBackground,
    color: theme.textColor,
    borderColor: error ? undefined : theme.borderColor,
  }

  const inputCls = cn("mt-1", error && "border-destructive focus-visible:ring-destructive")

  let control: React.ReactNode

  switch (field.type) {
    case "short_text":
      control = <Input type="text" placeholder={field.placeholder ?? undefined} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} className={inputCls} style={inputStyle} />
      break

    case "long_text":
      control = <Textarea placeholder={field.placeholder ?? undefined} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} className={cn("mt-1 min-h-[100px]", error && "border-destructive")} style={inputStyle} />
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
      control = <Input type="date" value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} className={cn("mt-1 w-fit", error && "border-destructive")} style={inputStyle} />
      break

    case "single_select":
      control = (
        <RadioGroup value={(value as string) ?? ""} onValueChange={onChange} className="mt-2 gap-2.5">
          {options.map((opt) => (
            <div key={opt.value} className="flex items-center gap-2.5">
              <RadioGroupItem value={opt.value} id={`${field.id}-${opt.value}`} />
              <Label htmlFor={`${field.id}-${opt.value}`} className="font-normal cursor-pointer" style={{ color: theme.textColor }}>
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
                id={`${field.id}-${opt.value}`}
                checked={selected.includes(opt.value)}
                onCheckedChange={(checked) =>
                  onChange(checked ? [...selected, opt.value] : selected.filter((x) => x !== opt.value))
                }
              />
              <Label htmlFor={`${field.id}-${opt.value}`} className="font-normal cursor-pointer" style={{ color: theme.textColor }}>
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
        {field.isRequired && <span className="text-destructive text-sm font-semibold leading-none">*</span>}
      </div>
      {field.description && (
        <p className="text-xs -mt-0.5" style={{ color: theme.mutedColor }}>
          {field.description}
        </p>
      )}
      {control}
      {error && <p className="text-xs text-destructive mt-0.5">{error}</p>}
    </div>
  )
}

// ─── Full-page states ─────────────────────────────────────────────────────────

function CenteredState({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 text-center">
      {children}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PublicFormPage() {
  const params = useParams()
  const slug = params.slug as string

  const { form, isLoading, isError } = useGetFormBySlug(slug)

  const themeKey = (form?.themeId && THEMES[form.themeId]) ? form.themeId : DEFAULT_THEME_KEY
  const theme = THEMES[themeKey]!.theme
  const themeVars = themeToVars(theme)

  const [values, setValues] = React.useState<FieldValues>({})
  const [errors, setErrors] = React.useState<FieldErrors>({})
  const [submitted, setSubmitted] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  function setFieldValue(fieldId: string, value: unknown) {
    setValues((prev) => ({ ...prev, [fieldId]: value }))
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[fieldId]
        return next
      })
    }
  }

  function validate(): boolean {
    if (!form) return false
    const newErrors: FieldErrors = {}
    for (const field of form.fields) {
      if (!shouldShowField(field, values)) continue
      if (!field.isRequired) continue
      const val = values[field.id]
      const isEmpty =
        val === undefined ||
        val === null ||
        val === "" ||
        val === 0 ||
        (Array.isArray(val) && val.length === 0)
      if (isEmpty) newErrors[field.id] = "This field is required"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) {
      toast.error("Please fill in all required fields")
      return
    }
    setIsSubmitting(true)
    try {
      // TODO: replace with submitForm mutation once backend endpoint is ready
      await new Promise((r) => setTimeout(r, 600))
      setSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Loading ──
  if (isLoading) {
    return (
      <CenteredState>
        <IconLoader2 className="size-6 animate-spin text-muted-foreground" />
      </CenteredState>
    )
  }

  // ── Error / not found ──
  if (isError || !form) {
    return (
      <CenteredState>
        <div>
          <p className="text-lg font-semibold">Form not found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            This form doesn&apos;t exist or is no longer available.
          </p>
        </div>
      </CenteredState>
    )
  }


  // ── Not published ──
  // if (!form.isPublished) {
  //   return (
  //     <CenteredState>
  //       <div>
  //         <p className="text-lg font-semibold">Form not available</p>
  //         <p className="mt-1 text-sm text-muted-foreground">
  //           This form hasn&apos;t been published yet.
  //         </p>
  //       </div>
  //     </CenteredState>
  //   )
  // }

  // ── Expired ──
  if (form.expiresAt && new Date(form.expiresAt) < new Date()) {
    return (
      <CenteredState>
        <div>
          <p className="text-lg font-semibold">Form closed</p>
          <p className="mt-1 text-sm text-muted-foreground">
            This form is no longer accepting responses.
          </p>
        </div>
      </CenteredState>
    )
  }

  // ── Locked ──
  if (form.isLocked) {
    return (
      <CenteredState>
        <div>
          <p className="text-lg font-semibold">Form locked</p>
          <p className="mt-1 text-sm text-muted-foreground">
            This form is temporarily closed for new responses.
          </p>
        </div>
      </CenteredState>
    )
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: theme.cardBackground,
    borderColor: theme.borderColor,
    borderRadius: theme.borderRadius,
    boxShadow: theme.cardShadow,
  }

  // ── Success ──
  if (submitted) {
    return (
      <div className="min-h-screen transition-colors duration-300" style={{ ...themeVars, backgroundColor: theme.backgroundColor }}>
        <CenteredState>
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full p-5" style={{ backgroundColor: `${theme.accentColor}22` }}>
              <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke={theme.accentColor ?? "currentColor"} strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-xl font-semibold" style={{ color: theme.textColor }}>Thank you!</p>
              <p className="mt-1.5 text-sm max-w-sm leading-relaxed" style={{ color: theme.mutedColor }}>
                Your response has been submitted successfully.
              </p>
            </div>
          </div>
        </CenteredState>
      </div>
    )
  }

  // ── Form ──
  return (
    <div
      className="min-h-screen py-12 px-4 transition-colors duration-300"
      style={{ ...themeVars, backgroundColor: theme.backgroundColor, color: theme.textColor }}
    >
      <div className="mx-auto max-w-xl">

        {/* Header card */}
        <div className="mb-5 border px-8 py-7 transition-all duration-300" style={cardStyle}>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: theme.textColor }}>
            {form.title}
          </h1>
          {form.description && (
            <p className="mt-2 text-sm leading-relaxed" style={{ color: theme.mutedColor }}>
              {form.description}
            </p>
          )}
        </div>

        {/* Fields */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-4">
            {form.fields.map((field) => {
              const visible = shouldShowField(field, values)
              return (
                <div
                  key={field.id}
                  className="border px-8 py-6 transition-all duration-300"
                  style={{ ...cardStyle, display: visible ? undefined : "none" }}
                >
                  <FieldRenderer
                    field={field}
                    value={values[field.id]}
                    onChange={(v) => setFieldValue(field.id, v)}
                    error={errors[field.id]}
                    theme={theme}
                  />
                </div>
              )
            })}

            <Button
              type="submit"
              size="lg"
              className="w-full font-semibold transition-opacity hover:opacity-90"
              disabled={isSubmitting}
              style={{
                backgroundColor: theme.accentColor,
                color: theme.accentForeground ?? "#ffffff",
                borderRadius: theme.borderRadius,
              }}
            >
              {isSubmitting ? (
                <><IconLoader2 className="size-4 animate-spin" />Submitting…</>
              ) : "Submit"}
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs" style={{ color: theme.mutedColor }}>
          Powered by BipsForm
        </p>
      </div>

    </div>
  )
}
