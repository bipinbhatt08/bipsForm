import { db, desc, eq } from "@repo/database"
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

        const formWithFields = await this.formService.getFormWithFieldsBySlug(formExist.slug)
        const { fields } = formWithFields

        const schema = generateFormSchema(fields as unknown as Field[])

        const result = schema.safeParse(payload)
        if (!result.success) throw CustomError.badRequest(result.error.issues[0]?.message ?? "Invalid form data")

        const [submission] = await db
            .insert(submissionTable)
            .values({ formId, values: result.data })
            .returning({ id: submissionTable.id })

        if (!submission) throw CustomError.internal("Failed to save submission")

        return submission
    }

    public async getFormSubmissions(formId: string, userId: string) {
        await this.formService.verifyFormOwnership(formId, userId)

        return db
            .select({
                id: submissionTable.id,
                values: submissionTable.values,
                createdAt: submissionTable.createdAt,
            })
            .from(submissionTable)
            .where(eq(submissionTable.formId, formId))
            .orderBy(desc(submissionTable.createdAt))
    }
}

export default SubmissionService