'use client'

import Link from "next/link"
import {
  IconArrowRight,
  IconSearch,
  IconSparkles,
  IconForms,
  IconUsers,
  IconUser,
  IconListDetails,
  IconChevronLeft,
  IconChevronRight,
  IconAlertTriangle,
  IconLayoutDashboard,
} from "@tabler/icons-react"
import { useState, useMemo } from "react"
import { Button } from "~/components/ui/button"
import { useGetPublicForms } from "~/hooks/api/form"
import { useUser } from "~/hooks/api/auth"
import { THEMES } from "~/app/forms/[slug]/themes"
import { PublicNavbar } from "~/components/public-navbar"

// ── Helpers ────────────────────────────────────────────────────────────────────

function getTheme(themeId: string) {
  return THEMES[themeId] ?? THEMES["minimal"]!
}

function formatExpiresIn(expiresAt: string | null): { label: string; urgent: boolean } | null {
  if (!expiresAt) return null
  const ms = new Date(expiresAt).getTime() - Date.now()
  if (ms <= 0) return { label: "Expired", urgent: true }
  const days = Math.floor(ms / 86400000)
  const hours = Math.floor((ms % 86400000) / 3600000)
  if (days > 0) return { label: `Expires in ${days}d`, urgent: days <= 2 }
  return { label: `Expires in ${hours}h`, urgent: true }
}

const PAGE_SIZE = 6
const ALL_THEMES = ["all", ...Object.keys(THEMES)]

// ── Form card ──────────────────────────────────────────────────────────────────

function FormCard({ form }: { form: ReturnType<typeof useGetPublicForms>["forms"][number] }) {
  const theme = getTheme(form.themeId ?? "minimal")
  const expires = formatExpiresIn(form.expiresAt)

  return (
    <div
      className="group flex flex-col rounded-2xl border border-border/50 bg-card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
      style={{ borderLeftColor: theme.swatch, borderLeftWidth: "3px" }}
    >
      <div className="flex flex-col flex-1 p-5 gap-4">

        <div className="flex items-center justify-between">
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: `${theme.swatch}22`, color: theme.swatch }}>
            {theme.label}
          </span>
          {expires ? (
            <div className={`flex items-center gap-1 text-[11px] font-semibold rounded-md px-2 py-0.5 ${
              expires.urgent ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-500"
            }`}>
              <IconAlertTriangle className="size-3 shrink-0" />
              {expires.label}
            </div>
          ) : (
            <span className="text-[11px] text-muted-foreground/40">No expiry</span>
          )}
        </div>

        <div className="flex-1">
          <Link href={`/forms/${form.slug}`}>
            <h3 className="font-bold text-base leading-snug mb-2 hover:text-primary transition-colors">{form.title}</h3>
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{form.description}</p>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/40">
          <span className="flex items-center gap-1.5">
            <IconUser className="size-3.5 shrink-0" />
            <span className="truncate max-w-[110px]">{form.creatorName}</span>
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <IconUsers className="size-3.5" />
              {/* responses — add to API later */}
            </span>
            <span className="flex items-center gap-1">
              <IconListDetails className="size-3.5" />
              {form.fieldCount}
            </span>
          </div>
        </div>

        <Button asChild size="sm" variant="outline" className="w-full gap-1.5 font-semibold h-9 border-border/60 hover:bg-muted/50">
          <Link href={`/forms/${form.slug}`}>
            Fill this form
            <IconArrowRight className="size-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ExplorePage() {
  const [search, setSearch] = useState("")
  const [activeTheme, setActiveTheme] = useState("all")
  const [page, setPage] = useState(1)

  const { user, isLoading: isLoadingUser } = useUser()
  const isLoggedIn = !isLoadingUser && !!user?.id
  const { forms } = useGetPublicForms()
  
