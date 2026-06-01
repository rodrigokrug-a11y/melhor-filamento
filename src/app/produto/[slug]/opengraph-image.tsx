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
          background: "white",
          color: "#0a0a0a",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 36, color: "#737373" }}>
          melhorfilamento.com.br
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 32, color: "#737373" }}>
            {brand}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 60,
              fontWeight: 700,
              marginTop: 12,
              lineHeight: 1.1,
            }}
          >
            {name}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
          {price ? (
            <>
              <div style={{ display: "flex", fontSize: 32, color: "#737373" }}>
                a partir de
              </div>
              <div style={{ display: "flex", fontSize: 68, fontWeight: 700 }}>
                {price}
              </div>
            </>
          ) : (
            <div style={{ display: "flex", fontSize: 32, color: "#737373" }}>
              Compare preços entre lojas
            </div>
          )}
        </div>
      </div>
    ),
    { ...size },
  );
}
