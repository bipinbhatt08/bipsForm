'use client'

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { useLogin } from "~/hooks/api/auth"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { IconLoader2 } from "@tabler/icons-react"

type LoginFormValues = {
  email: string
  password: string
}

export function LoginForm() {
  const router = useRouter()

  const { handleSubmit, register, setError, formState: { errors } } = useForm<LoginFormValues>({
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  })

  const { signInUserWithEmailAndPasswordAsync, status } = useLogin()

  const submit = async (values: LoginFormValues) => {
    try {
      await signInUserWithEmailAndPasswordAsync(values)
      router.replace('/dashboard')
    } catch (err: any) {
      setError("root", { type: "server", message: err?.message || "Invalid email or password" })
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            className="h-10"
            {...register("email", { required: "Email is required" })}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className="h-10"
            {...register("password", { required: "Password is required" })}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        {errors.root && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5">
            <p className="text-xs text-destructive text-center">{errors.root.message}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={status === "pending"}
          className="h-10 font-semibold mt-1 shadow-lg shadow-primary/20"
        >
          {status === "pending" ? (
            <><IconLoader2 className="size-4 animate-spin" />Signing in…</>
          ) : "Sign in"}
        </Button>

        <div className="relative my-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/60" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-3 text-xs text-muted-foreground">or continue with</span>
          </div>
        </div>

        <Button type="button" variant="outline" className="h-10 gap-2 border-border/60">
          <svg className="size-4" viewBox="0 0 24 24">
            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor" />
          </svg>
          Continue with Google
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-primary font-medium hover:underline">
          Sign up free
        </Link>
      </p>
    </div>
  )
}
