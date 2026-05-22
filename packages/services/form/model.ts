import { z } from 'zod'

export const createFormInput = z.object({
    title: z.string().min(1).max(55).describe('Title of the form'),
    description: z.string().max(500).optional().describe('Description of the form'),
    themeId: z.string().optional().describe('Theme id of the form'),
    responseLimit: z.number().int().positive().optional().describe('Maximum number of responses allowed'),
    expiresAt: z.coerce.date().optional().describe('Expiry date of the form')
})
export type CreateFormInputType = z.infer<typeof createFormInput>
