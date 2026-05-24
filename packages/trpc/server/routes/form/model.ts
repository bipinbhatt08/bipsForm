import { z } from 'zod'

export const createFormInputModel = z.object({
    title: z.string().min(1).max(55).describe('Title of the form'),
    description: z.string().max(500).optional().describe('Description of the form'),
    themeId: z.string().optional().describe('Theme id of the form'),
    responseLimit: z.number().int().positive().optional().describe('Maximum number of responses allowed'),
    expiresAt: z.coerce.date().optional().describe('Expiry date of the form'),
    isPublic: z.boolean().optional().describe('Whether the form is publicly discoverable'),
})

export const createFormOutputModel = z.object({
    id: z.string().describe('Id of the form'),
    slug: z.string().describe('Slug of the form'),
})

export const getMyFormsOutputModel = z.array(z.object({
    id: z.string().describe('Id of the form'),
    title: z.string().describe('Title of the form'),
    description: z.string().nullable().describe('Description of the form'),
    slug: z.string().describe('Slug of the form'),
    isPublished: z.boolean().nullable().describe('Whether the form is published'),
    isPublic: z.boolean().nullable().describe('Whether the form is publicly discoverable'),
    isLocked: z.boolean().nullable().describe('Whether the form is locked from new responses'),
    createdAt: z.date().nullable().describe('Date the form was created'),
    expiresAt: z.coerce.date().nullable().describe('Date the form expires'),
}))

// form field

const fieldTypeEnum = z.enum([
  "short_text", "long_text", "email", "number",
  "single_select", "multi_select", "rating", "date", "phone"
])

export const createFormFieldInputModel = z.object({
  formId: z.string().uuid().describe('Id of the form'),
  label: z.string().min(1).max(100).describe('Label shown to respondent'),
  description: z.string().optional().describe('Helper text below the field'),
  placeholder: z.string().optional().describe('Placeholder text for input'),
  isRequired: z.boolean().default(false).describe('Whether the field is required'),
  type: fieldTypeEnum.describe('Type of the field'),
  options: z.array(z.object({
    label: z.string().describe('Display label for the option'),
    value: z.string().describe('Value stored on submit'),
  })).optional().describe('Options for select fields'),
  validations: z.record(z.string(), z.unknown()).optional().describe('Validation rules for the field'),
  conditions: z.record(z.string(), z.unknown()).optional().describe('Show/hide conditions'),
})

export const createFormFieldOutputModel = z.object({
  id: z.string().describe('Id of the created field'),
})

export const getFormFieldsInputModel = z.object({
  formId: z.string().uuid().describe('Id of the form'),
})

const formFieldModel = z.object({
  id: z.string().describe('Id of the field'),
  label: z.string().describe('Label shown to respondent'),
  description: z.string().nullable().describe('Helper text below the field'),
  placeholder: z.string().nullable().describe('Placeholder text for input'),
  isRequired: z.boolean().describe('Whether the field is required'),
  type: fieldTypeEnum.describe('Type of the field'),
  options: z.array(z.object({
    label: z.string().describe('Display label for the option'),
    value: z.string().describe('Value stored on submit'),
  })).nullable().describe('Options for select fields'),
  validations: z.record(z.string(), z.unknown()).nullable().describe('Validation rules for the field'),
  conditions: z.record(z.string(), z.unknown()).nullable().describe('Show/hide conditions'),
})

export const getFormFieldsOutputModel = z.array(formFieldModel)

// get form by slug with fields

export const getFormBySlugInputModel = z.object({
    slug: z.string().describe('Slug of the form'),
})

export const getFormBySlugOutputModel = z.object({
    id: z.string().describe('Id of the form'),
    title: z.string().describe('Title of the form'),
    description: z.string().nullable().describe('Description of the form'),
    slug: z.string().describe('Slug of the form'),
    themeId: z.string().nullable().describe('Theme key for the form'),
    isPublished: z.boolean().nullable().describe('Whether the form is published'),
    isPublic: z.boolean().nullable().describe('Whether the form is publicly discoverable'),
    isLocked: z.boolean().nullable().describe('Whether the form is locked from new responses'),
    createdAt: z.date().nullable().describe('Date the form was created'),
    expiresAt: z.coerce.date().nullable().describe('Date the form expires'),
    fields: z.array(formFieldModel).describe('Fields belonging to this form'),
})
