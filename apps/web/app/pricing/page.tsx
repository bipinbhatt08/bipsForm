'use client'

import Link from "next/link"
import {
  IconArrowRight,
  IconCheck,
  IconX,
  IconSparkles,
  IconLayoutDashboard,
  IconMinus,
  IconChevronDown,
  IconForms,
} from "@tabler/icons-react"
import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { useUser } from "~/hooks/api/auth"
import { LogoMark, BipsFormWordmark } from "~/components/brand"
import { ThemeToggle } from "~/components/theme-toggle"

// ── Navbar ─────────────────────────────────────────────────────────────────────

function Navbar({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark size={28} />
          <BipsFormWordmark size={15} />
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <Link href="/#features" className="hover:text-foreground transition-colors duration-150">Features</Link>
          <Link href="/#how-it-works" className="hover:text-foreground transition-colors duration-150">How it works</Link>
          <Link href="/pricing" className="text-foreground font-medium">Pricing</Link>
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

// ── Plans ──────────────────────────────────────────────────────────────────────

const PLANS = [
  {
    name: "Starter",
    monthly: 0,
    annual: 0,
    description: "Perfect for personal projects and small teams just getting started.",
    cta: "Start for free",
    ctaHref: "/signup",
    popular: false,
    features: [
      "Up to 5 active forms",
      "500 responses / month",
      "3 themes",
      "Basic field types (text, email, number)",
      "Public & unlisted form links",
      "7-day response history",
      "Scalar API docs",
    ],
    excluded: [
      "Conditional logic",
      "Response analytics",
      "Custom domain",
      "Priority support",
    ],
  },
  {
    name: "Pro",
    monthly: 19,
    annual: 15,
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
      "Response analytics & charts",
      "Expiry & response limits",
      "Password-protected forms",
      "90-day response history",
      "Email notifications",
    ],
    excluded: [
      "Custom domain",
      "Priority support",
    ],
  },
  {
    name: "Team",
    monthly: 49,
    annual: 39,
    description: "For growing teams that need collaboration, custom domains, and SLA-backed support.",
    cta: "Contact sales",
    ctaHref: "/signup",
    popular: false,
    features: [
      "Everything in Pro",
      "Up to 10 team seats",
      "Custom domain",
      "Unlimited response history",
      "CSV export",
      "Priority support",
      "99.9% uptime SLA",
      "Audit logs",
      "SSO / SAML",
    ],
    excluded: [],
  },
]

// ── Comparison table ───────────────────────────────────────────────────────────

const COMPARISON = [
  { feature: "Active forms",         starter: "5",          pro: "Unlimited",  team: "Unlimited" },
  { feature: "Responses / month",    starter: "500",        pro: "50,000",     team: "Unlimited" },
  { feature: "Field types",          starter: "3",          pro: "9",          team: "9" },
  { feature: "Themes",               starter: "3",          pro: "5",          team: "5" },
  { feature: "Conditional logic",    starter: false,        pro: true,         team: true },
  { feature: "Analytics & charts",   starter: false,        pro: true,         team: true },
  { feature: "Response limits",      starter: false,        pro: true,         team: true },
  { feature: "Password protection",  starter: false,        pro: true,         team: true },
  { feature: "Email notifications",  starter: false,        pro: true,         team: true },
  { feature: "CSV export",           starter: false,        pro: false,        team: true },
  { feature: "Custom domain",        starter: false,        pro: false,        team: true },
  { feature: "Team seats",           starter: "1",          pro: "1",          team: "10" },
  { feature: "Priority support",     starter: false,        pro: false,        team: true },
  { feature: "Uptime SLA",           starter: false,        pro: false,        team: "99.9%" },
]

// ── FAQ ────────────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: "Can I really use the Starter plan forever?",
    a: "Yes. The Starter plan is free forever — no trial, no expiry. You get 5 forms and 500 responses per month with no credit card required.",
  },
  {
    q: "What happens if I exceed my response limit?",
    a: "New submissions are blocked until the next billing cycle resets your count. Your existing responses are never deleted. You'll get an in-app warning before you hit the limit.",
  },
  {
    q: "Can I switch plans at any time?",
    a: "Yes. Upgrade or downgrade anytime from your account settings. Upgrades take effect immediately. Downgrades apply at the end of your current billing period.",
  },
  {
    q: "Do you offer refunds?",
    a: "We offer a 14-day money-back guarantee on all paid plans, no questions asked. Just reach out to support within 14 days of your payment.",
  },
  {
    q: "Is my data safe?",
    a: "All data is encrypted at rest and in transit. We are GDPR-compliant and never sell your data. Submissions are stored in isolated, redundant storage.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit and debit cards (Visa, Mastercard, Amex) via Stripe. Annual plans can also be paid via bank transfer.",
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-border/40 last:border-0">
      <button
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="text-sm font-medium">{q}</span>
        <IconChevronDown className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <p className="pb-5 text-sm text-muted-foreground leading-relaxed">{a}</p>
      )}
    </div>
  )
}

