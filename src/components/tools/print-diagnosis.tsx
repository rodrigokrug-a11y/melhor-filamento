"use client";

import { useState } from "react";
import { ImageUp, Loader2, ScanSearch } from "lucide-react";

import { Markdown } from "@/components/markdown";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PrintDiagnosis() {
  const [preview, setPreview] = useState<string | null>(null);
  const [b64, setB64] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      setError("Imagem muito grande (máximo 5 MB).");
      return;
    }
    setError("");
    setResult(null);
    setMediaType(f.type);
    const dataUrl = await new Promise<string>((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.readAsDataURL(f);
    });
    setPreview(dataUrl);
    setB64(dataUrl.split(",")[1] ?? null);
    e.target.value = "";
  }

  async function analyze() {
    if (!b64 || loading) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/diagnostico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: b64, mediaType }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        diagnosis?: string;
        error?: string;
      };
      if (!res.ok || !data.diagnosis) {
        setError(data.error ?? "Não foi possível analisar.");
        return;
      }
      setResult(data.diagnosis);
    } catch {
      setError("Falha de conexão. Tente de novo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card p-5">
        <label
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "w-fit cursor-pointer",
          )}
        >
          <ImageUp />
          {preview ? "Trocar foto" : "Enviar foto da impressão"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={onFile}
          />
        </label>

        {preview ? (
          <div className="mt-4 space-y-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Foto da impressão"
              className="max-h-72 w-full rounded-xl border object-contain"
            />
            <Button onClick={analyze} disabled={loading}>
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <ScanSearch />
              )}
              {loading ? "Analisando…" : "Analisar problema"}
            </Button>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            Tire uma foto nítida da peça com o problema (warping, fios, camadas,
            adesão…) e a IA diagnostica e sugere correções.
          </p>
        )}
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      </div>

      {result ? (
        <div className="rounded-2xl border bg-card p-5">
          <h2 className="flex items-center gap-2 font-semibold">
            <ScanSearch className="size-4 text-brand" />
            Diagnóstico
          </h2>
          <Markdown
            content={result}
            className="mt-3 space-y-2 text-sm leading-relaxed [&_a]:text-brand"
          />
          <p className="mt-4 text-xs text-muted-foreground">
            Gerado por IA — pode conter erros. Use como ponto de partida.
          </p>
        </div>
      ) : null}
    </div>
  );
}
