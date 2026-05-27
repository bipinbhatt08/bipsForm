import { trpc } from "~/trpc/client"

export const useSubmitForm = () => {
    const {
        mutateAsync: submitFormAsync,
        mutate: submitForm,
        error,
        isPending,
        isError,
        isSuccess,
    } = trpc.submission.submitForm.useMutation()

    return {
        submitFormAsync,
        submitForm,
        error,
        isPending,
        isError,
        isSuccess,
    }
}

export const useGetFormAnalytics = (formId: string) => {
    const { data, error, isLoading, isError, isSuccess } =
        trpc.submission.getFormAnalytics.useQuery(
            { formId },
            { enabled: !!formId }
        )
    return {
        analytics: data ?? null,
        error,
        isLoading,
        isError,
        isSuccess,
    }
}

export const useGetFormSubmissions = (formId: string) => {
    const { data, error, isLoading, isError, isSuccess, refetch } =
        trpc.submission.getFormSubmissions.useQuery(
            { formId },
            { enabled: !!formId }
        )
    return {
        submissions: data ?? [],
        error,
        isLoading,
        isError,
        isSuccess,
        refetch,
    }
}