function Cell({ value }: { value: string | boolean }) {
  if (value === true) return <IconCheck className="size-4 text-primary mx-auto" />
  if (value === false) return <IconMinus className="size-4 text-muted-foreground/30 mx-auto" />
  return <span className="text-sm text-center block">{value}</span>
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const { user, isLoading } = useUser()
  const isLoggedIn = !isLoading && !!user?.id
  const [annual, setAnnual] = useState(false)

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Navbar isLoggedIn={isLoggedIn} />

      <main className="pt-24">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden py-16 sm:py-20">
          <div
            className="pointer-events-none absolute inset-0 -z-20"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(6,182,212,0.10) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-transparent to-background" />
          <div
            className="pointer-events-none absolute -z-10 left-1/2 top-[-60px] -translate-x-1/2 rounded-full opacity-20 blur-[100px]"
            style={{ width: 600, height: 400, background: "radial-gradient(ellipse, #06B6D4 0%, #0891B2 40%, transparent 70%)" }}
          />

          <div className="mx-auto max-w-3xl px-5 sm:px-8 text-center">
            <Badge className="mb-5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase">
              Pricing
            </Badge>
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl leading-[1.08]">
              Simple,{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #06B6D4 0%, #0891B2 50%, #8B5CF6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                transparent
              </span>{" "}
              pricing
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Start free. Upgrade when you need more. No hidden fees, no vendor lock-in.
            </p>

            {/* Monthly / Annual toggle */}
            <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-border/50 bg-muted/40 p-1">
              <button
                onClick={() => setAnnual(false)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-150 ${!annual ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all duration-150 ${annual ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Annual
                <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-bold text-green-500">−20%</span>
              </button>
            </div>
          </div>
        </section>

        {/* ── Plans ── */}
        <section className="mx-auto max-w-7xl px-5 sm:px-8 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            {PLANS.map((plan) => {
              const price = annual ? plan.annual : plan.monthly
              return (
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
                      <span className="text-5xl font-bold tracking-tight">${price}</span>
                      <span className="text-muted-foreground text-sm">/month</span>
                    </div>
                    {annual && plan.monthly > 0 && (
                      <p className="mt-1 text-xs text-green-500 font-medium">
                        Save ${(plan.monthly - plan.annual) * 12}/year
                      </p>
                    )}
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{plan.description}</p>
                  </div>

                  <Button
                    asChild
                    className={`w-full font-semibold h-10 mb-7 ${plan.popular ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25" : ""}`}
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
              )
            })}
          </div>

          <p className="text-center text-xs text-muted-foreground/50 mt-8">
            All plans include SSL encryption, GDPR-compliant storage, and a 14-day money-back guarantee.
          </p>
        </section>

        {/* ── Comparison table ── */}
        <section className="border-t border-border/30 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-5 sm:px-8">
            <div className="text-center mb-12">
              <Badge className="mb-5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase">
                Compare plans
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything side by side</h2>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border/40">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/30">
                    <th className="px-6 py-4 text-left font-semibold text-muted-foreground w-1/2">Feature</th>
                    {PLANS.map((p) => (
                      <th key={p.name} className={`px-4 py-4 text-center font-semibold ${p.popular ? "text-primary" : "text-muted-foreground"}`}>
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row, i) => (
                    <tr key={row.feature} className={`border-b border-border/30 last:border-0 ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                      <td className="px-6 py-3.5 font-medium text-sm">{row.feature}</td>
                      <td className="px-4 py-3.5 text-center"><Cell value={row.starter} /></td>
                      <td className="px-4 py-3.5 text-center bg-primary/5"><Cell value={row.pro} /></td>
                      <td className="px-4 py-3.5 text-center"><Cell value={row.team} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="border-t border-border/30 py-16 sm:py-20 bg-slate-50 dark:bg-muted/20">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <div className="text-center mb-12">
              <Badge className="mb-5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase">
                FAQ
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Frequently asked questions</h2>
            </div>
            <div className="rounded-2xl border border-border/40 bg-card/60 px-6 divide-y-0">
              {FAQS.map((faq) => (
                <FAQItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="border-t border-border/30 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-5 sm:px-8">
            <div
              className="relative overflow-hidden rounded-3xl border border-primary/20 px-8 py-16 sm:px-16 text-center"
              style={{
                background: "radial-gradient(ellipse at 50% -20%, rgba(6,182,212,0.15) 0%, transparent 60%)",
                boxShadow: "0 0 80px rgba(6,182,212,0.08)",
              }}
            >
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
                Ready to get started?
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
                        Start for free
                        <IconArrowRight className="size-5" />
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="px-8 h-12 text-base border-border/60 hover:border-primary/50">
                      <Link href="/login">Log in</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border/30 bg-slate-50 dark:bg-muted/20 pt-14 pb-8">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <LogoMark size={24} />
              <span className="text-sm font-semibold tracking-tight text-muted-foreground">BipsForm</span>
            </Link>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/#features" className="hover:text-foreground transition-colors">Features</Link>
              <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
              <Link href="/signup" className="hover:text-foreground transition-colors">Sign up</Link>
              <Link href="/login" className="hover:text-foreground transition-colors">Log in</Link>
            </div>
            <p className="text-xs text-muted-foreground/50">© {new Date().getFullYear()} BipsForm</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
