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

export const useGetDashboardStats = () => {
    const { data, error, isLoading, isError, isSuccess } =
        trpc.submission.getDashboardStats.useQuery(undefined)
    return {
        stats: data ?? null,
        error,
        isLoading,
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

export const useGetFormSubmissions = (
    formId: string,
    params: { page?: number; pageSize?: number; sortDir?: "asc" | "desc" } = {}
) => {
    const { page = 1, pageSize = 25, sortDir = "desc" } = params
    const { data, error, isLoading, isError, isSuccess, refetch } =
        trpc.submission.getFormSubmissions.useQuery(
            { formId, page, pageSize, sortDir },
            { enabled: !!formId }
        )
    return {
        submissions: data?.submissions ?? [],
        total: data?.total ?? 0,
        totalPages: data?.totalPages ?? 0,
        page: data?.page ?? page,
        pageSize: data?.pageSize ?? pageSize,
        error,
        isLoading,
        isError,
        isSuccess,
        refetch,
    }
}

