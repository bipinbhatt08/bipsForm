import { router } from "./trpc";
import { authRouer } from "./routes/auth/route";
import { formRouter } from "./routes/form/route";

export const serverRouter = router({
  auth: authRouer,
  form:formRouter
})
export { createContext } from "./context";
export type ServerRouter = typeof serverRouter;
