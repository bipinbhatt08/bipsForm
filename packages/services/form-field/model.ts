import { z } from 'zod'

const fieldTypeEnum = z.enum([
  "short_text", "long_text", "email", "number",
  "single_select", "multi_select", "rating", "date", "phone"
])

export const createFormFieldInput = z.object({
  formId: z.string().uuid().describe('Id of the form'),
  label: z.string().min(1).max(100).describe('Label shown to respondent'),
  description: z.string().optional().describe('Helper text below the field'),
  placeholder: z.string().optional().describe('Placeholder text for input'),
  isRequired: z.boolean().default(false).describe('Whether the field is required'),
  type: fieldTypeEnum.describe('Type of the field'),
  options: z.array(z.object({
    label: z.string().describe('Display label for the option'),
    value: z.string().describe('Value stored on submit'),
  })).optional().describe('Options for select fields only'),
  validations: z.record(z.string(), z.unknown()).optional().describe('Validation rules'),
  conditions: z.record(z.string(), z.unknown()).optional().describe('Show/hide conditions'),
})

export type CreateFormFieldInputType = z.infer<typeof createFormFieldInput>

export const updateFormFieldInput = z.object({
  fieldId: z.string().uuid(),
  formId: z.string().uuid(),
  label: z.string().min(1).max(100).optional(),
  description: z.string().nullable().optional(),
  placeholder: z.string().nullable().optional(),
  isRequired: z.boolean().optional(),
  options: z.array(z.object({
    label: z.string(),
    value: z.string(),
  })).nullable().optional(),
  validations: z.record(z.string(), z.unknown()).nullable().optional(),
  conditions: z.record(z.string(), z.unknown()).nullable().optional(),
})
export type UpdateFormFieldInputType = z.infer<typeof updateFormFieldInput>

export const reorderFieldsInput = z.object({
  formId: z.string().uuid(),
  fields: z.array(z.object({
    id: z.string().uuid(),
    index: z.string(),
  })),
})
export type ReorderFieldsInputType = z.infer<typeof reorderFieldsInput>