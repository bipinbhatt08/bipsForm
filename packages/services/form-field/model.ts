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