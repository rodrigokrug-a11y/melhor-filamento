import { type NextRequest } from "next/server";

import { prisma } from "@/lib/db";

// Serve uma imagem enviada pelo admin (guardada no banco). Conteúdo imutável
// por id → cache longo.
export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const upload = await prisma.upload.findUnique({
    where: { id },
    select: { mimeType: true, data: true },
  });
  if (!upload) return new Response("Não encontrado.", { status: 404 });

  return new Response(new Uint8Array(upload.data), {
    status: 200,
    headers: {
      "Content-Type": upload.mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
