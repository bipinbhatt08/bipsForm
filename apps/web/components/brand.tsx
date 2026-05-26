import * as React from "react"
import Link from "next/link"

// Clean single-color mark — no gradient overload
export function LogoMark({ size = 32 }: { size?: number }) {
  const r = Math.round(size * 0.26)
  const p = Math.round(size * 0.22)
  const h = Math.round(size * 0.1)
  const g = Math.round(size * 0.13)
  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: r,
        background: "#0891B2",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: p,
        gap: g,
        flexShrink: 0,
      }}
    >
      <div style={{ height: h, width: "100%", borderRadius: h / 2, background: "rgba(255,255,255,0.95)" }} />
      <div style={{ height: h, width: "68%", borderRadius: h / 2, background: "rgba(255,255,255,0.65)" }} />
      <div style={{ height: h, width: "42%", borderRadius: h / 2, background: "rgba(255,255,255,0.38)" }} />
    </div>
  )
}

// Styled wordmark — "Bips" regular + "Form" muted
export function BipsFormWordmark({ size = 15 }: { size?: number }) {
  return (
    <span style={{ fontSize: size, letterSpacing: "-0.025em", lineHeight: 1, display: "inline-flex", alignItems: "baseline" }}>
      <span style={{ fontWeight: 700, color: "currentColor" }}>Bips</span>
      <span style={{ fontWeight: 600, opacity: 0.55 }}>Form</span>
    </span>
  )
}

export function BipsFormLogo({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <LogoMark size={size} />
      <BipsFormWordmark size={size * 0.57} />
    </Link>
  )
}
