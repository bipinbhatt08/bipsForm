import { z} from 'zod'
 
//user Create
export const  createUserWithEmailAndPasswordInput = z.object({
    fullName: z.string().describe('Full name of the user'),
    email: z.email().describe('Email of the user'),
    password: z.string().describe("Password of the user")
})
//Schema-driven type system using Zod with type inference for end-to-end type safety
export type CreateUserWithEmailAndPasswordInputType =  z.infer <typeof createUserWithEmailAndPasswordInput>


//token generate
export const generateUserTokenPayload = z.object({
    id: z.uuid().describe('Uuid of user')
})
export type GenerateUserTokenPayloadType = z.infer <typeof generateUserTokenPayload>


// user sign IN
export const signInUserWithEmailAndPasswordInput = z.object({
    email: z.email().describe('Email of the user'),
    password: z.string().describe("Password of the user")
})
export type SignInUserWithEmailAndPasswordInputType = z.infer <typeof signInUserWithEmailAndPasswordInput>

// update full name
export const updateUserFullNameInput = z.object({
    fullName: z.string().min(1).max(80).describe('New full name of the user'),
})
export type UpdateUserFullNameInputType = z.infer<typeof updateUserFullNameInput>