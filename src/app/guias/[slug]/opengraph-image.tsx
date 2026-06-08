import { ImageResponse } from "next/og";

import { getGuia, getGuiaSlugs } from "@/lib/guias";
import { guiaCat } from "@/lib/guias-visual";

export const alt = "Guia de impressão 3D — Melhor Filamento";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getGuiaSlugs().map((slug) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guia = getGuia(slug);
  const titulo = guia?.titulo ?? "Guia de impressão 3D";
  const cat = guiaCat(slug);

  // Tamanho do título conforme o comprimento.
  const len = titulo.length;
  const titleSize = len > 60 ? 52 : len > 46 ? 60 : 70;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0C1F23 0%, #102A2F 55%, #123E3A 100%)",
          color: "#E7EFEE",
          padding: "64px 76px",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Motivo decorativo (lente/carretel) à direita */}
        <div
          style={{
            position: "absolute",
            display: "flex",
            top: -120,
            right: -130,
            width: 540,
            height: 540,
            borderRadius: 270,
            border: "2px solid rgba(95,179,175,0.22)",
          }}
        />
        <div
          style={{
            position: "absolute",
            display: "flex",
            top: 40,
            right: 30,
            width: 300,
            height: 300,
            borderRadius: 150,
            border: `3px solid ${cat.accent}`,
            opacity: 0.28,
          }}
        />
        <div
          style={{
            position: "absolute",
            display: "flex",
            top: 150,
            right: 140,
            width: 80,
            height: 80,
            borderRadius: 40,
            background: "linear-gradient(135deg, #0E7E7B 0%, #54B62E 100%)",
            opacity: 0.85,
          }}
        />

        {/* Marca */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 32,
              background: "linear-gradient(135deg, #0E7E7B 0%, #54B62E 100%)",
            }}
          >
            <div style={{ width: 22, height: 22, borderRadius: 11, background: "#0C1F23" }} />
          </div>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 700 }}>
            <span style={{ color: "#FFFFFF" }}>Melhor</span>
            <span style={{ color: "#5FB3AF" }}>Filamento</span>
          </div>
        </div>

        {/* Conteúdo */}
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 880 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              alignSelf: "flex-start",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "0.14em",
              color: "#0C1F23",
              background: cat.accent,
              padding: "8px 18px",
              borderRadius: 999,
              marginBottom: 26,
            }}
          >
            GUIA · {cat.label.toUpperCase()}
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontSize: titleSize,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              color: "#FFFFFF",
            }}
          >
            {titulo}
          </div>
        </div>

        {/* Rodapé */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", fontSize: 26, fontWeight: 600, color: "#5FB3AF" }}>
            melhorfilamento.com.br
          </div>
          <div style={{ display: "flex", fontSize: 22, color: "#9FC0BC" }}>
            Compare. Descubra. Compre melhor.
          </div>
        </div>

        {/* Faixa de acento */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            display: "flex",
            width: "100%",
            height: 12,
            background: "linear-gradient(90deg, #0E7E7B 0%, #54B62E 100%)",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
