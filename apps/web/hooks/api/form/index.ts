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
    const { data, error, isLoading, isError, isSuccess } = trpc.form.getFormFields.useQuery(
        { formId },
        { enabled: !!formId }
    )
    return {
        fields: data ?? [],
        error,
        isLoading,
        isError,
        isSuccess,
    }
}

export const useGetPublicForms = () => {
    const { data, error, isLoading, isError, isSuccess } = trpc.form.getPublicForms.useQuery()
    return {
        forms: data ?? [],
        error,
        isLoading,
        isError,
        isSuccess,
    }
}

export const useDeleteForm = () => {
    const utils = trpc.useUtils()
    const { mutateAsync: deleteFormAsync, isPending } = trpc.form.deleteForm.useMutation({
        onSuccess: async () => await utils.form.invalidate(),
    })
    return { deleteFormAsync, isPending }
}

export const useUpdateFormField = () => {
    const utils = trpc.useUtils()
    const { mutateAsync: updateFormFieldAsync, isPending } = trpc.form.updateFormField.useMutation({
        onSuccess: async () => await utils.form.invalidate(),
    })
    return { updateFormFieldAsync, isPending }
}

export const useDeleteFormField = () => {
    const utils = trpc.useUtils()
    const { mutateAsync: deleteFormFieldAsync, isPending } = trpc.form.deleteFormField.useMutation({
        onSuccess: async () => await utils.form.invalidate(),
    })
    return { deleteFormFieldAsync, isPending }
}

export const useReorderFields = () => {
    const utils = trpc.useUtils()
    const { mutateAsync: reorderFieldsAsync, isPending } = trpc.form.reorderFields.useMutation({
        onSuccess: async () => await utils.form.invalidate(),
    })
    return { reorderFieldsAsync, isPending }
}

export const useUpdateForm = () => {
    const utils = trpc.useUtils()
    const {
        mutateAsync: updateFormAsync,
        isPending,
        isError,
    } = trpc.form.updateForm.useMutation({
        onSuccess: async () => await utils.form.invalidate(),
    })
    return { updateFormAsync, isPending, isError }
}

export const useGetFormBySlug = (slug: string) => {
    const { data, error, isLoading, isError, isSuccess } = trpc.form.getFormBySlug.useQuery(
        { slug },
        { enabled: !!slug }
    )
    return {
        form: data ?? null,
        error,
        isLoading,
        isError,
        isSuccess,
    }
}

