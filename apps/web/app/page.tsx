'use client'

import * as React from "react"
import Link from "next/link"
import {
  IconArrowRight,
  IconBolt,
  IconChartBar,
  IconCheck,
  IconForms,
  IconLayoutDashboard,
  IconPalette,
  IconShare,
  IconShieldCheck,
  IconSparkles,
  IconX,
} from "@tabler/icons-react"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { useUser } from "~/hooks/api/auth"
import { LogoMark, BipsFormWordmark } from "~/components/brand"
import { ThemeToggle } from "~/components/theme-toggle"

// ─── Navbar ────────────────────────────────────────────────────────────────────

function Navbar({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark size={28} />
          <BipsFormWordmark size={15} />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors duration-150">Features</a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors duration-150">How it works</a>
          <Link href="/pricing" className="hover:text-foreground transition-colors duration-150">Pricing</Link>
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

// ─── Hero ───────────────────────────────────────────────────────────────────────

function Hero({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-20">
      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(6,182,212,0.12) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      {/* Radial fade over dot grid */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-transparent to-background" />
      {/* Cyan glow orb */}
      <div
        className="pointer-events-none absolute -z-10 left-1/2 top-[-80px] -translate-x-1/2 rounded-full opacity-30 blur-[100px]"
        style={{ width: 700, height: 500, background: "radial-gradient(ellipse, #06B6D4 0%, #0891B2 40%, transparent 70%)" }}
      />

      <div className="mx-auto max-w-5xl px-5 sm:px-8 text-center">
        {/* Announcement pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-8">
          <IconSparkles className="size-3.5" />
          <span className="font-medium">Always on form — build, share &amp; collect at scale</span>
        </div>

        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl leading-[1.08]">
          Forms your users{" "}
          <br className="hidden sm:block" />
          <span
            className="inline-block"
            style={{
              background: "linear-gradient(135deg, #06B6D4 0%, #0891B2 50%, #8B5CF6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            actually want to fill
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          BipsForm lets you build stunning, themed forms in minutes. Share a link, watch responses roll in — all with zero infrastructure headache.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          {isLoggedIn ? (
            <Button asChild size="lg" className="gap-2 font-semibold px-8 h-12 shadow-xl shadow-primary/25 text-base">
              <Link href="/dashboard">
                <IconLayoutDashboard className="size-5" />
                Go to Dashboard
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild size="lg" className="gap-2 font-semibold px-8 h-12 shadow-xl shadow-primary/30 text-base bg-primary hover:bg-primary/90">
                <Link href="/signup">
                  Start for free
                  <IconArrowRight className="size-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="px-8 h-12 text-base border-border/60 hover:border-primary/50 hover:bg-primary/5">
                <Link href="/login">Log in to your account</Link>
              </Button>
            </>
          )}
        </div>

        <p className="mt-4 text-xs text-muted-foreground/60 tracking-wide">
          Free forever · No credit card required · Open source
        </p>

        {/* Stats strip */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-px rounded-2xl border border-border/40 overflow-hidden bg-border/40 max-w-2xl mx-auto">
          {[
            { value: "—",  label: "Forms created",      live: true  },
            { value: "—",  label: "Responses collected", live: true  },
            { value: "9",  label: "Field types",         live: false },
            { value: "5",  label: "Themes",              live: false },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center justify-center gap-1 bg-background py-5 px-4 text-center">
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-bold tabular-nums">{stat.value}</span>
                {stat.live && (
                  <span className="mt-0.5 size-1.5 rounded-full bg-primary/50 animate-pulse" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Product preview */}
      <div className="mx-auto mt-20 max-w-3xl px-5 sm:px-8">
        <div
          className="rounded-2xl border border-border/50 bg-card shadow-2xl overflow-hidden"
          style={{ boxShadow: "0 0 0 1px rgba(6,182,212,0.08), 0 32px 64px rgba(0,0,0,0.5), 0 0 80px rgba(6,182,212,0.06)" }}
        >
          {/* Window chrome */}
          <div className="flex items-center gap-2 border-b border-border/50 bg-muted/40 px-4 py-3">
            <div className="flex gap-1.5">
              <div className="size-3 rounded-full bg-destructive/60" />
              <div className="size-3 rounded-full bg-yellow-500/60" />
              <div className="size-3 rounded-full bg-green-500/60" />
            </div>
            <div className="flex-1 mx-3">
              <div className="h-5 rounded-md bg-muted/60 border border-border/40 flex items-center px-3 gap-2">
                <div className="size-2.5 rounded-full bg-green-500/50" />
                <div className="h-2 w-40 rounded-full bg-muted-foreground/20" />
              </div>
            </div>
          </div>
          {/* Form content mock */}
          <div className="grid grid-cols-[220px_1fr] divide-x divide-border/40 min-h-[380px]">
            {/* Left sidebar — form fields list */}
            <div className="bg-muted/20 p-4 flex flex-col gap-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 px-1 mb-1">Fields</p>
              {[
                { label: "Full Name", type: "Short text", color: "bg-blue-500/20 text-blue-400" },
                { label: "Email address", type: "Email", color: "bg-rose-500/20 text-rose-400" },
                { label: "How did you hear?", type: "Single select", color: "bg-indigo-500/20 text-indigo-400" },
                { label: "Overall rating", type: "Rating", color: "bg-orange-500/20 text-orange-400" },
                { label: "Your message", type: "Long text", color: "bg-violet-500/20 text-violet-400" },
              ].map((f, i) => (
                <div
                  key={f.label}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 ${i === 2 ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/40"}`}
                >
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted/80 text-[10px] font-bold text-muted-foreground">
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium truncate">{f.label}</p>
                    <p className={`text-[9px] font-medium rounded px-1 w-fit mt-0.5 ${f.color}`}>{f.type}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Right canvas — active field editor */}
            <div className="p-6 flex flex-col gap-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-3">Preview</p>
                <div className="rounded-xl border border-border/50 bg-muted/20 p-5 space-y-4">
                  <div>
                    <div className="flex items-baseline gap-1 mb-1.5">
                      <p className="text-sm font-medium">How did you hear about us?</p>
                      <span className="text-xs text-destructive">*</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {["Twitter / X", "Google Search", "A friend", "Product Hunt"].map((opt, i) => (
                        <div key={opt} className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-xs transition-colors ${i === 1 ? "border-primary bg-primary/10 text-primary" : "border-border/50 text-muted-foreground"}`}>
                          <div className={`size-3 rounded-full border flex items-center justify-center ${i === 1 ? "border-primary bg-primary" : "border-muted-foreground/40"}`}>
                            {i === 1 && <div className="size-1.5 rounded-full bg-white" />}
                          </div>
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-auto">
                <div className="size-2 rounded-full bg-primary animate-pulse" />
                <p className="text-[11px] text-muted-foreground">Conditional logic active on this field</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Trusted By ─────────────────────────────────────────────────────────────────

const COMPANIES = [
  { name: "Stacklane",  initials: "SL" },
  { name: "Orbitly",   initials: "OR" },
  { name: "Craftbase", initials: "CB" },
  { name: "Nuvora",    initials: "NV" },
  { name: "Patchwork", initials: "PW" },
  { name: "Meridex",   initials: "MX" },
  { name: "Veltura",   initials: "VT" },
  { name: "Loopkit",   initials: "LK" },
  { name: "Syndra",    initials: "SY" },
  { name: "Quorex",    initials: "QX" },
]

function CompanyPill({ name, initials }: { name: string; initials: string }) {
  return (
    <div className="flex shrink-0 items-center gap-2.5 rounded-xl border border-border/50 bg-background px-4 py-2.5 mx-2">
      <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-bold text-muted-foreground/60 tracking-wide">
        {initials}
      </div>
      <span className="text-sm font-medium text-muted-foreground/60 tracking-tight">{name}</span>
    </div>
  )
}

function TrustedBy() {
  return (
    <section className="border-y border-border/30 py-10 overflow-hidden">
      <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground/40 mb-7">
        Trusted by growing teams
      </p>
      {/* Fade edges */}
      <div
        className="relative"
        style={{
          maskImage: "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
        }}
      >
        <div className="flex animate-marquee" style={{ width: "max-content" }}>
          {[...COMPANIES, ...COMPANIES].map((c, i) => (
            <CompanyPill key={i} name={c.name} initials={c.initials} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Features ──────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: IconForms,
    title: "Powerful form builder",
    description: "9 field types — short text, email, phone, number, date, rating, single & multi select. Add validations, placeholder text, and helper descriptions.",
    color: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-400",
  },
  {
    icon: IconPalette,
    title: "5 stunning themes",
    description: "Minimal, Retro, Neon, Anime, or Nature. Every theme ships with a custom color palette, typography, and card styles that match your brand.",
    color: "from-violet-500/20 to-pink-500/20",
    iconColor: "text-violet-400",
  },
  {
    icon: IconBolt,
    title: "Conditional logic",
    description: "Show or hide fields based on previous answers with equals, contains, is_filled, and more operators. Build intelligent, adaptive forms.",
    color: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-400",
  },
  {
    icon: IconChartBar,
    title: "Response dashboard",
    description: "Every submission is stored securely and displayed in a clean table view. See who responded, when, and exactly what they said.",
    color: "from-cyan-500/20 to-teal-500/20",
    iconColor: "text-cyan-400",
  },
  {
    icon: IconShare,
    title: "Instant public link",
    description: "Each form gets a unique, shareable URL. Copy and paste it anywhere — emails, Slack, social media, or your own website.",
    color: "from-green-500/20 to-emerald-500/20",
    iconColor: "text-green-400",
  },
  {
    icon: IconShieldCheck,
    title: "Access & expiry controls",
    description: "Password protect forms, set response limits, lock them, or add an expiry date. You stay in full control of who can respond and when.",
    color: "from-rose-500/20 to-red-500/20",
    iconColor: "text-rose-400",
  },
]

function Features() {
  return (
    <section id="features" className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="text-center mb-16">
          <Badge className="mb-5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase">
            Features
          </Badge>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl max-w-2xl mx-auto leading-tight">
            Everything your forms will ever need
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-lg leading-relaxed">
            BipsForm ships with every tool a modern form builder should have — and nothing that bloats it.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className="group relative rounded-2xl border border-border/50 bg-card/60 p-6 overflow-hidden hover:border-border transition-all duration-300 hover:shadow-lg"
                style={{ transition: "border-color 200ms, box-shadow 200ms, transform 200ms" }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative">
                  <div className={`mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-muted/60 ${f.iconColor} group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="size-5" />
                  </div>
                  <h3 className="font-semibold text-base mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── How it works ───────────────────────────────────────────────────────────────

const STEPS = [
  {
    number: "01",
    title: "Create your form",
    description: "Pick a theme, drop in your fields, set validations and conditional logic. Your first form takes under 2 minutes to build.",
    detail: "Form builder · 9 field types · 5 themes",
  },
  {
    number: "02",
    title: "Share the link",
    description: "Every form gets a public URL at bipsform.app/forms/your-slug. Copy it and drop it anywhere you need responses.",
    detail: "Instant publish · Custom slugs",
  },
  {
    number: "03",
    title: "Collect responses",
    description: "Submissions land in your dashboard in real time. View every answer in a clean table — no exports, no setup needed.",
    detail: "Real-time · Sortable table · Secure storage",
  },
]

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 sm:py-20 border-t border-border/30">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="text-center mb-16">
          <Badge className="mb-5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase">
            How it works
          </Badge>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            From idea to live form in minutes
          </h2>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((step, i) => (
            <div key={step.number} className="relative flex flex-col gap-5 rounded-2xl border border-border/40 bg-card/40 p-8 overflow-hidden group hover:border-primary/30 hover:bg-card/70 transition-all duration-300">
              {/* Step number watermark */}
              <div
                className="absolute -right-3 -top-4 text-8xl font-black select-none pointer-events-none"
                style={{ color: "rgba(6,182,212,0.05)", fontVariantNumeric: "tabular-nums" }}
              >
                {step.number}
              </div>
              {/* Connector line */}
              {i < 2 && (
                <div className="hidden md:block absolute top-12 -right-3 w-6 h-px bg-gradient-to-r from-border to-transparent z-10" />
              )}
              <div
                className="inline-flex size-12 items-center justify-center rounded-xl font-bold text-base"
                style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(8,145,178,0.1))", color: "#06B6D4", border: "1px solid rgba(6,182,212,0.2)" }}
              >
                {step.number}
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
              <p className="text-xs text-primary/70 font-medium mt-auto pt-2 border-t border-border/40">{step.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Testimonials ───────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    quote: "BipsForm replaced three different tools for us. The conditional logic alone saved us hours of post-processing. Our survey completion rate went up 40% just from the themed UI.",
    name: "Sarah Chen",
    role: "Head of Product",
    company: "Veltrix",
    initials: "SC",
    color: "from-cyan-500 to-blue-500",
  },
  {
    quote: "I built our entire onboarding flow in BipsForm in one afternoon. The form builder is genuinely the most intuitive I've used. The response dashboard is clean and actually useful.",
    name: "Marcus Rivera",
    role: "Founder",
    company: "Launchpad HQ",
    initials: "MR",
    color: "from-violet-500 to-purple-500",
  },
  {
    quote: "We collect thousands of feedback submissions a month. BipsForm handles it all without breaking a sweat. The expiry controls and response limits are a huge deal for timed campaigns.",
    name: "Priya Nair",
    role: "Growth Lead",
    company: "Stacknest",
    initials: "PN",
    color: "from-rose-500 to-pink-500",
  },
]

function Testimonials() {
  return (
    <section className="py-16 sm:py-20 border-t border-border/30 bg-slate-50 dark:bg-muted/20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="text-center mb-14">
          <Badge className="mb-5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase">
            Testimonials
          </Badge>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Loved by builders</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="flex flex-col gap-5 rounded-2xl border border-border/40 bg-card/60 p-7 hover:border-border/70 transition-all duration-200"
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="size-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-border/30">
                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${t.color} text-white text-xs font-bold`}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role} · {t.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Pricing ────────────────────────────────────────────────────────────────────

const PLANS = [
  {
    name: "Starter",
    price: "$0",
    period: "/month",
    description: "Perfect for personal projects and small teams just getting started.",
    cta: "Start for free",
    ctaHref: "/signup",
    popular: false,
    features: [
      "Up to 5 forms",
      "500 responses / month",
      "3 themes",
      "Basic field types",
      "Public form links",
      "7-day response history",
    ],
    excluded: [
      "Conditional logic",
      "Custom domain",
      "Priority support",
    ],
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For professionals who need unlimited forms, full themes, and deep analytics.",
    cta: "Get started",
    ctaHref: "/signup",
    popular: true,
    features: [
      "Unlimited forms",
      "50,000 responses / month",
      "All 5 themes",
      "All 9 field types",
      "Conditional logic",
      "Response analytics",
      "Expiry & response limits",
      "90-day response history",
    ],
    excluded: [
      "Custom domain",
      "Priority support",
    ],
  },
  {
    name: "Team",
    price: "$49",
    period: "/month",
    description: "For growing teams that need collaboration, custom domains, and SLA-backed support.",
    cta: "Contact sales",
    ctaHref: "/signup",
    popular: false,
    features: [
      "Everything in Pro",
      "Up to 10 team seats",
      "Custom domain",
      "Unlimited response history",
      "Priority support",
      "99.9% uptime SLA",
      "Audit logs",
      "SSO / SAML",
    ],
    excluded: [],
  },
]

function Pricing() {
  return (
    <section id="pricing" className="py-16 sm:py-20 border-t border-border/30">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="text-center mb-14">
          <Badge className="mb-5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase">
            Pricing
          </Badge>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-lg mx-auto">
            Start free. Upgrade when you need more. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-8 transition-all duration-200 ${
                plan.popular
                  ? "border-primary/50 bg-primary/5 shadow-xl shadow-primary/10"
                  : "border-border/50 bg-card/60 hover:border-border/80"
              }`}
              style={plan.popular ? { boxShadow: "0 0 0 1px rgba(6,182,212,0.15), 0 20px 40px rgba(0,0,0,0.3), 0 0 60px rgba(6,182,212,0.05)" } : {}}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/30">
                    Most popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">{plan.name}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold tracking-tight">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{plan.description}</p>
              </div>

              <Button
                asChild
                className={`w-full font-semibold h-10 mb-7 ${
                  plan.popular
                    ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
                    : "variant-outline border-border/60"
                }`}
                variant={plan.popular ? "default" : "outline"}
              >
                <Link href={plan.ctaHref}>{plan.cta}</Link>
              </Button>

              <div className="flex flex-col gap-2.5">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-start gap-2.5">
                    <IconCheck className="size-4 shrink-0 mt-px text-primary" />
                    <span className="text-sm text-foreground/80">{f}</span>
                  </div>
                ))}
                {plan.excluded.map((f) => (
                  <div key={f} className="flex items-start gap-2.5 opacity-40">
                    <IconX className="size-4 shrink-0 mt-px text-muted-foreground" />
                    <span className="text-sm text-muted-foreground line-through">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground/60 mt-8">
          All plans include SSL, GDPR-compliant storage, and a 14-day money-back guarantee.
        </p>
      </div>
    </section>
  )
}

// ─── CTA Banner ─────────────────────────────────────────────────────────────────

function CTABanner({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <section className="py-16 sm:py-20 border-t border-border/30 bg-slate-50 dark:bg-muted/20">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <div
          className="relative overflow-hidden rounded-3xl border border-primary/20 px-8 py-16 sm:px-16 text-center"
          style={{
            background: "radial-gradient(ellipse at 50% -20%, rgba(6,182,212,0.15) 0%, transparent 60%), linear-gradient(135deg, rgba(8,145,178,0.08) 0%, transparent 50%)",
            boxShadow: "0 0 80px rgba(6,182,212,0.08)",
          }}
        >
          {/* Glow dot grid */}
          <div
            className="pointer-events-none absolute inset-0 -z-10 opacity-50"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(6,182,212,0.08) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-6">
            <IconSparkles className="size-3.5" />
            Free forever — no credit card needed
          </div>

          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            Ready to build your first form?
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Join thousands of builders using BipsForm to collect data they can actually use.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {isLoggedIn ? (
              <Button asChild size="lg" className="gap-2 font-semibold px-10 h-12 text-base shadow-xl shadow-primary/30">
                <Link href="/dashboard/forms">
                  <IconForms className="size-5" />
                  Create a form now
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="gap-2 font-semibold px-10 h-12 text-base shadow-xl shadow-primary/30 bg-primary hover:bg-primary/90">
                  <Link href="/signup">
                    Get started free
                    <IconArrowRight className="size-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="px-8 h-12 text-base border-border/60 hover:border-primary/50">
                  <Link href="/login">I already have an account</Link>
                </Button>
              </>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground/70">
            {["SSL encrypted", "GDPR compliant", "99.9% uptime", "No vendor lock-in"].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <IconCheck className="size-3.5 text-green-500" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ─────────────────────────────────────────────────────────────────────

function Footer() {
  const links = {
    Product: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Dashboard", href: "/dashboard" },
    ],
    Resources: [
      { label: "Sign up", href: "/signup" },
      { label: "Log in", href: "/login" },
      { label: "API Docs", href: "#" },
      { label: "Status", href: "#" },
    ],
    Legal: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Policy", href: "#" },
      { label: "Security", href: "#" },
    ],
  }

  return (
    <footer className="border-t border-border/30 bg-slate-50 dark:bg-muted/20 pt-14 pb-8">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <LogoMark size={26} />
              <span className="text-[15px] font-semibold tracking-tight">BipsForm</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">
              Always on form — build, share and collect responses at scale.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50 mb-4">{category}</p>
              <ul className="flex flex-col gap-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/30 pt-6">
          <p className="text-xs text-muted-foreground/50">
            © {new Date().getFullYear()} BipsForm. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/40">
            Made with ♥ for builders everywhere
          </p>
        </div>
      </div>
    </footer>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { user, isLoading } = useUser()
  const isLoggedIn = !isLoading && !!user?.id

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Navbar isLoggedIn={isLoggedIn} />
      <main>
        <Hero isLoggedIn={isLoggedIn} />
        <TrustedBy />
        <Features />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <CTABanner isLoggedIn={isLoggedIn} />
      </main>
      <Footer />
    </div>
  )
}
