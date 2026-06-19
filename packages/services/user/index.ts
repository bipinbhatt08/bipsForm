import { createHmac, randomBytes } from 'node:crypto'
import * as JWT from 'jsonwebtoken'
import {db, eq} from "@repo/database"
import {usersTable} from "@repo/database/models/user"
import { env } from '../env'
import { createUserWithEmailAndPasswordInput, CreateUserWithEmailAndPasswordInputType, generateUserTokenPayload, GenerateUserTokenPayloadType, signInUserWithEmailAndPasswordInput, SignInUserWithEmailAndPasswordInputType, updateUserFullNameInput, UpdateUserFullNameInputType } from './model'
import { CustomError } from '../utils/errors'
import { refreshTokensTable } from '@repo/database/schema'

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
        const accessToken = JWT.sign({id},env.JWT_SECRET,{expiresIn:'24h'})
        const refreshToken = JWT.sign({id},env.JWT_SECRET,{expiresIn:'7d'})
        //why do i returning object? i might need to return more thing: Using Open close design pattern
        return {
            accessToken,
            refreshToken
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

    private async storeRefreshToken(userId: string, refreshToken: string){
        const result = await db.insert(refreshTokensTable).values({
            userId,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }).returning({ id: refreshTokensTable.id })

        if (!result || result.length === 0) throw CustomError.internal("Something went wrong")
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

        const {refreshToken,accessToken} = await this.generateUserToken({id:userId })

        await this.storeRefreshToken(userId,refreshToken)

        return {
            id: userId,
            refreshToken,
            accessToken
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

        const userId = existingUserWithEmail.id
        
        const {accessToken,refreshToken} = await this.generateUserToken({id:userId})

        await this.storeRefreshToken(userId,refreshToken)

        
        return {
            id:existingUserWithEmail.id,
            accessToken,
            refreshToken
        }


    }

    public async deleteRefreshToken(token: string) {
        await db.delete(refreshTokensTable).where(eq(refreshTokensTable.token, token))
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

    public async verifyAndRotateRefreshToken(token: string){
        const result = await db.select().from(refreshTokensTable).where(eq(refreshTokensTable.token,token))
        
        if(!result || result.length === 0 || !result[0]) throw CustomError.unAuthorized("Invalid refresh token")
        
        const tokenRecord = result[0]
        const userId = tokenRecord.userId

        if (!tokenRecord?.expiresAt || tokenRecord.expiresAt < new Date()) {

            throw CustomError.unAuthorized("Refresh token expired")
        }

        await db.delete(refreshTokensTable).where(eq(refreshTokensTable.token,tokenRecord.token))

        const {accessToken,refreshToken} = await this.generateUserToken({id:userId})
        
        await this.storeRefreshToken(userId,refreshToken)

        return {
            id:tokenRecord.userId,
            accessToken,
            refreshToken
        }


    }

}

export default UserService