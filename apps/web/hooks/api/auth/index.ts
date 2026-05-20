import { trpc } from "~/trpc/client"

export const useSignUp = () => {
    const {
        mutateAsync: createUserWithEmailAndPasswordAsync,
        mutate: createUserWithEmailAndPassword,
        error,
        failureCount,
        isError,
        isIdle,
        isSuccess,
        status,

    } = 
    trpc.auth.createUserWithEmailAndPassword.useMutation()

    return {
          error,
        failureCount,
        isError,
        isIdle,
        isSuccess,
        status,
        createUserWithEmailAndPasswordAsync,
        createUserWithEmailAndPassword
    }
}