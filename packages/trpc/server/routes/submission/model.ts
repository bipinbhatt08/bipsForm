import { z } from 'zod'

export const submitFormInputModel = z.object({
    formId: z.string().uuid().describe('ID of the form to submit'),
    values: z.record(z.string(), z.unknown()).describe('Form field values keyed by field ID'),
})

export const submitFormOutputModel = z.object({
    id: z.string().describe('ID of the created submission'),
})

export const getFormSubmissionsInputModel = z.object({
    formId: z.string().uuid().describe('ID of the form'),
})

export const getFormSubmissionsOutputModel = z.array(z.object({
    id: z.string().describe('ID of the submission'),
    values: z.unknown().describe('Submitted values'),
    createdAt: z.date().nullable().describe('Submission timestamp'),
}))

export const getFormAnalyticsInputModel = z.object({
    formId: z.string().uuid().describe('ID of the form'),
})

export const getFormAnalyticsOutputModel = z.object({
    totalSubmissions: z.number(),
    dailySubmissions: z.array(z.object({ date: z.string(), count: z.number() })),
})
