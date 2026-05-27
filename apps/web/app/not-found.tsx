import Link from "next/link"
import { IconArrowLeft, IconForms } from "@tabler/icons-react"
import { Button } from "~/components/ui/button"
import { LogoMark } from "~/components/brand"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased flex flex-col">
      {/* Minimal nav */}
      <header className="flex items-center gap-2.5 px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark size={26} />
          <span className="text-[15px] font-semibold tracking-tight">BipsForm</span>
        </Link>
      </header>

      {/* Dot grid bg */}
      <div
        className="pointer-events-none fixed inset-0 -z-20"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(6,182,212,0.08) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-transparent via-transparent to-background" />

      {/* Content */}
      <main className="flex flex-1 flex-col items-center justify-center px-5 text-center pb-20">
        {/* Glow orb */}
        <div
          className="pointer-events-none absolute -z-10 rounded-full opacity-20 blur-[120px]"
          style={{ width: 500, height: 300, background: "radial-gradient(ellipse, #06B6D4 0%, #0891B2 40%, transparent 70%)" }}
        />

        <div className="mb-8 flex size-20 items-center justify-center rounded-2xl border border-border/50 bg-card/60 shadow-xl">
          <IconForms className="size-9 text-primary" />
        </div>

        <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">404</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">Page not found</h1>
        <p className="text-muted-foreground text-lg max-w-md leading-relaxed mb-10">
          This page doesn&apos;t exist or may have been moved. Let&apos;s get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button asChild size="lg" className="gap-2 font-semibold px-8 h-11 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
            <Link href="/">
              <IconArrowLeft className="size-4" />
              Back to home
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="px-8 h-11 border-border/60 hover:border-primary/40">
            <Link href="/explore">Browse public forms</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
