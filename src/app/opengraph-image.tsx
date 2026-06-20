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
          background:
            "linear-gradient(135deg, #0C1F23 0%, #102A2F 55%, #123E3A 100%)",
          color: "#E7EFEE",
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
              background: "linear-gradient(135deg, #0E7E7B 0%, #54B62E 100%)",
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                background: "#0C1F23",
              }}
            />
          </div>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 700 }}>
            <span style={{ color: "#FFFFFF" }}>Melhor</span>
            <span style={{ color: "#5FB3AF" }}>Filamento</span>
          </div>
        </div>

        {/* Mensagem */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "0.18em",
              color: "#5FB3AF",
              marginBottom: 22,
            }}
          >
            COMPARE · DESCUBRA · COMPRE MELHOR
          </div>
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
            <span style={{ color: "#FFFFFF" }}>O melhor preço em&nbsp;</span>
            <span style={{ color: "#9BE06A" }}>filamento e resina 3D</span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 34,
              color: "#9FC0BC",
              marginTop: 26,
            }}
          >
            Compare o preço de várias lojas e compre pelo melhor preço.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              color: "#5FB3AF",
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
            background: "linear-gradient(90deg, #0E7E7B 0%, #54B62E 100%)",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
