import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Saída mínima para self-host/Docker (gera .next/standalone). A Vercel ignora.
  output: "standalone",
  images: {
    // Logos de marca e imagens de produto vêm de lojas externas (https).
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  // Garante que o Prisma Client gerado entre no trace do standalone.
  outputFileTracingIncludes: {
    "/*": ["./node_modules/.prisma/client/**/*"],
  },
  // Cabeçalhos de segurança (sem CSP por ora — evita quebrar GA/Ads/fontes;
  // CSP fica como melhoria futura, idealmente em report-only primeiro).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
