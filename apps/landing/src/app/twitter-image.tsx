import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "Dispatch — Idle Compute for AI Agents | x402 + ERC-8004 on Monad & Solana";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "#0a0a0f",
          fontFamily: "Inter, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #6366f1, #818cf8, #6366f1)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
            zIndex: 1,
          }}
        >
          <div style={{ fontSize: "64px", marginBottom: "8px", display: "flex" }}>
            {"⚡"}
          </div>
          <div
            style={{
              fontSize: "72px",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-2px",
              display: "flex",
            }}
          >
            Dis
            <span style={{ color: "#6366f1" }}>patch</span>
          </div>
          <div
            style={{
              fontSize: "24px",
              color: "#a1a1aa",
              maxWidth: "700px",
              textAlign: "center",
              lineHeight: 1.4,
              display: "flex",
            }}
          >
            Dispatch idle compute to AI agents. x402 payments + ERC-8004 reputation.
          </div>
          <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
            <div
              style={{
                padding: "8px 20px",
                borderRadius: "9999px",
                border: "1px solid rgba(99,102,241,0.4)",
                color: "#818cf8",
                fontSize: "16px",
                display: "flex",
              }}
            >
              Monad + Solana
            </div>
            <div
              style={{
                padding: "8px 20px",
                borderRadius: "9999px",
                border: "1px solid rgba(99,102,241,0.4)",
                color: "#818cf8",
                fontSize: "16px",
                display: "flex",
              }}
            >
              Working MVP
            </div>
            <div
              style={{
                padding: "8px 20px",
                borderRadius: "9999px",
                border: "1px solid rgba(99,102,241,0.4)",
                color: "#818cf8",
                fontSize: "16px",
                display: "flex",
              }}
            >
              x402 Protocol
            </div>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            display: "flex",
            color: "#52525b",
            fontSize: "14px",
          }}
        >
          dispatch.network
        </div>
      </div>
    ),
    { ...size }
  );
}
