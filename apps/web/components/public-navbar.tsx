'use client'

import Link from "next/link"
import { IconArrowRight, IconLayoutDashboard } from "@tabler/icons-react"
import { Button } from "~/components/ui/button"
import { LogoMark, BipsFormWordmark } from "~/components/brand"
import { ThemeToggle } from "~/components/theme-toggle"

type ActivePage = "home" | "explore" | "pricing"

interface PublicNavbarProps {
  isLoggedIn?: boolean
  activePage?: ActivePage
}

export function PublicNavbar({ isLoggedIn = false, activePage }: PublicNavbarProps) {
  const active = "text-foreground font-medium"
  const inactive = "hover:text-foreground transition-colors duration-150"

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark size={28} />
          <BipsFormWordmark size={15} />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          {activePage === "home" ? (
            <>
              <a href="#features" className={inactive}>Features</a>
              <a href="#how-it-works" className={inactive}>How it works</a>
            </>
          ) : (
            <>
              <Link href="/#features" className={inactive}>Features</Link>
              <Link href="/#how-it-works" className={inactive}>How it works</Link>
            </>
          )}
          <Link href="/explore" className={activePage === "explore" ? active : inactive}>Explore</Link>
          <Link href="/pricing" className={activePage === "pricing" ? active : inactive}>Pricing</Link>
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          {isLoggedIn ? (
            <Button asChild size="sm" className="gap-1.5 font-medium shadow-lg shadow-primary/20">
              <Link href="/dashboard">
                <IconLayoutDashboard className="size-3.5" />
                Dashboard
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex text-muted-foreground hover:text-foreground">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm" className="gap-1.5 font-medium shadow-lg shadow-primary/25 bg-primary hover:bg-primary/90">
                <Link href="/signup">
                  Get started
                  <IconArrowRight className="size-3.5" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
