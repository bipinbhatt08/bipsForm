import { and, db, desc, eq } from '@repo/database'
import { formFieldsTable } from '@repo/database/models/form-field'
import { CustomError } from '../utils/errors'
import { createFormFieldInput, CreateFormFieldInputType } from './model'
import { formsTable } from '@repo/database/models/form'

class FormFieldService {

    private async getNextIndex(formId: string): Promise<string> {
    const last = await db
        .select({ index: formFieldsTable.index })
        .from(formFieldsTable)
        .where(eq(formFieldsTable.formId, formId))
        .orderBy(desc(formFieldsTable.index))
        .limit(1)

    return last[0] 
        ? (Math.round((Number(last[0].index) + 1) * 100) / 100).toFixed(2)  // "1.00", "2.00"
        : '0.00'  //starts at 0.00 up to 99.00
    }

     private async verifyFormOwnership(formId: string, userId: string) {
        const form = await db
        .select({ id: formsTable.id })
        .from(formsTable)
        .where(
            and(
            eq(formsTable.id, formId),
            eq(formsTable.createdBy, userId)  // ✅ must belong to this user
            )
        )
        .limit(1)

        if (!form || form.length === 0)
        throw CustomError.forbidden("You do not have access to this form")
    }

    public async createFormField(userId:string, payload: CreateFormFieldInputType) {
        const { label, description, placeholder, isRequired, type, options, validations, conditions,formId } =
            await createFormFieldInput.parseAsync(payload)

        await this.verifyFormOwnership(formId, userId)

        const labelKey = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
        const index = await this.getNextIndex(formId)

        const result = await db
            .insert(formFieldsTable)
            .values({ formId, label, labelKey, description, placeholder, isRequired, index, type, options, validations, conditions })
            .returning({ id: formFieldsTable.id })

        if (!result || result.length === 0 || !result[0]?.id)
            throw CustomError.internal("Something went wrong while creating a form field")

        return result[0]!
    }

}

export default FormFieldService
