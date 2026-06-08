import type { ReactNode } from "react";

/**
 * Renderizador de Markdown leve e sem dependências para as respostas da IA.
 *
 * Cobre o subconjunto que o modelo costuma emitir: títulos (`#`..`######`),
 * **negrito**, *itálico*, `código inline`, listas (`-`/`*`/`+` e `1.`),
 * links `[texto](url)`, parágrafos e quebras de linha.
 *
 * Monta elementos React diretamente (NÃO usa dangerouslySetInnerHTML), então
 * não há risco de injeção de HTML a partir do texto do modelo.
 */

// bold | code | link | *italic* | _italic_
const INLINE_RE =
  /(\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)|\*([^*\n]+)\*|_([^_\n]+)_)/g;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let k = 0;
  let m: RegExpExecArray | null;
  INLINE_RE.lastIndex = 0;
  while ((m = INLINE_RE.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const key = `${keyPrefix}-${k++}`;
    if (m[2] !== undefined) {
      nodes.push(
        <strong key={key} className="font-semibold">
          {m[2]}
        </strong>,
      );
    } else if (m[3] !== undefined) {
      nodes.push(
        <code
          key={key}
          className="rounded bg-foreground/10 px-1 py-0.5 font-mono text-[0.85em]"
        >
          {m[3]}
        </code>,
      );
    } else if (m[4] !== undefined) {
      const href = m[5];
      const internal = href.startsWith("/") || href.startsWith("#");
      nodes.push(
        <a
          key={key}
          href={href}
          {...(internal ? {} : { target: "_blank", rel: "noopener noreferrer" })}
          className="font-medium text-brand underline underline-offset-2 hover:text-teal"
        >
          {m[4]}
        </a>,
      );
    } else {
      nodes.push(<em key={key}>{m[6] ?? m[7]}</em>);
    }
    last = INLINE_RE.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

const HEADING_CLASS: Record<number, string> = {
  1: "font-display text-base font-bold",
  2: "font-display text-base font-bold",
  3: "font-display text-sm font-bold",
  4: "text-sm font-semibold",
  5: "text-sm font-semibold",
  6: "text-sm font-semibold",
};

export function Markdown({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let para: string[] = [];
  let key = 0;

  const flushPara = () => {
    if (para.length === 0) return;
    const text = para.join(" ");
    const id = key++;
    blocks.push(
      <p key={`p-${id}`} className="leading-relaxed">
        {renderInline(text, `p${id}`)}
      </p>,
    );
    para = [];
  };

  for (let i = 0; i < lines.length; ) {
    const trimmed = lines[i].trim();

    if (!trimmed) {
      flushPara();
      i++;
      continue;
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(trimmed);
    if (heading) {
      flushPara();
      const level = heading[1].length;
      const id = key++;
      blocks.push(
        <p key={`h-${id}`} className={HEADING_CLASS[level]}>
          {renderInline(heading[2], `h${id}`)}
        </p>,
      );
      i++;
      continue;
    }

    // Tabela estilo pipe (GFM): cabeçalho + linha separadora "| --- | --- |".
    const sep = lines[i + 1] ?? "";
    const isSep =
      sep.includes("|") && sep.includes("-") && /^[\s|:-]+$/.test(sep.trim());
    if (trimmed.includes("|") && isSep) {
      flushPara();
      const splitRow = (ln: string): string[] => {
        let s = ln.trim();
        if (s.startsWith("|")) s = s.slice(1);
        if (s.endsWith("|")) s = s.slice(0, -1);
        return s.split("|").map((c) => c.trim());
      };
      const header = splitRow(lines[i]);
      i += 2; // pula cabeçalho + separador
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim() !== "") {
        rows.push(splitRow(lines[i]));
        i++;
      }
      const id = key++;
      blocks.push(
        <div
          key={`tbl-${id}`}
          className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0"
        >
          <table className="w-full min-w-[480px] border-separate border-spacing-0">
            <thead>
              <tr>
                {header.map((h, hi) => (
                  <th
                    key={hi}
                    className="border-b bg-muted/40 px-3 py-2 text-left font-mono text-[11px] font-bold uppercase tracking-wide text-muted-foreground first:rounded-l-lg last:rounded-r-lg"
                  >
                    {renderInline(h, `th${id}-${hi}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri}>
                  {header.map((_, ci) => (
                    <td
                      key={ci}
                      className="border-b px-3 py-2.5 align-top text-muted-foreground [&:first-child]:font-medium [&:first-child]:text-foreground"
                    >
                      {renderInline(r[ci] ?? "", `td${id}-${ri}-${ci}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    if (/^[-*+]\s+/.test(trimmed)) {
      flushPara();
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*+]\s+/, "").trim());
        i++;
      }
      const id = key++;
      blocks.push(
        <ul key={`ul-${id}`} className="list-disc space-y-1 pl-5">
          {items.map((it, idx) => (
            <li key={idx}>{renderInline(it, `ul${id}-${idx}`)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      flushPara();
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, "").trim());
        i++;
      }
      const id = key++;
      blocks.push(
        <ol key={`ol-${id}`} className="list-decimal space-y-1 pl-5">
          {items.map((it, idx) => (
            <li key={idx}>{renderInline(it, `ol${id}-${idx}`)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    // Linha de parágrafo (remove marcador de citação, se houver).
    para.push(trimmed.replace(/^>\s?/, ""));
    i++;
  }
  flushPara();

  return <div className={className ?? "space-y-2 text-sm"}>{blocks}</div>;
}
