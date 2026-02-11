import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt =
  "Dispatch: Idle Compute for AI Agents | BOLT Token + x402 + ERC-8004 on Monad & Solana";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function TwitterImage() {
  const [regularFont, boldFont] = await Promise.all([
    readFile(join(process.cwd(), "src/app/fonts/SpaceGrotesk-Regular.ttf")),
    readFile(join(process.cwd(), "src/app/fonts/SpaceGrotesk-Bold.ttf")),
  ]);

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
          fontFamily: "\"Space Grotesk\", sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top accent border, gold gradient */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #d4a246, #e8c06e, #d4a246)",
          }}
        />

        {/* Subtle grid background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(212,162,70,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(212,162,70,0.04) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
            zIndex: 1,
          }}
        >
          {/* Gold hexagon "D" icon */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "8px",
            }}
          >
            <svg
              width="64"
              height="72"
              viewBox="0 0 32 32"
              xmlns="http://www.w3.org/2000/svg"
            >
              <polygon
                points="16,1 29,8.5 29,23.5 16,31 3,23.5 3,8.5"
                fill="#d4a246"
              />
              <path
                d="M11 9h5c4.4 0 8 3.1 8 7s-3.6 7-8 7h-5V9zm3 2.5v9h2c2.8 0 5-2 5-4.5s-2.2-4.5-5-4.5h-2z"
                fill="#0a0a0f"
              />
            </svg>
          </div>

          {/* Main title, full gold */}
          <div
            style={{
              fontSize: "72px",
              fontWeight: 700,
              color: "#d4a246",
              letterSpacing: "-2px",
              display: "flex",
            }}
          >
            Dispatch
          </div>

          {/* Subtitle */}
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
            Idle compute for AI agents. BOLT token + x402 payments + ERC-8004 reputation.
          </div>

          {/* Tags */}
          <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
            <div
              style={{
                padding: "8px 20px",
                borderRadius: "9999px",
                border: "1px solid rgba(212,162,70,0.3)",
                color: "#e8c06e",
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
                border: "1px solid rgba(212,162,70,0.3)",
                color: "#e8c06e",
                fontSize: "16px",
                display: "flex",
              }}
            >
              BOLT Token
            </div>
            <div
              style={{
                padding: "8px 20px",
                borderRadius: "9999px",
                border: "1px solid rgba(212,162,70,0.3)",
                color: "#e8c06e",
                fontSize: "16px",
                display: "flex",
              }}
            >
              x402 Protocol
            </div>
          </div>
        </div>

        {/* Bottom domain */}
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            display: "flex",
            color: "#52525b",
            fontSize: "14px",
          }}
        >
          dispatch.computer
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Space Grotesk",
          data: regularFont,
          weight: 400 as const,
          style: "normal" as const,
        },
        {
          name: "Space Grotesk",
          data: boldFont,
          weight: 700 as const,
          style: "normal" as const,
        },
      ],
    }
  );
}
