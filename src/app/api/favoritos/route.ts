import { NextResponse } from "next/server";

import { getProductsBySlugs } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      slugs?: unknown;
    };
    const slugs = Array.isArray(body.slugs)
      ? body.slugs.filter((s): s is string => typeof s === "string").slice(0, 100)
      : [];
    const items = await getProductsBySlugs(slugs);
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
