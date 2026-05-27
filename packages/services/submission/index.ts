import { and, asc, count, db, desc, eq, inArray, sql } from "@repo/database"
import { formsTable } from "@repo/database/models/form"
import { submissionTable } from "@repo/database/models/form-submission"
import FormService from "../form"
import { CustomError } from "../utils/errors"
import generateFormSchema, { Field } from "../utils/form-schema"

class SubmissionService {
    private formService = new FormService()

    public async submitForm(formId: string, payload: Record<string, unknown>) {
        const formExist = await this.formService.checkFormExistance(formId)
        if (!formExist) throw CustomError.notFound("Form not found")

        if (!formExist.isPublished) throw CustomError.badRequest("This form is not published")
        if (formExist.expiresAt && new Date(formExist.expiresAt) < new Date())
            throw CustomError.badRequest("This form has expired")

        if (formExist.responseLimit) {
            const result = await db
                .select({ total: count() })
                .from(submissionTable)
                .where(eq(submissionTable.formId, formId))
            const total = result[0]?.total ?? 0
            if (total >= formExist.responseLimit)
                throw CustomError.badRequest("This form has reached its response limit")
        }

        const formWithFields = await this.formService.getFormWithFieldsBySlug(formExist.slug)
        const { fields } = formWithFields

        const schema = generateFormSchema(fields as unknown as Field[], payload)

        const result = schema.safeParse(payload)
        if (!result.success) throw CustomError.badRequest(result.error.issues[0]?.message ?? "Invalid form data")

        const [submission] = await db
            .insert(submissionTable)
            .values({ formId, values: result.data })
            .returning({ id: submissionTable.id })

        if (!submission) throw CustomError.internal("Failed to save submission")

        return submission
    }

    public async getFormAnalytics(formId: string, userId: string) {
        await this.formService.verifyFormOwnership(formId, userId)

        const [totalResult, dailyResult] = await Promise.all([
            db.select({ total: count() }).from(submissionTable).where(eq(submissionTable.formId, formId)),

            db.select({
                date: sql<string>`DATE(${submissionTable.createdAt})`.as("date"),
                count: count(),
            })
            .from(submissionTable)
            .where(eq(submissionTable.formId, formId))
            .groupBy(sql`DATE(${submissionTable.createdAt})`)
            .orderBy(sql`DATE(${submissionTable.createdAt})`),
        ])

        return {
            totalSubmissions: totalResult[0]?.total ?? 0,
            dailySubmissions: dailyResult.map(r => ({ date: r.date, count: r.count })),
        }
    }

    public async getDashboardStats(userId: string) {
        const userForms = await db
            .select({ id: formsTable.id, title: formsTable.title, slug: formsTable.slug, isPublished: formsTable.isPublished })
            .from(formsTable)
            .where(eq(formsTable.createdBy, userId))

        const formIds = userForms.map((f) => f.id)
        const publishedCount = userForms.filter((f) => f.isPublished).length

        if (formIds.length === 0) {
            return { totalForms: 0, publishedForms: 0, totalSubmissions: 0, dailySubmissions: [], topForms: [] }
        }

        const [totalResult, dailyResult, perFormResult] = await Promise.all([
            db.select({ total: count() }).from(submissionTable).where(inArray(submissionTable.formId, formIds)),
            db.select({
                date: sql<string>`DATE(${submissionTable.createdAt})`.as("date"),
                count: count(),
            })
            .from(submissionTable)
            .where(inArray(submissionTable.formId, formIds))
            .groupBy(sql`DATE(${submissionTable.createdAt})`)
            .orderBy(sql`DATE(${submissionTable.createdAt})`),
            db.select({ formId: submissionTable.formId, count: count() })
            .from(submissionTable)
            .where(inArray(submissionTable.formId, formIds))
            .groupBy(submissionTable.formId),
        ])

        const perFormMap = Object.fromEntries(perFormResult.map((r) => [r.formId, r.count]))
        const topForms = userForms
            .map((f) => ({ id: f.id, title: f.title, slug: f.slug, submissions: perFormMap[f.id] ?? 0 }))
            .sort((a, b) => b.submissions - a.submissions)
            .slice(0, 5)

        return {
            totalForms: userForms.length,
            publishedForms: publishedCount,
            totalSubmissions: totalResult[0]?.total ?? 0,
            dailySubmissions: dailyResult.map((r) => ({ date: r.date, count: r.count })),
            topForms,
        }
    }

    public async getFormSubmissions(
        formId: string,
        userId: string,
        page: number,
        pageSize: number,
        sortDir: "asc" | "desc",
    ) {
        await this.formService.verifyFormOwnership(formId, userId)

        const offset = (page - 1) * pageSize
        const order = sortDir === "asc" ? asc(submissionTable.createdAt) : desc(submissionTable.createdAt)

        const [rows, totalResult] = await Promise.all([
            db
                .select({ id: submissionTable.id, values: submissionTable.values, createdAt: submissionTable.createdAt })
                .from(submissionTable)
                .where(eq(submissionTable.formId, formId))
                .orderBy(order)
                .limit(pageSize)
                .offset(offset),
            db.select({ total: count() }).from(submissionTable).where(eq(submissionTable.formId, formId)),
        ])

        const total = totalResult[0]?.total ?? 0
        return {
            submissions: rows,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        }
    }
}

export default SubmissionService