"use client"

import * as React from "react"
import {
  IconAlignLeft,
  IconCalendar,
  IconCheckbox,
  IconHash,
  IconLetterCase,
  IconList,
  IconLoader2,
  IconMail,
  IconPhone,
  IconStar,
} from "@tabler/icons-react"
import { Checkbox } from "~/components/ui/checkbox"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet"
import { Textarea } from "~/components/ui/textarea"
import { cn } from "~/lib/utils"
import { useGetFormFields, useGetForms } from "~/hooks/api/form"

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
}

function RatingInput({ max = 5 }: { max?: number }) {
  const [hovered, setHovered] = React.useState(0)
  const [selected, setSelected] = React.useState(0)
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => setSelected(n === selected ? 0 : n)}
          className="p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          <IconStar
            className={cn(
              "size-6 transition-colors",
              n <= (hovered || selected)
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/40"
            )}
          />
        </button>
      ))}
      {selected > 0 && (
        <span className="ml-2 text-sm text-muted-foreground">
          {selected} / {max}
        </span>
      )}
    </div>
  )
}

function FieldPreview({ field }: { field: ApiField }) {
  const type = field.type as FieldType
  const options = (field.options ?? []) as FieldOption[]
  const validations = (field.validations ?? {}) as Record<string, number>
  const maxRating = validations.maxRating ?? 5
  const [checked, setChecked] = React.useState<string[]>([])

  const inputProps = {
    placeholder: field.placeholder ?? undefined,
    className: "mt-1",
  }

  let control: React.ReactNode

  switch (type) {
    case "short_text":
      control = <Input type="text" {...inputProps} />
      break
    case "long_text":
      control = <Textarea {...inputProps} className="mt-1 min-h-[80px]" />
      break
    case "email":
      control = <Input type="email" {...inputProps} />
      break
    case "number":
      control = <Input type="number" {...inputProps} />
      break
    case "phone":
      control = <Input type="tel" {...inputProps} />
      break
    case "date":
      control = <Input type="date" className="mt-1 w-fit" />
      break
    case "single_select":
      control = (
        <RadioGroup className="mt-2 gap-2">
          {options.map((opt) => (
            <div key={opt.value} className="flex items-center gap-2.5">
              <RadioGroupItem value={opt.value} id={`${field.id}-${opt.value}`} />
              <Label htmlFor={`${field.id}-${opt.value}`} className="font-normal cursor-pointer">
                {opt.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )
      break
    case "multi_select":
      control = (
        <div className="mt-2 flex flex-col gap-2">
          {options.map((opt) => (
            <div key={opt.value} className="flex items-center gap-2.5">
              <Checkbox
                id={`${field.id}-${opt.value}`}
                checked={checked.includes(opt.value)}
                onCheckedChange={(v) =>
                  setChecked((prev) =>
                    v ? [...prev, opt.value] : prev.filter((x) => x !== opt.value)
                  )
                }
              />
              <Label htmlFor={`${field.id}-${opt.value}`} className="font-normal cursor-pointer">
                {opt.label}
              </Label>
            </div>
          ))}
        </div>
      )
      break
    case "rating":
      control = (
        <div className="mt-2">
          <RatingInput max={maxRating} />
        </div>
      )
      break
    default:
      control = <Input {...inputProps} />
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-baseline gap-1">
        <Label className="text-sm font-medium leading-snug">
          {field.label || "Untitled field"}
        </Label>
        {field.isRequired && (
          <span className="text-destructive text-sm font-semibold leading-none">*</span>
        )}
      </div>
      {field.description && (
        <p className="mt-0.5 text-xs text-muted-foreground">{field.description}</p>
      )}
      {control}
    </div>
  )
}

const TYPE_ICONS: Partial<Record<FieldType, React.ElementType>> = {
  short_text: IconLetterCase,
  long_text: IconAlignLeft,
  email: IconMail,
  number: IconHash,
  phone: IconPhone,
  date: IconCalendar,
  single_select: IconList,
  multi_select: IconCheckbox,
  rating: IconStar,
}

interface FormPreviewSheetProps {
  formId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FormPreviewSheet({ formId, open, onOpenChange }: FormPreviewSheetProps) {
  const { forms } = useGetForms()
  const form = forms.find((f) => f.id === formId)
  const { fields, isLoading } = useGetFormFields(formId ?? "")

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex flex-col gap-0 p-0 sm:max-w-lg w-full"
        showCloseButton={false}
      >
        {/* Header */}
        <SheetHeader className="shrink-0 border-b px-6 py-5 gap-0">
          <div className="flex items-start justify-between gap-4 pr-6">
            <div className="min-w-0">
              <SheetTitle className="text-base font-semibold leading-snug truncate">
                {form?.title ?? "Form Preview"}
              </SheetTitle>
              {form?.description && (
                <SheetDescription className="mt-1 text-sm leading-relaxed">
                  {form.description}
                </SheetDescription>
              )}
            </div>
            <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
              Preview
            </span>
          </div>
        </SheetHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
              <IconLoader2 className="size-4 animate-spin" />
              <span className="text-sm">Loading fields…</span>
            </div>
          ) : fields.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <p className="text-sm font-medium text-muted-foreground">No fields yet</p>
              <p className="text-xs text-muted-foreground">
                Add fields in the form builder to see them here.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {fields.map((field, idx) => {
                const Icon = TYPE_ICONS[field.type as FieldType]
                return (
                  <div key={field.id} className="flex flex-col gap-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                        {idx + 1}
                      </span>
                      {Icon && <Icon className="size-3.5 text-muted-foreground/60 shrink-0" />}
                    </div>
                    <FieldPreview field={field} />
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t px-6 py-4 bg-muted/30">
          <button
            type="button"
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground opacity-60 cursor-not-allowed"
            disabled
          >
            Submit (preview only)
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
