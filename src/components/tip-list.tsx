import Link from "next/link";
import { Gauge, Layers, Thermometer } from "lucide-react";

import type { getTipsByMaterial } from "@/lib/tips";

type Tip = Awaited<ReturnType<typeof getTipsByMaterial>>[number];

export function TipList({ tips }: { tips: Tip[] }) {
  if (tips.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Ainda não há dicas para este material. Seja o primeiro a compartilhar!
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {tips.map((t) => (
        <li key={t.id} className="rounded-xl border bg-card p-4">
          <p className="whitespace-pre-line text-sm">{t.notes}</p>

          {t.nozzleTempC != null ||
          t.bedTempC != null ||
          t.speedMms != null ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {t.nozzleTempC != null ? (
                <Chip icon={Thermometer} label="Bico" value={`${t.nozzleTempC} °C`} />
              ) : null}
              {t.bedTempC != null ? (
                <Chip icon={Layers} label="Mesa" value={`${t.bedTempC} °C`} />
              ) : null}
              {t.speedMms != null ? (
                <Chip icon={Gauge} label="Velocidade" value={`${t.speedMms} mm/s`} />
              ) : null}
            </div>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{t.authorName}</span>
            <span>·</span>
            <span>{t.createdAt.toLocaleDateString("pt-BR")}</span>
            {t.product ? (
              <>
                <span>·</span>
                <Link
                  href={`/produto/${t.product.slug}`}
                  className="text-primary hover:underline"
                >
                  {t.product.name}
                </Link>
              </>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

function Chip({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs">
      <Icon className="size-3.5 text-muted-foreground" />
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </span>
  );
}