//useMemo caches RETURN VALUE and recalculates only when dependencies change
  const filtered = useMemo(() => {
    return forms.filter((f) => {
      const matchesTheme = activeTheme === "all" || f.themeId === activeTheme
      const matchesSearch =
        search === "" ||
        f.title.toLowerCase().includes(search.toLowerCase()) ||
        (f.description ?? "").toLowerCase().includes(search.toLowerCase())
      return matchesTheme && matchesSearch
    })
  }, [forms, search, activeTheme])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleThemeChange(theme: string) { setActiveTheme(theme); setPage(1) }
  function handleSearch(value: string) { setSearch(value); setPage(1) }

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <PublicNavbar isLoggedIn={isLoggedIn} activePage="explore" />
      <main className="pt-24">

        {/* Hero */}
        <section className="relative overflow-hidden py-14 sm:py-16">
          <div className="pointer-events-none absolute inset-0 -z-20" style={{ backgroundImage: "radial-gradient(circle, rgba(6,182,212,0.10) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-transparent to-background" />
          <div className="pointer-events-none absolute -z-10 left-1/2 -top-10 -translate-x-1/2 rounded-full opacity-20 blur-[100px]" style={{ width: 500, height: 300, background: "radial-gradient(ellipse, #06B6D4 0%, #0891B2 40%, transparent 70%)" }} />
          <div className="mx-auto max-w-3xl px-5 sm:px-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-6">
              <IconSparkles className="size-3.5" />
              <span className="font-medium">Community forms, open for everyone</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl leading-tight mb-4">Explore public forms</h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed mb-8">
              Browse forms created by the community. No login needed — just pick one and fill it out.
            </p>
            <div className="relative max-w-md mx-auto">
              <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search forms..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full rounded-xl border border-border/60 bg-background pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-colors"
              />
            </div>
          </div>
        </section>

        {/* Theme filters */}
        <section className="mx-auto max-w-7xl px-5 sm:px-8 pb-5">
          <div className="flex items-center gap-2 flex-wrap">
            {ALL_THEMES.map((themeId) => {
              const label = themeId === "all" ? "All" : THEMES[themeId]?.label ?? themeId
              return (
                <button
                  key={themeId}
                  onClick={() => handleThemeChange(themeId)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-all duration-150 ${
                    activeTheme === themeId
                      ? "bg-primary text-primary-foreground border-primary shadow shadow-primary/20"
                      : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground bg-background"
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </section>

        {/* Grid */}
        <section className="mx-auto max-w-7xl px-5 sm:px-8 pb-10">
          {paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
              <div className="rounded-full bg-muted p-4">
                <IconForms className="size-8 text-muted-foreground" />
              </div>
              <p className="font-medium">No forms found</p>
              <p className="text-sm text-muted-foreground">Try a different search or theme filter</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-5">
                Showing <span className="font-medium text-foreground">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</span> of <span className="font-medium text-foreground">{filtered.length}</span> forms
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginated.map((form) => <FormCard key={form.id} form={form} />)}
              </div>
            </>
          )}
        </section>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mx-auto max-w-7xl px-5 sm:px-8 pb-16 flex items-center justify-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-background px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <IconChevronLeft className="size-4" /> Prev
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`size-9 rounded-lg text-sm font-medium transition-colors ${p === page ? "bg-primary text-primary-foreground" : "border border-border/50 text-muted-foreground hover:text-foreground bg-background"}`}>{p}</button>
              ))}
            </div>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-background px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Next <IconChevronRight className="size-4" />
            </button>
          </div>
        )}

        {/* CTA */}
        <section className="border-t border-border/30 bg-slate-50 dark:bg-muted/20 py-14">
          <div className="mx-auto max-w-2xl px-5 sm:px-8 text-center">
            <h2 className="text-2xl font-bold mb-3">Want to publish your own form?</h2>
            <p className="text-muted-foreground mb-7 text-sm leading-relaxed">Create an account, build a form, set it to public — it shows up here for everyone to fill.</p>
            <div className="flex items-center justify-center gap-3">
              <Button asChild size="lg" className="gap-2 font-semibold px-8 h-11 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
                <Link href="/signup">Create a free account <IconArrowRight className="size-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="px-6 h-11 border-border/60">
                <Link href="/dashboard"><IconLayoutDashboard className="size-4 mr-2" />Dashboard</Link>
              </Button>
            </div>
          </div>
        </section>

      </main>
    </div>
  )
}
