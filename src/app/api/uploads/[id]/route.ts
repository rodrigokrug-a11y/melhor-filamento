import { type NextRequest } from "next/server";

import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin-emails";
import { prisma } from "@/lib/db";

// Serve um arquivo enviado (guardado no banco). A MESMA tabela Upload guarda
// banners públicos do admin E anexos PRIVADOS do formulário de contato
// (PDF/DOC com dados pessoais). Por isso: se o id for anexo de uma mensagem de
// contato, exige admin; e nunca servimos não-imagem inline (força download).
export const runtime = "nodejs";

const IMG_OK = /^image\/(png|jpe?g|webp|gif|avif)$/i;

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

  // Anexo de contato = privado → só admin.
  const privateRef = await prisma.contactMessage.findFirst({
    where: { attachmentId: id },
    select: { id: true },
  });
  if (privateRef) {
    const session = await auth();
    if (!isAdminEmail(session?.user?.email)) {
      return new Response("Não autorizado.", { status: 401 });
    }
  }

  const isImage = IMG_OK.test(upload.mimeType);
  const headers: Record<string, string> = {
    // Não-imagem é servida como octet-stream + download (evita execução inline).
    "Content-Type": isImage ? upload.mimeType : "application/octet-stream",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": privateRef
      ? "private, no-store"
      : "public, max-age=31536000, immutable",
  };
  if (!isImage) headers["Content-Disposition"] = "attachment";

  return new Response(new Uint8Array(upload.data), { status: 200, headers });
}
