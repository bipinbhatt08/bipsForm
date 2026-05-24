import { db, desc, eq } from '@repo/database'
import { formFieldsTable } from '@repo/database/models/form-field'
import { CustomError } from '../utils/errors'
import { createFormFieldInput, CreateFormFieldInputType } from './model'
import FormService from '../form'

class FormFieldService {
    private formService = new FormService()

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

    public async createFormField(userId:string, payload: CreateFormFieldInputType) {
        const { label, description, placeholder, isRequired, type, options, validations, conditions,formId } =
            await createFormFieldInput.parseAsync(payload)

        await this.formService.verifyFormOwnership(formId, userId)

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

    public async getFormFields (formId:string){

        const formExist = await this.formService.checkFormExistance(formId)
        if(!formExist) throw CustomError.notFound("Form not found")

        const result = await db.select({
            id:formFieldsTable.id,
            label:formFieldsTable.label,
            description: formFieldsTable.description,
            placeholder: formFieldsTable.placeholder,
            isRequired: formFieldsTable.isRequired,
            type: formFieldsTable.type,
            options: formFieldsTable.options,
            validations: formFieldsTable.validations,
            conditions:formFieldsTable.conditions
        }).from(formFieldsTable).where(eq(formFieldsTable.formId, formId))

        return result
    }

}

export default FormFieldService
