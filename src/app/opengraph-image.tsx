import { ImageResponse } from "next/og";

export const alt =
  "Melhor Filamento — Comparador de preços de filamentos e resinas 3D";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #FFF1E9 0%, #FBF8F4 55%)",
          color: "#16120e",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Marca */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 72,
              height: 72,
              borderRadius: 36,
              background: "#F2541B",
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                background: "#FBF8F4",
              }}
            />
          </div>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 700 }}>
            <span>Melhor</span>
            <span style={{ color: "#F2541B" }}>Filamento</span>
          </div>
        </div>

        {/* Mensagem */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontSize: 74,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            <span>O melhor preço em&nbsp;</span>
            <span style={{ color: "#F2541B" }}>filamento e resina 3D</span>
          </div>
          <div style={{ display: "flex", fontSize: 34, color: "#6f675b", marginTop: 26 }}>
            Compare ofertas de várias lojas com frete para o seu CEP.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              color: "#F2541B",
              fontWeight: 600,
              marginTop: 36,
            }}
          >
            melhorfilamento.com.br
          </div>
        </div>

        {/* Faixa de acento */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: 12,
            background: "linear-gradient(90deg, #F2541B 0%, #0D9488 100%)",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
