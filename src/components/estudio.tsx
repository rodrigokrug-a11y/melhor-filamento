"use client";

import { useEffect, useRef, useState } from "react";
import { Download, ImagePlus, Copy, Check } from "lucide-react";

// Estúdio de posts: gera imagem de social (Feed/Story) da marca a partir de uma
// foto do usuário + textos, 100% no navegador (a foto não sai do dispositivo).

type Tipo = "oferta" | "destaque" | "dica";
type Formato = "feed" | "story";

const COR = {
  navy: "#0C1F23",
  navy2: "#123E3A",
  teal: "#0E7E7B",
  teal300: "#5FB3AF",
  green: "#54B62E",
  green2: "#9BE06A",
  gold: "#E0A92E",
  light: "#E7EFEE",
  soft: "#9FC0BC",
  white: "#FFFFFF",
};

const TIPOS: { id: Tipo; label: string }[] = [
  { id: "oferta", label: "Oferta" },
  { id: "destaque", label: "Destaque" },
  { id: "dica", label: "Dica" },
];

// Hashtags por tipo (pesquisadas; mix amplo + nicho pt-BR de impressão 3D).
const HASHTAGS: Record<Tipo, string[]> = {
  oferta: ["impressao3d", "impressora3d", "filamento3d", "filamentopla", "filamentopetg", "pla", "petg", "impressao3dbrasil", "maker", "makerbrasil", "creality", "ender3", "manufaturaaditiva", "prototipagem", "promocao3d", "melhorfilamento"],
  destaque: ["impressao3d", "impressora3d", "filamento3d", "filamentopla", "plabrasil", "impressao3dbrasil", "filamento", "maker", "manufaturaaditiva", "prototipagem", "crealitybrasil", "ender3", "resina3d", "miniaturas3d", "melhorfilamento"],
  dica: ["impressao3d", "impressora3d", "filamento3d", "filamentopla", "pla", "petg", "manufaturaaditiva", "prototipagem", "maker", "makerbrasil", "impressao3dbrasil", "creality", "modelagem3d", "resina3d", "melhorfilamento"],
};

// Legenda pronta (texto plano — Instagram não renderiza markdown).
function gerarLegenda(tipo: Tipo, f: Campos): string {
  const site = "melhorfilamento.com.br";
  const tags = HASHTAGS[tipo].map((t) => `#${t}`).join(" ");
  if (tipo === "oferta") {
    const t = f.titulo.trim() || "esse produto";
    const preco = f.precoDe.trim()
      ? `De R$ ${f.precoDe.trim()} por R$ ${f.precoPor.trim() || "?"}`
      : `Agora por R$ ${f.precoPor.trim() || "?"}`;
    return (
      `🔥 Caiu o preço — ${t}!\n\n` +
      preco +
      (f.desconto.trim() ? ` (${f.desconto.trim()}% OFF)` : "") +
      (f.loja.trim() ? ` na ${f.loja.trim()}` : "") +
      `.\n\n` +
      `Mas preço de etiqueta não é preço final 👀 — com o frete pro seu CEP a conta muda, e às vezes a oferta "imperdível" perde pra outra loja. ` +
      `Antes de fechar, compara o custo total por kg de várias lojas no ${site}.\n\n` +
      `🔗 ${site}\n\n${tags}`
    );
  }
  if (tipo === "destaque") {
    const t = f.titulo.trim() || "Menor preço do dia";
    return (
      `📊 ${t}\n\n` +
      `No Melhor Filamento a gente compara o preço de filamentos, resinas e impressoras 3D de várias lojas — e mostra o menor custo por kg já com o frete pro seu CEP.\n\n` +
      `Compara antes de comprar 👉 ${site}\n\n${tags}`
    );
  }
  const t = f.titulo.trim() || "sua dica de impressão 3D";
  return (
    `💡 Dica rápida: ${t}\n\n` +
    `Quer mais? No site tem guias completos de impressão 3D — e o comparador pra você comprar pelo menor preço real, já com o frete pro seu CEP.\n\n` +
    `🔗 ${site}\n\n${tags}`
  );
}

type Campos = {
  titulo: string;
  precoDe: string;
  precoPor: string;
  desconto: string;
  loja: string;
};

