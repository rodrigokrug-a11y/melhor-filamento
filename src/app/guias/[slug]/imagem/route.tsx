import { ImageResponse } from "next/og";

import { getGuiaSlugs } from "@/lib/guias";
import { guiaCat, guiaDestaque } from "@/lib/guias-visual";

export const dynamic = "force-static";

export function generateStaticParams() {
  return getGuiaSlugs().map((slug) => ({ slug }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const frase = guiaDestaque(slug);
  const cat = guiaCat(slug);

  const len = frase.length;
  const size = len > 34 ? 48 : len > 26 ? 54 : 60;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "linear-gradient(120deg, #0B6F6C 0%, #138A5F 52%, #3FA52A 100%)",
          color: "#FFFFFF",
          padding: "0 80px",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Texto */}
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 800 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "0.16em",
              color: "rgba(255,255,255,0.82)",
              marginBottom: 18,
            }}
          >
            MELHOR FILAMENTO · GUIA
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontSize: size,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            {frase}
          </div>
        </div>

        {/* Motivo (lente) à direita */}
        <div
          style={{
            position: "absolute",
            display: "flex",
            top: -90,
            right: -70,
            width: 360,
            height: 360,
            borderRadius: 180,
            border: "2px solid rgba(255,255,255,0.25)",
          }}
        />
        <div
          style={{
            position: "absolute",
            display: "flex",
            top: 60,
            right: 80,
            width: 180,
            height: 180,
            borderRadius: 90,
            border: "3px solid rgba(255,255,255,0.45)",
          }}
        />
        <div
          style={{
            position: "absolute",
            display: "flex",
            top: 122,
            right: 142,
            width: 56,
            height: 56,
            borderRadius: 28,
            background: cat.accent,
          }}
        />
      </div>
    ),
    { width: 1200, height: 420 },
  );
}
