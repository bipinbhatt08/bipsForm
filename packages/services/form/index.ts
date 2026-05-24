import { randomBytes } from 'node:crypto'
import { and, db, eq } from '@repo/database'
import { formsTable } from '@repo/database/models/form'
import { CustomError } from '../utils/errors'
import { createFormInput, CreateFormInputType } from './model'

class FormService {

    private generateSlug(title: string) {
        const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        const suffix = randomBytes(4).toString('hex')
        return `${base}-${suffix}`
    }

    public async checkFormExistance(formId:string){
        const formExists = await db.select().from(formsTable).where(eq(formsTable.id, formId))
        if(formExists.length === 0) return null
        return formExists[0]
    }
    public async getMyForms(userId: string) {
        return db
            .select({
                id: formsTable.id,
                title: formsTable.title,
                description: formsTable.description,
                slug: formsTable.slug,
                isPublished: formsTable.isPublished,
                isPublic: formsTable.isPublic,
                isLocked: formsTable.isLocked,
                createdAt: formsTable.createdAt,
                expiresAt: formsTable.expiresAt
                
            })
            .from(formsTable)
            .where(eq(formsTable.createdBy, userId))
            .orderBy(formsTable.createdAt)
    }

    public async createForm(userId: string, payload: CreateFormInputType) {
        const { title, description, themeId, responseLimit, expiresAt, isPublic } = await createFormInput.parseAsync(payload)
        const slug = this.generateSlug(title)

        const result = await db
            .insert(formsTable)
            .values({ title, description, themeId, responseLimit, expiresAt, isPublic, createdBy: userId, slug})
            .returning({ id: formsTable.id, slug: formsTable.slug })

        if (!result || result.length === 0 || !result[0]?.id)
            throw CustomError.internal("Something went wrong while creating a form")

        return result[0]!
    }

    public async verifyFormOwnership(formId: string, userId: string) {
        const form = await db
            .select({ id: formsTable.id })
            .from(formsTable)
            .where(
                and(
                    eq(formsTable.id, formId),
                    eq(formsTable.createdBy, userId)
                )
            )
            .limit(1)

        if (!form || form.length === 0)
            throw CustomError.forbidden("You do not have access to this form")
    }

    public async getFormWithFieldsBySlug(slug: string) {
        const form = await db.query.formsTable.findFirst({
            where: eq(formsTable.slug, slug),
            with: { fields: true },
        })

        if (!form) throw CustomError.notFound("Form not found")

        return form
    }
    

}

export default FormService