const VAZIO: Campos = { titulo: "", precoDe: "", precoPor: "", desconto: "", loja: "" };

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && cur) {
      lines.push(cur);
      cur = w;
      if (lines.length === maxLines - 1) break;
    } else {
      cur = test;
    }
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  if (lines.length === maxLines) {
    // se sobrou texto, reticências na última
    const used = lines.join(" ");
    if (used.length < text.length - 1) lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, "") + "…";
  }
  return lines;
}

export function Estudio() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const logoRef = useRef<HTMLImageElement | null>(null);
  const [tipo, setTipo] = useState<Tipo>("oferta");
  const [formato, setFormato] = useState<Formato>("feed");
  const [campos, setCampos] = useState<Campos>(VAZIO);
  const [zoom, setZoom] = useState(1);
  const [posY, setPosY] = useState(0.5);
  const [tick, setTick] = useState(0);
  const [fontsReady, setFontsReady] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [temFoto, setTemFoto] = useState(false);

  const set = (k: keyof Campos, v: string) => setCampos((c) => ({ ...c, [k]: v }));
  const bump = () => setTick((t) => t + 1);

  // Carrega fontes da marca e o logo uma vez.
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Manrope:wght@500;600;700&display=swap";
    document.head.appendChild(link);
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    Promise.all([
      fonts?.load("800 80px Sora"),
      fonts?.load("700 40px Sora"),
      fonts?.load("600 32px Manrope"),
      fonts?.load("700 32px Manrope"),
    ])
      .then(() => setFontsReady(true))
      .catch(() => setFontsReady(true));
    const logo = new Image();
    logo.onload = () => {
      logoRef.current = logo;
      bump();
    };
    logo.src = "/logo.png";
  }, []);

  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setTemFoto(true);
      setZoom(1);
      setPosY(0.5);
      bump();
    };
    img.src = URL.createObjectURL(file);
  }

  // Desenha sempre que algo muda.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = 1080;
    const H = formato === "feed" ? 1080 : 1920;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const panelY = formato === "feed" ? 560 : 1140;
    const pad = 72;
    const photoH = panelY + 60;
    const f = (s: string) => s.trim();

    // Fundo
    ctx.fillStyle = "#0a181b";
    ctx.fillRect(0, 0, W, H);
    ctx.textBaseline = "alphabetic";

    // Foto (cover-fit na área superior) ou placeholder
    if (imgRef.current) {
      const img = imgRef.current;
      const ir = img.width / img.height;
      const dr = W / photoH;
      let sw = img.width;
      let sh = img.height;
      if (ir > dr) sw = img.height * dr;
      else sh = img.width / dr;
      sw /= zoom;
      sh /= zoom;
      const sx = (img.width - sw) / 2;
      const sy = (img.height - sh) * posY;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, photoH);
    } else {
      const g = ctx.createLinearGradient(0, 0, W, photoH);
      g.addColorStop(0, "#16383e");
      g.addColorStop(1, COR.navy);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, photoH);
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "600 34px Manrope, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Adicione uma foto do produto", W / 2, panelY / 2);
      ctx.textAlign = "left";
    }

    // Scrim no topo (legibilidade do logo sobre qualquer foto)
    const tg = ctx.createLinearGradient(0, 0, 0, 210);
    tg.addColorStop(0, "rgba(0,0,0,0.45)");
    tg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = tg;
    ctx.fillRect(0, 0, W, 210);

    // Marca no topo, sobre a foto
    if (logoRef.current) ctx.drawImage(logoRef.current, pad, 54, 56, 56);
    ctx.textAlign = "left";
    ctx.font = "700 38px Sora, sans-serif";
    ctx.fillStyle = COR.white;
    ctx.fillText("Melhor", pad + 70, 94);
    const mw = ctx.measureText("Melhor").width;
    ctx.fillStyle = COR.teal300;
    ctx.fillText("Filamento", pad + 70 + mw, 94);

    // Badge de desconto (oferta), canto superior direito
    if (tipo === "oferta" && f(campos.desconto)) {
      const bx = W - 110;
      const by = 124;
      ctx.beginPath();
      ctx.arc(bx, by, 80, 0, Math.PI * 2);
      ctx.fillStyle = COR.green;
      ctx.fill();
      ctx.fillStyle = COR.navy;
      ctx.textAlign = "center";
      ctx.font = "800 54px Sora, sans-serif";
      ctx.fillText(`${f(campos.desconto)}%`, bx, by + 4);
      ctx.font = "700 24px Sora, sans-serif";
      ctx.fillText("OFF", bx, by + 40);
      ctx.textAlign = "left";
    }

    // Painel inferior (gradiente navy)
    const pg = ctx.createLinearGradient(0, panelY, W, H);
    pg.addColorStop(0, COR.navy);
    pg.addColorStop(0.55, "#102A2F");
    pg.addColorStop(1, COR.navy2);
    ctx.fillStyle = pg;
    if (typeof ctx.roundRect === "function") {
      ctx.beginPath();
      ctx.roundRect(0, panelY, W, H - panelY, [28, 28, 0, 0]);
      ctx.fill();
    } else {
      ctx.fillRect(0, panelY, W, H - panelY);
    }
    const ag = ctx.createLinearGradient(0, 0, W, 0);
    ag.addColorStop(0, COR.teal);
    ag.addColorStop(1, COR.green);
    ctx.fillStyle = ag;
    ctx.fillRect(0, panelY, W, 8);

    // Conteúdo do painel
    let y = panelY + 62;
    const eyebrow = tipo === "oferta" ? "OFERTA" : tipo === "dica" ? "DICA RÁPIDA" : "DESTAQUE";
    ctx.font = "700 26px Manrope, sans-serif";
    ctx.fillStyle = COR.green2;
    ctx.fillText(eyebrow, pad, y);
    y += 14;

    // Título (nº de linhas conforme o tipo, pra sobrar espaço pro preço)
    const maxLinhas = tipo === "dica" ? 3 : 2;
    ctx.font = "800 54px Sora, sans-serif";
    ctx.fillStyle = COR.white;
    const titulo =
      f(campos.titulo) ||
      (tipo === "oferta" ? "Nome do produto" : tipo === "dica" ? "Sua dica aqui" : "Seu destaque aqui");
    for (const ln of wrapText(ctx, titulo, W - pad * 2, maxLinhas)) {
      y += 62;
      ctx.fillText(ln, pad, y);
    }

    // Bloco de preço (oferta)
    if (tipo === "oferta") {
      y += 56;
      if (f(campos.precoDe)) {
        ctx.font = "600 32px Manrope, sans-serif";
        ctx.fillStyle = COR.soft;
        const de = `de R$ ${f(campos.precoDe)}`;
        ctx.fillText(de, pad, y);
        const dw2 = ctx.measureText(de).width;
        ctx.strokeStyle = COR.soft;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(pad, y - 10);
        ctx.lineTo(pad + dw2, y - 10);
        ctx.stroke();
        y += 18;
      }
      y += 62;
      ctx.font = "800 78px Sora, sans-serif";
      ctx.fillStyle = COR.green2;
      ctx.fillText(`R$ ${f(campos.precoPor) || "0,00"}`, pad, y);
      if (f(campos.loja)) {
        ctx.font = "600 28px Manrope, sans-serif";
        ctx.fillStyle = COR.soft;
        ctx.fillText(`na ${f(campos.loja)}`, pad, y + 40);
      }
    }

    // CTA fixo no rodapé
    ctx.font = "700 30px Manrope, sans-serif";
    ctx.fillStyle = COR.teal300;
    ctx.fillText("Compare o preço real em", pad, H - 92);
    ctx.font = "800 36px Sora, sans-serif";
    ctx.fillStyle = COR.white;
    ctx.fillText("melhorfilamento.com.br", pad, H - 48);
    ctx.font = "600 26px Manrope, sans-serif";
    ctx.fillStyle = COR.soft;
    ctx.textAlign = "right";
    ctx.fillText("@melhorfilamento3d", W - pad, H - 48);
    ctx.textAlign = "left";
  }, [tipo, formato, campos, zoom, posY, tick, fontsReady]);

  function baixar() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = `melhorfilamento-${tipo}-${formato}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  }

  async function copiarLegenda() {
    try {
      await navigator.clipboard.writeText(gerarLegenda(tipo, campos));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      /* ignore */
    }
  }

  const inputCls =
    "h-11 w-full rounded-xl border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40";
  const seg = (active: boolean) =>
    `flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${active ? "bg-brand text-white" : "text-muted-foreground hover:bg-accent"}`;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,440px)]">
      {/* Controles */}
      <div className="order-2 space-y-4 lg:order-1">
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-brand/40 bg-brand-soft/40 px-4 py-5 text-sm font-semibold text-brand transition-colors hover:bg-brand-soft">
          <ImagePlus className="size-5" />
          {temFoto ? "Trocar foto" : "Adicionar foto do produto"}
          <input type="file" accept="image/*" onChange={onPhoto} className="hidden" />
        </label>

        <div className="flex gap-1 rounded-xl border bg-card p-1">
          {TIPOS.map((t) => (
            <button key={t.id} type="button" onClick={() => setTipo(t.id)} className={seg(tipo === t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1 rounded-xl border bg-card p-1">
          <button type="button" onClick={() => setFormato("feed")} className={seg(formato === "feed")}>
            Feed (1:1)
          </button>
          <button type="button" onClick={() => setFormato("story")} className={seg(formato === "story")}>
            Story (9:16)
          </button>
        </div>

        <div className="space-y-3 rounded-2xl border bg-card p-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              {tipo === "oferta" ? "Produto" : tipo === "dica" ? "Dica" : "Destaque"}
            </label>
            <input
              className={inputCls}
              value={campos.titulo}
              onChange={(e) => set("titulo", e.target.value)}
              placeholder={tipo === "oferta" ? "Ex.: Filamento PLA Verde 1kg" : tipo === "dica" ? "Ex.: Seque o filamento antes de imprimir" : "Ex.: Menor preço de PETG do dia"}
            />
          </div>
          {tipo === "oferta" ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">De (opcional)</label>
                <input className={inputCls} value={campos.precoDe} onChange={(e) => set("precoDe", e.target.value)} placeholder="139,90" inputMode="decimal" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Por</label>
                <input className={inputCls} value={campos.precoPor} onChange={(e) => set("precoPor", e.target.value)} placeholder="98,91" inputMode="decimal" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Desconto %</label>
                <input className={inputCls} value={campos.desconto} onChange={(e) => set("desconto", e.target.value)} placeholder="29" inputMode="numeric" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Loja (opcional)</label>
                <input className={inputCls} value={campos.loja} onChange={(e) => set("loja", e.target.value)} placeholder="National 3D" />
              </div>
            </div>
          ) : null}
        </div>

        {temFoto ? (
          <div className="space-y-3 rounded-2xl border bg-card p-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Zoom da foto</label>
              <input type="range" min={1} max={2.5} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full accent-[var(--brand)]" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Enquadramento (cima/baixo)</label>
              <input type="range" min={0} max={1} step={0.01} value={posY} onChange={(e) => setPosY(Number(e.target.value))} className="w-full accent-[var(--brand)]" />
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={baixar}
          className="grad-brand flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white shadow-md transition-transform hover:-translate-y-0.5"
        >
          <Download className="size-5" />
          Baixar imagem
        </button>

        {/* Legenda */}
        <div className="rounded-2xl border bg-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold">Legenda pronta</span>
            <button
              type="button"
              onClick={copiarLegenda}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold text-teal transition-colors hover:bg-brand-soft"
            >
              {copiado ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copiado ? "Copiado!" : "Copiar legenda"}
            </button>
          </div>
          <textarea
            readOnly
            value={gerarLegenda(tipo, campos)}
            rows={9}
            className="w-full resize-none rounded-xl border bg-background p-3 text-sm leading-relaxed"
          />
        </div>
      </div>

      {/* Preview */}
      <div className="order-1 lg:order-2">
        <div className="sticky top-20">
          <div className="overflow-hidden rounded-2xl border bg-[#0a181b] shadow-lg">
            <canvas ref={canvasRef} className="block h-auto w-full" />
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Prévia em tempo real · a foto fica só no seu navegador
          </p>
        </div>
      </div>
    </div>
  );
}
