import { randomBytes } from 'node:crypto'
import { db } from '@repo/database'
import { formsTable } from '@repo/database/models/form'
import { CustomError } from '../utils/errors'
import { createFormInput, CreateFormInputType } from './model'

class FormService {

    private generateSlug(title: string) {
        const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        const suffix = randomBytes(4).toString('hex')
        return `${base}-${suffix}`
    }

    public async createForm(userId: string, payload: CreateFormInputType) {
        const { title, description, themeId, responseLimit, expiresAt } = await createFormInput.parseAsync(payload)
        const slug = this.generateSlug(title)

        const result = await db
            .insert(formsTable)
            .values({ title, description, themeId, responseLimit, expiresAt, createdBy: userId, slug})
            .returning({ id: formsTable.id, slug: formsTable.slug })

        if (!result || result.length === 0 || !result[0]?.id)
            throw CustomError.internal("Something went wrong while creating a form")

        return result[0]!
    }

}

export default FormService
