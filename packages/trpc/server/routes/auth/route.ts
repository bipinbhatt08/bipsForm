import { CustomError } from "@repo/services/utils/errors";
import { userService } from "../../services";
import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import { clearAuthenticationCookie, clearRefreshTokenCookie, getAuthenticationCookie, getRefreshTokenCookie, setAuthenticationCookie, setRefreshTokenCookie } from "../../utils/cookie";
import { generatePath } from "../../utils/path-generator";

import {  createUserWithEmailAndPasswordInputModel, createUserWithEmailAndPasswordOutputModel, getLoggedInUserInfoInputModel, getLoggedInUserInfoOutputModel, logoutInputModel, logoutOutputModel, signInUserWithEmailAndPasswordInputModel, signInUserWithEmailAndPasswordOutputModel, updateUserFullNameInputModel, updateUserFullNameOutputModel } from "./model";

const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");

export const authRouer = router({

    createUserWithEmailAndPassword: publicProcedure
    .meta({
     openapi:{
      method:"POST",
      path:getPath("/createUserWithEmailAndPassword"),
      tags:TAGS
     }
    })
    .input(createUserWithEmailAndPasswordInputModel)
    .output(createUserWithEmailAndPasswordOutputModel)
    .mutation(async({input,ctx})=>{
      const {email,password,fullName} = input
      const {id,accessToken, refreshToken} = await userService.createUserWithEmailAndPassword({email,password,fullName})
     
      setAuthenticationCookie(ctx,accessToken)
      setRefreshTokenCookie(ctx, refreshToken)

      return {
        id
      }
      
    }),

    signInUserWithEmailAndPassword: publicProcedure
    .meta({
     openapi:{
      method:"POST",
      path:getPath("/signInUserWithEmailAndPassword"),
      tags:TAGS
     }
    })
    .input(signInUserWithEmailAndPasswordInputModel)
    .output(signInUserWithEmailAndPasswordOutputModel)
    .mutation(async({input,ctx})=>{

        const {email,password} = input
        const {id, accessToken, refreshToken} = await userService.signInUserWithEmailAndPassword({email,password})

        setAuthenticationCookie(ctx,accessToken)
        setRefreshTokenCookie(ctx,refreshToken)

        return {
          id
        }

    }),
    
    logout: authenticatedProcedure
    .meta({
     openapi:{
      method:"POST",
      path:getPath("/logout"),
      tags:TAGS
     }
    })
    .input(logoutInputModel)
    .output(logoutOutputModel)
    .mutation(async({ctx})=>{
      const refreshToken = getRefreshTokenCookie(ctx)
      clearAuthenticationCookie(ctx)
      clearRefreshTokenCookie(ctx)
      if(refreshToken) await userService.deleteRefreshToken(refreshToken)

      return { success: true }
    }),

    updateUserFullName: authenticatedProcedure
    .meta({
     openapi:{
      method:"PATCH",
      path:getPath("/updateUserFullName"),
      tags:TAGS
     }
    })
    .input(updateUserFullNameInputModel)
    .output(updateUserFullNameOutputModel)
    .mutation(async({input,ctx})=>{
        return await userService.updateUserFullName(ctx.user.id, input)
    }),

    getLoggedInUserInfo: authenticatedProcedure
    .meta({
     openapi:{
      method:"GET",
      path:getPath("/getLoggedInUserInfo"),
      tags:TAGS
     }
    })
    .input(getLoggedInUserInfoInputModel)
    .output(getLoggedInUserInfoOutputModel)
    .query(async({ctx})=>{
      
        const {id,fullName,email,profileImageUrl} = await userService.getUserInfoById(ctx.user.id)

        return { 
          id,
          fullName,
          email,
          profileImageUrl
        }
    })
})  