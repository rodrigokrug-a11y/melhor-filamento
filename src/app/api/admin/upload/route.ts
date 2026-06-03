import { type NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin-emails";
import { prisma } from "@/lib/db";

// Upload de imagem do admin (banner etc.). Guarda os bytes no banco e devolve
// uma URL própria (/api/uploads/<id>). Só admin pode enviar.
export const runtime = "nodejs";

const ALLOWED = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/avif",
]);
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!isAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo ausente." }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "Formato inválido. Use PNG, JPG, WebP, GIF ou AVIF." },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Imagem muito grande (máximo 5 MB)." },
      { status: 400 },
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const upload = await prisma.upload.create({
    data: { mimeType: file.type, data: bytes },
    select: { id: true },
  });
  return NextResponse.json({ url: `/api/uploads/${upload.id}` });
}
