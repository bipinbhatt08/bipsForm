import { z } from 'zod'

export const submitFormInputModel = z.object({
    formId: z.string().uuid().describe('ID of the form to submit'),
    values: z.record(z.string(), z.unknown()).describe('Form field values keyed by field ID'),
})

export const submitFormOutputModel = z.object({
    id: z.string().describe('ID of the created submission'),
})

export const getFormSubmissionsInputModel = z.object({
    formId: z.string().uuid(),
    page: z.number().int().min(1).default(1),
    pageSize: z.number().int().min(1).max(100).default(25),
    sortDir: z.enum(["asc", "desc"]).default("desc"),
})

export const getFormSubmissionsOutputModel = z.object({
    submissions: z.array(z.object({
        id: z.string(),
        values: z.unknown(),
        createdAt: z.date().nullable(),
    })),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
    totalPages: z.number(),
})

export const getFormAnalyticsInputModel = z.object({
    formId: z.string().uuid().describe('ID of the form'),
})

export const getFormAnalyticsOutputModel = z.object({
    totalSubmissions: z.number(),
    dailySubmissions: z.array(z.object({ date: z.string(), count: z.number() })),
})

export const getPublicStatsInputModel = z.undefined()
export const getPublicStatsOutputModel = z.object({
    totalForms: z.number(),
    totalResponses: z.number(),
})

export const getDashboardStatsInputModel = z.undefined()
export const getDashboardStatsOutputModel = z.object({
    totalForms: z.number(),
    publishedForms: z.number(),
    totalSubmissions: z.number(),
    dailySubmissions: z.array(z.object({ date: z.string(), count: z.number() })),
    topForms: z.array(z.object({ id: z.string(), title: z.string(), slug: z.string(), submissions: z.number() })),
})
