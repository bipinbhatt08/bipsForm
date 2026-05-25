import { z } from 'zod'

export const submitFormInput = z.object({
    formId: z.string().uuid(),
    values: z.record(z.string(), z.unknown()),
})
export type SubmitFormInputType = z.infer<typeof submitFormInput>
