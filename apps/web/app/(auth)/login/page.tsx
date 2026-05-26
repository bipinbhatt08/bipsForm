import { LoginForm } from "~/components/login-form"
import { LogoMark, BipsFormWordmark } from "~/components/brand"
import { ThemeToggle } from "~/components/theme-toggle"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4">
      {/* Subtle background grid — barely visible */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Top bar */}
      <div className="fixed top-0 inset-x-0 flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <LogoMark size={22} />
          <BipsFormWordmark size={13} />
        </Link>
        <ThemeToggle />
      </div>

      {/* Card */}
      <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-card/80 px-8 py-9 shadow-xl backdrop-blur-sm">
        {/* Card header */}
        <div className="mb-7 text-center">
          <p className="text-xl font-bold tracking-tight">Welcome back</p>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your account</p>
        </div>

        <LoginForm />
      </div>

      <p className="mt-6 text-xs text-muted-foreground/40">
        © {new Date().getFullYear()} BipsForm
      </p>
    </div>
  )
}
