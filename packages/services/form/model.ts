import { z } from 'zod'

export const createFormInput = z.object({
    title: z.string().min(1).max(55).describe('Title of the form'),
    description: z.string().max(500).optional().describe('Description of the form'),
    themeId: z.string().optional().describe('Theme id of the form'),
    responseLimit: z.number().int().positive().optional().describe('Maximum number of responses allowed'),
    expiresAt: z.coerce.date().optional().describe('Expiry date of the form'),
    isPublic: z.boolean().optional().describe('Whether the form is publicly discoverable'),
})
export type CreateFormInputType = z.infer<typeof createFormInput>

export const updateFormInput = z.object({
    title: z.string().min(1).max(55).optional(),
    description: z.string().max(500).nullable().optional(),
    themeId: z.string().nullable().optional(),
    responseLimit: z.number().int().positive().nullable().optional(),
    expiresAt: z.coerce.date().nullable().optional(),
    isPublic: z.boolean().optional(),
    isPublished: z.boolean().optional(),
})
export type UpdateFormInputType = z.infer<typeof updateFormInput>
