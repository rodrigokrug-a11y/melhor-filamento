"use client";

import { useState } from "react";
import { ImageUp, Loader2 } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Mostra a imagem (própria ou URL externa via proxy) na prévia. */
function previewSrc(url: string): string {
  return url.startsWith("/") ? url : `/api/img?url=${encodeURIComponent(url)}`;
}

/**
 * Campo de imagem do banner: envie um arquivo do computador (vai pro banco e
 * vira /api/uploads/<id>) ou cole uma URL. O valor final vai no form como
 * `imageUrl`.
 */
export function BannerImageField({
  defaultValue,
}: {
  defaultValue?: string | null;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Falha no upload.");
      setUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no upload.");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {/* valor enviado com o formulário */}
      <input type="hidden" name="imageUrl" value={url} />

      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewSrc(url)}
          alt="Prévia do banner"
          className="h-24 w-full rounded-lg border object-cover"
        />
      ) : (
        <div className="flex h-24 w-full items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground">
          Sem imagem (banner usa o gradiente da marca)
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <label
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "cursor-pointer",
            busy && "pointer-events-none opacity-60",
          )}
        >
          {busy ? (
            <Loader2 className="animate-spin" />
          ) : (
            <ImageUp />
          )}
          {busy ? "Enviando…" : "Enviar do computador"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
            className="hidden"
            onChange={handleFile}
            disabled={busy}
          />
        </label>
        {url ? (
          <Button
            size="sm"
            variant="ghost"
            type="button"
            onClick={() => setUrl("")}
          >
            Remover
          </Button>
        ) : null}
      </div>

      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="…ou cole uma URL de imagem (https://…)"
        className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />

      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      <p className="text-xs text-muted-foreground">
        Tamanho ideal: <strong>1600 × 400 px</strong> (proporção 4:1) — JPG, PNG
        ou WebP, até 5 MB. Deixe o conteúdo importante no <strong>centro</strong>
        ; as bordas podem ser cortadas. O título/subtítulo abaixo aparece por
        cima da imagem.
      </p>
    </div>
  );
}
