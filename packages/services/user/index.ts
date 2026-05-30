import { createHmac, randomBytes } from 'node:crypto'
import * as JWT from 'jsonwebtoken'
import {db, eq, ne} from "@repo/database"
import {usersTable} from "@repo/database/models/user"
import { env } from '../env'
import { createUserWithEmailAndPasswordInput, CreateUserWithEmailAndPasswordInputType, generateUserTokenPayload, GenerateUserTokenPayloadType, signInUserWithEmailAndPasswordInput, SignInUserWithEmailAndPasswordInputType, updateUserFullNameInput, UpdateUserFullNameInputType } from './model'
import { CustomError } from '../utils/errors'

class UserService {

    private async generatehash(salt:string,data:string){
        return createHmac('sha256',salt).update(data).digest('hex')

    }
    private async getUserByEmail(email:string){
            const result = await db.select().from(usersTable).where(eq(usersTable.email, email))
            if(!result || result.length === 0) return null
            return result[0]
    }

    private async generateUserToken (payload:GenerateUserTokenPayloadType ) {
        const {id} = await generateUserTokenPayload.parseAsync(payload)
        const token = JWT.sign({id},env.JWT_SECRET)

        //why do i returning object? i might need to return more thing: Using Open close design pattern
        return {
            token
        }

    }
    private async verifyUserToken (token:string):Promise<GenerateUserTokenPayloadType>{
        try {
            const decoded = await JWT.verify(token,env.JWT_SECRET) as GenerateUserTokenPayloadType
            return decoded
        } catch (error) {
            throw CustomError.unAuthorized("Invalid user token")
        }
    }

    public async getUserInfoById(id:string){
        const user = await db.select({
            id: usersTable.id,
            email:usersTable.email,
            fullName:usersTable.fullName,
            profileImageUrl: usersTable.profileImageUrl
        }).from(usersTable).where(eq(usersTable.id, id))

        if(!user || user.length === 0)  throw CustomError.notFound("User not found")
    
        return user[0]!

    }

    public async createUserWithEmailAndPassword(payload:CreateUserWithEmailAndPasswordInputType){

       const{fullName, email, password} = await createUserWithEmailAndPasswordInput.parseAsync(payload)
       
       //check if user exists in DB
       const existingUserWithEmail = await this.getUserByEmail(email)
       if(existingUserWithEmail) throw CustomError.conflict("User with the email already exists")

        // caculate hash and create a hash
        const salt = randomBytes(16).toString('hex')
        const hash = await this.generatehash(salt,password)
        const insertUserResult = await db.insert(usersTable).values({email,password:hash,fullName,salt}).returning({id:usersTable.id})

        if(!insertUserResult || insertUserResult.length === 0 || !insertUserResult[0]?.id ) throw CustomError.internal("Something went wrong while creating a user")
          

        const userId = insertUserResult[0].id

        const {token} = await this.generateUserToken({id:userId })

        return {
            id: userId,
            token
        }

       
    }

    public async signInUserWithEmailAndPassword(payload:SignInUserWithEmailAndPasswordInputType){
        const {email,password} = await signInUserWithEmailAndPasswordInput.parseAsync(payload)


         //check if user exists in DB
        const existingUserWithEmail = await this.getUserByEmail(email)
        if(!existingUserWithEmail) throw  CustomError.unAuthorized("Invalid credentials")
    
        if(!existingUserWithEmail.password || !existingUserWithEmail.salt){
            throw CustomError.unAuthorized("Invalid authentication method")
        }
        
        const hash = await this.generatehash(existingUserWithEmail.salt, password)

        if(hash !== existingUserWithEmail.password){
            throw CustomError.unAuthorized("Invalid credentials")
        }

        const {token} = await this.generateUserToken({id:existingUserWithEmail.id })


        return {
            id:existingUserWithEmail.id,
            token
        }


    }

    public async updateUserFullName(id: string, payload: UpdateUserFullNameInputType) {
        const { fullName } = await updateUserFullNameInput.parseAsync(payload)
        const result = await db.update(usersTable).set({ fullName }).where(eq(usersTable.id, id)).returning({ id: usersTable.id, fullName: usersTable.fullName })
        if (!result || result.length === 0) throw CustomError.notFound("User not found")
        return result[0]!
    }

    public async verifyAndDecodeUserToken(token:string){
        const decoded = await this.verifyUserToken(token)
        const {id} = await generateUserTokenPayload.parseAsync(decoded)
        return {
            id:id
        }
    }

}

export default UserService