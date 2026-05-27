import { z} from 'zod'

export const createUserWithEmailAndPasswordInputModel = z.object({
    fullName : z.string().describe("Name of the user"),
    password : z.string().describe("Password of the user"),
    email : z.email().describe("Email of the user")
})

export const createUserWithEmailAndPasswordOutputModel = z.object({
    id : z.string().describe("Id of the user")
})

export const signInUserWithEmailAndPasswordInputModel = z.object({
    email: z.email().describe("Email of the user"),
    password: z.string().describe("Password of the user")
})

export const signInUserWithEmailAndPasswordOutputModel = z.object({
    id: z.string().describe("Id of user"),
})

export const getLoggedInUserInfoInputModel = z.undefined()
export const getLoggedInUserInfoOutputModel = z.object({
    id : z.string().describe("Id of the user"),
    fullName: z.string().describe("Name of the user"),
    profileImageUrl: z.string().describe("Profile picture url of the user").optional().nullable(),
    email : z.email().describe("Email of the user")
})

export const logoutInputModel = z.object({})
export const logoutOutputModel = z.object({ success: z.boolean() })

