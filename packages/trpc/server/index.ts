import { router } from "./trpc";
import { authRouer } from "./routes/auth/route";
import { formRouter } from "./routes/form/route";
import { submissionRouter } from "./routes/submission/route";

export const serverRouter = router({
  auth: authRouer,
  form: formRouter,
  submission: submissionRouter,
})
export { createContext } from "./context";
export type ServerRouter = typeof serverRouter;
