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
};

export default nextConfig;
