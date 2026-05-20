import { trpc } from "~/trpc/client"

export const useSignUp = () => {
    const utils = trpc.useUtils()

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
    trpc.auth.createUserWithEmailAndPassword.useMutation({
        onSuccess:async()=>{
            await utils.auth.invalidate()
            // cache invalidation
        }
    })

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


export const useLogin = () => {
    const utils = trpc.useUtils()
    const {
        mutateAsync: signInUserWithEmailAndPasswordAsync,
        mutate: signInUserWithEmailAndPassword,
        error,
        failureCount,
        isError,
        isIdle,
        isSuccess,
        status,

    } = 
    trpc.auth.signInUserWithEmailAndPassword.useMutation({
         onSuccess:async()=>{
            await utils.auth.invalidate()
        }
    })

    return {
          error,
        failureCount,
        isError,
        isIdle,
        isSuccess,
        status,
        signInUserWithEmailAndPasswordAsync,
        signInUserWithEmailAndPassword
    }
}

export const useUser = () =>{
    const {data:user, error, isFetched, isFetching,isLoading, status} = trpc.auth.getLoggedInUserInfo.useQuery()
    return{user, error, isFetched, isFetching,isLoading, status} 
}