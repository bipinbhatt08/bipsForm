import { ImageResponse } from "next/og"

export const alt = "BipsForm — Always on form"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0f1a 0%, #0b1a26 50%, #140f24 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -220,
            left: "50%",
            transform: "translateX(-50%)",
            width: 950,
            height: 620,
            background: "radial-gradient(ellipse, rgba(6,182,212,0.35) 0%, transparent 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -260,
            right: -140,
            width: 700,
            height: 500,
            background: "radial-gradient(ellipse, rgba(139,92,246,0.22) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 22, marginBottom: 40 }}>
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: 20,
              background: "#0891B2",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 9,
              padding: "0 18px",
            }}
          >
            <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.95)", width: "100%", display: "flex" }} />
            <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.65)", width: "68%", display: "flex" }} />
            <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.38)", width: "44%", display: "flex" }} />
          </div>
          <div style={{ fontSize: 58, fontWeight: 800, color: "white", display: "flex", letterSpacing: -1 }}>
            BipsForm
          </div>
        </div>

        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            textAlign: "center",
            display: "flex",
            maxWidth: 940,
            lineHeight: 1.25,
            color: "white",
          }}
        >
          Forms your users actually want to fill
        </div>

        <div
          style={{
            marginTop: 28,
            fontSize: 26,
            color: "rgba(255,255,255,0.6)",
            display: "flex",
          }}
        >
          Build, share &amp; collect — zero infrastructure needed
        </div>
      </div>
    ),
    { ...size }
  )
}
