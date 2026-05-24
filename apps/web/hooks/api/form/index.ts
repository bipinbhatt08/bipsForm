import { trpc } from "~/trpc/client"

export const useGetForms = () => {
    const { data, error,
        failureCount,
        isError,
        isSuccess,
        status,
        isLoading
    } 
        = trpc.form.getMyForms.useQuery()
    return { 
        forms: data ?? [], error,
        failureCount,
        isError,
        isSuccess,
        status,
        isLoading
}
}

export const useCreateForm = () => {
    const utils = trpc.useUtils()
    const {
        mutateAsync: createFormAsync,
        mutate: createForm,
        error,
        failureCount,
        isError,
        isIdle,
        isSuccess,
        status,

    } = 
    trpc.form.createForm.useMutation({
        onSuccess: async()=> await utils.form.invalidate()
    })

    return {
        error,
        failureCount,
        isError,
        isIdle,
        isSuccess,
        status,
        createFormAsync,
        createForm
    }
}

export const useCreateFormField = () => {
    const utils = trpc.useUtils()
    const {
        mutateAsync: createFormFieldAsync,
        mutate: createFormField,
        error,
        failureCount,
        isError,
        isIdle,
        isPending,
        isSuccess,
        status,
    } = trpc.form.createFormField.useMutation({
        onSuccess: async () => await utils.form.invalidate(),
    })

    return {
        error,
        failureCount,
        isError,
        isIdle,
        isPending,
        isSuccess,
        status,
        createFormFieldAsync,
        createFormField,
    }
}

export const useGetFormFields = (formId: string) => {
    const { data, error, isLoading, isError, isSuccess } = trpc.form.getFormFields.useQuery({ formId })
    return {
        fields: data ?? [],
        error,
        isLoading,
        isError,
        isSuccess,
    }
}
