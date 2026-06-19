import { initTRPC, TRPCError } from "@trpc/server";
import { OpenApiMeta } from "trpc-to-openapi";

import { createContext } from "./context";
import { getAuthenticationCookie, getRefreshTokenCookie, setAuthenticationCookie, setRefreshTokenCookie } from "./utils/cookie";
import { CustomError } from "@repo/services/utils/errors";
import { userService } from "./services";

export const tRPCContext = initTRPC
  .meta<OpenApiMeta>()
  .context<typeof createContext>()
  .create({});


export const router = tRPCContext.router;

export const publicProcedure = tRPCContext.procedure;

export const authenticatedProcedure = tRPCContext.procedure.use(async(options)=>{
  const {ctx } = options
  const userToken = getAuthenticationCookie(ctx)

  try {
    const {id}= await userService.verifyAndDecodeUserToken(userToken)
    return options.next({
      ctx:{
        ...ctx,
        user:{id}
  
      }
    })
  } catch (error) {
    if (!(error instanceof TRPCError && error.code === "UNAUTHORIZED")) throw error
  }

  const token = getRefreshTokenCookie(ctx)// refresh token
  if(!token) throw CustomError.unAuthorized("No refresh token")
  
  const {refreshToken,id,accessToken} = await userService.verifyAndRotateRefreshToken(token)

  setRefreshTokenCookie(ctx,refreshToken)
  setAuthenticationCookie(ctx,accessToken)

  return options.next({
    ctx:{
      ...ctx,
      user:{id}
    }
  })


})