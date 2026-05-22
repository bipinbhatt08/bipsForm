import {CreateExpressContextOptions} from '@trpc/server/adapters/express'
import {getCookieFactory,clearCookieFacotory,createCookieFactory } from './utils/cookie'

export interface TRPCCtxUser{
    id:string
}
export  interface TRPCContext{
    createCookie: ReturnType <typeof createCookieFactory>,
    getCookie: ReturnType <typeof getCookieFactory>,
    clearCookie: ReturnType <typeof clearCookieFacotory>,
    user?: TRPCCtxUser
}

export async function createContext({req,res}:CreateExpressContextOptions):Promise <TRPCContext> {
    const ctx:TRPCContext = {
        createCookie:createCookieFactory(res),
        getCookie: getCookieFactory(req),
        clearCookie: clearCookieFacotory(res),
        user: undefined
    }
   return ctx
}
export type Context = Awaited<ReturnType<typeof createContext>>;
