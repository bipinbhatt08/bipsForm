import { router } from "./trpc";
import { authRouer } from "./routes/auth/route";

export const serverRouter = router({
  auth: authRouer
})
export { createContext } from "./context";
export type ServerRouter = typeof serverRouter;
