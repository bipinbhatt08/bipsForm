import { asc, count, db, desc, eq, sql } from "@repo/database"
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