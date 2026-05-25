import { z } from "zod"

export type Field = {
  id: string
  label: string
  type:
    | "short_text"
    | "long_text"
    | "email"
    | "number"
    | "single_select"
    | "multi_select"
    | "rating"
    | "date"
    | "phone"

  isRequired: boolean

  options?: {
    label: string
    value: string
  }[] | null

  validations?: {
    minLength?: number
    maxLength?: number

    min?: number
    max?: number

    maxRating?: number

    minDate?: string
    maxDate?: string
  } | null
}

 function generateFieldSchema(field: Field) {
  const validations = field.validations || {}

  let schema: z.ZodTypeAny

  switch (field.type) {

    // ─────────────────────────────
    // SHORT TEXT / LONG TEXT
    // ─────────────────────────────
    case "short_text":
    case "long_text": {
      let s = z.string()

      if (field.isRequired) {
        s = s.min(1, `${field.label} is required`)
      }

      if (validations.minLength !== undefined) {
        s = s.min(
          validations.minLength,
          `${field.label} must be at least ${validations.minLength} characters`
        )
      }

      if (validations.maxLength !== undefined) {
        s = s.max(
          validations.maxLength,
          `${field.label} must be at most ${validations.maxLength} characters`
        )
      }

      schema = s
      break
    }

    // ─────────────────────────────
    // EMAIL
    // ─────────────────────────────
    case "email": {
      let s = z.string().email("Invalid email")

      if (field.isRequired) {
        s = s.min(1, `${field.label} is required`)
      }

      schema = s
      break
    }

    // ─────────────────────────────
    // NUMBER
    // ─────────────────────────────
    case "number": {
      let s = z.number()

      if (validations.min !== undefined) {
        s = s.min(validations.min)
      }

      if (validations.max !== undefined) {
        s = s.max(validations.max)
      }

      schema = s
      break
    }

    // ─────────────────────────────
    // SINGLE SELECT
    // ─────────────────────────────
    case "single_select": {
      const allowedValues =
        field.options?.map((o) => o.value) || []

      schema = z.string().refine(
        (value) => allowedValues.includes(value),
        {
          message: `Invalid option selected for ${field.label}`,
        }
      )

      break
    }

    // ─────────────────────────────
    // MULTI SELECT
    // ─────────────────────────────
    case "multi_select": {
      const allowedValues =
        field.options?.map((o) => o.value) || []

      schema = z.array(
        z.string().refine(
          (value) => allowedValues.includes(value),
          {
            message: `Invalid option selected for ${field.label}`,
          }
        )
      )

      break
    }

    // ─────────────────────────────
    // RATING
    // ─────────────────────────────
    case "rating": {
      let s = z.number().min(1)

      if (validations.maxRating !== undefined) {
        s = s.max(validations.maxRating)
      }

      schema = s
      break
    }

    // ─────────────────────────────
    // DATE
    // ─────────────────────────────
    case "date": {
      schema = z.string()
        .refine(
          (date) => !validations.minDate || new Date(date) >= new Date(validations.minDate),
          {
            message: `${field.label} must be after ${validations.minDate}`,
          }
        )
        .refine(
          (date) => !validations.maxDate || new Date(date) <= new Date(validations.maxDate),
          {
            message: `${field.label} must be before ${validations.maxDate}`,
          }
        )

      break
    }

    // ─────────────────────────────
    // PHONE
    // ─────────────────────────────
    case "phone": {
      schema = z.string().regex(
        /^[0-9+\-\s()]+$/,
        "Invalid phone number"
      )

      break
    }

    default:
      schema = z.any()
  }

  // ─────────────────────────────
  // OPTIONAL FIELD HANDLING
  // ─────────────────────────────
  if (!field.isRequired) {
    schema = schema.optional()
  }

  return schema
}

export  default function generateFormSchema(fields: Field[]) {
  const shape: Record<string, z.ZodTypeAny> = {}

  for (const field of fields) {
    shape[field.id] = generateFieldSchema(field)
  }

  return z.object(shape)
}
