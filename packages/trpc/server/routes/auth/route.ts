import { CustomError } from "@repo/services/utils/errors";
import { userService } from "../../services";
import { publicProcedure, router } from "../../trpc";
import { getAuthenticationCookie, setAuthenticationCookie } from "../../utils/cookie";
import { generatePath } from "../../utils/path-generator";

import {  createUserWithEmailAndPasswordInputModel, createUserWithEmailAndPasswordOutputModel, getLoggedInUserInfoInputModel, getLoggedInUserInfoOutputModel, signInUserWithEmailAndPasswordInputModel, signInUserWithEmailAndPasswordOutputModel } from "./model";

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
      const {id,token} = await userService.createUserWithEmailAndPassword({email,password,fullName})
     
      setAuthenticationCookie(ctx,token)

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
        const {id, token} = await userService.signInUserWithEmailAndPassword({email,password})

        setAuthenticationCookie(ctx,token)

        return {
          id
        }

    }),
    
    getLoggedInUserInfo: publicProcedure
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
      const userToken = getAuthenticationCookie(ctx)
      if(!userToken) throw CustomError.unAuthorized("User is not logged in ")
        const {id,fullName,email,profileImageUrl} = await userService.verifyAndDecodeUserToken(userToken)
        return { id, fullName, email, profileImageUrl }
    })
})  