import { ImageResponse } from "next/og";

import { getProductDetail } from "@/lib/catalog";
import { formatBRL } from "@/lib/utils";

export const alt = "Oferta no Melhor Filamento";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductDetail(slug);
  const name = product?.name ?? "Produto";
  const brand = product?.brandName ?? "";
  const price =
    product?.bestPrice != null ? formatBRL(product.bestPrice) : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F6F9F8",
          color: "#131B1A",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Marca */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              borderRadius: 24,
              background: "linear-gradient(135deg, #0E7E7B 0%, #54B62E 100%)",
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                background: "#F6F9F8",
              }}
            />
          </div>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 700 }}>
            <span style={{ color: "#131B1A" }}>Melhor</span>
            <span style={{ color: "#0E7E7B" }}>Filamento</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 32, color: "#4F5D5C" }}>
            {brand}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 60,
              fontWeight: 700,
              marginTop: 12,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            {name}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
          {price ? (
            <>
              <div
                style={{
                  display: "flex",
                  fontSize: 28,
                  color: "#0A6967",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                }}
              >
                MELHOR PREÇO
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 68,
                  fontWeight: 700,
                  color: "#0E7E7B",
                }}
              >
                {price}
              </div>
            </>
          ) : (
            <div style={{ display: "flex", fontSize: 32, color: "#4F5D5C" }}>
              Compare preços entre lojas
            </div>
          )}
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
