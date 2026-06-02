import { type Material, type ProductKind } from "@prisma/client";

import { prisma } from "@/lib/db";
import type { ExtractedOffer } from "@/lib/scrape/types";
import { uniqueBrandSlug, uniqueProductSlug } from "@/lib/slug";

const FILAMENT_PATTERNS: [RegExp, Material][] = [
  [/\bpctg\b/i, "PCTG"],
  [/\bpetg\b/i, "PETG"],
  [/\bpla\b/i, "PLA"],
  [/\babs\b/i, "ABS"],
  [/\basa\b/i, "ASA"],
  [/\b(tpu|flex[ií]vel)\b/i, "TPU"],
  [/\bnylon\b/i, "NYLON"],
];

const RESIN_PATTERNS: [RegExp, Material][] = [
  [/lav[áa]vel|wash/i, "RESIN_WATER_WASHABLE"],
  [/tough|tenaz|resistente|r[íi]gida|abs\s*-?\s*like/i, "RESIN_TOUGH"],
  [/\bresin/i, "RESIN_STANDARD"],
];

// Cores: detecta PT/EN e termos de resina (clear, incolor, cristal, skin…) e
// guarda o rótulo canônico em português.
const COLOR_MAP: [RegExp, string][] = [
  [/\b(transparente|incolor|clear|cristal|cristalina|transl[úu]cid[oa])\b/i, "Transparente"],
  [/\b(preto|preta|black)\b/i, "Preto"],
  [/\b(branco|branca|white)\b/i, "Branco"],
  [/\b(cinza|gray|grey|chumbo)\b/i, "Cinza"],
  [/\b(verde|green)\b/i, "Verde"],
  [/\b(azul|blue)\b/i, "Azul"],
  [/\b(vermelh[oa]|red)\b/i, "Vermelho"],
  [/\b(amarelo|yellow)\b/i, "Amarelo"],
  [/\b(laranja|orange)\b/i, "Laranja"],
  [/\b(ros[ae]|pink)\b/i, "Rosa"],
  [/\b(roxo|lil[áa]s|purple|violeta)\b/i, "Roxo"],
  [/\b(creme|bege|marfim|skin|pele|caqui)\b/i, "Bege"],
  [/\b(dourado|ouro|gold)\b/i, "Dourado"],
  [/\b(prata|prateado|silver)\b/i, "Prata"],
  [/\b(marrom|brown)\b/i, "Marrom"],
  [/\b(natural)\b/i, "Natural"],
];

// Equipamentos que NÃO são insumo (impressora, scanner, secadora, wash&cure…).
// "para impressora 3d" é insumo PARA a máquina, então não conta como máquina.
const MACHINE_RE =
  /\b(?:impressora|printer|scanner|secadora|estufa|desumidificad|wash\s*(?:and|&|n)?\s*cure|c[âa]mara\s+de\s+cura|m[áa]quina)/i;

function looksLikeMachine(name: string): boolean {
  if (/\b(para|p\/)\s*impressora/i.test(name)) {
    return /\b(?:scanner|secadora|estufa|desumidificad|wash\s*(?:and|&|n)?\s*cure|c[âa]mara\s+de\s+cura)/i.test(
      name,
    );
  }
  return MACHINE_RE.test(name);
}

type Inferred = {
  kind: ProductKind;
  material: Material;
  color: string;
  netWeightG: number;
  diameterMm: number | null;
};

/** Tecnologia da impressora a partir do nome (Resina vs FDM). */
export function detectPrinterTech(name: string): string {
  return /resina|resin|\blcd\b|\bdlp\b|\bsla\b|mslcd|\bmono\b/i.test(name)
    ? "Resina"
    : "FDM";
}

// Acessórios/peças que citam "impressora" mas NÃO são a impressora.
const PRINTER_ACCESSORY_RE =
  /\b(bico|hotend|hot\s?end|nozzle|display|mesa|placa|chapa|fonte|sensor|correia|rolamento|polia|ventoinha|cooler|esp[áa]tula|fim de curso|end\s?stop|acoplamento|engrenagem|cabo|adaptador|suporte)\b/i;

// Fabricantes 3D conhecidos — p/ acertar a marca pelo nome (ex.: "Bambu Lab").
const KNOWN_3D_BRANDS = [
  "Bambu Lab", "Creality", "Elegoo", "Anycubic", "Prusa", "Flashforge",
  "FLSUN", "Snapmaker", "Sovol", "Sermoon", "Artillery", "Kywoo", "Qidi",
  "Two Trees", "Raise3D", "Phrozen", "Sethi3D", "GTMax", "Cliever",
  "eSun", "Sunlu", "Polymaker", "Eryone", "Voolt",
];
function brandFromKnown(name: string): string | null {
  for (const b of KNOWN_3D_BRANDS) {
    const esc = b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`\\b${esc}\\b`, "i").test(name)) return b;
  }
  return null;
}

/** Infere material, cor, peso/volume e diâmetro a partir do nome do produto. */
export function inferProductFields(name: string): Inferred {
  // Impressora 3D é um TIPO de produto (não insumo, não acessório, não máquina).
  const isPrinter =
    /\bimpressora|\bprinter/i.test(name) &&
    !/\b(para|p\/)\s*impressora/i.test(name) &&
    !PRINTER_ACCESSORY_RE.test(name);
  if (isPrinter) {
    return {
      kind: "PRINTER",
      material: "OUTRO",
      color: "Variado",
      netWeightG: 0,
      diameterMm: null,
    };
  }
  // Outros equipamentos (scanner, secadora, wash&cure…) não entram no catálogo.
  if (looksLikeMachine(name)) {
    return {
      kind: "FILAMENT",
      material: "OUTRO",
      color: "Variado",
      netWeightG: 1000,
      diameterMm: null,
    };
  }

  const isResin = /\bresin/i.test(name);
  let material: Material = "OUTRO";
  for (const [re, m] of isResin ? RESIN_PATTERNS : FILAMENT_PATTERNS) {
    if (re.test(name)) {
      material = m;
      break;
    }
  }

  const colorEntry = COLOR_MAP.find(([re]) => re.test(name));
  const colorCap = colorEntry ? colorEntry[1] : "Variado";

  // Peso (filamento, kg/g) ou volume (resina, ml/L) — guardado em netWeightG.
  let netWeightG = 1000;
  const kg = name.match(/(\d+(?:[.,]\d+)?)\s*kg\b/i);
  const ml = name.match(/(\d+)\s*ml\b/i);
  const g = name.match(/(\d+)\s*g\b/i);
  const l = name.match(/(\d+(?:[.,]\d+)?)\s*l(?:itros?)?\b/i);
  if (kg) netWeightG = Math.round(Number(kg[1].replace(",", ".")) * 1000);
  else if (ml) netWeightG = Number(ml[1]);
  else if (g) netWeightG = Number(g[1]);
  else if (l) netWeightG = Math.round(Number(l[1].replace(",", ".")) * 1000);

  const d = name.match(/(1[.,]75|2[.,]85|3[.,]0{1,2})\s*mm/i);
  const diameterMm = isResin ? null : d ? Number(d[1].replace(",", ".")) : 1.75;

  return {
    kind: isResin ? "RESIN" : "FILAMENT",
    material,
    color: colorCap,
    netWeightG,
    diameterMm,
  };
}

const SPEC_RE = /\d+\s*(mm|kg|g|ml|cm|l)\b/i;

/** Tenta extrair a marca do sufixo do nome ("… - 3D Fila"). */
function brandFromName(raw: string): string | null {
  const m = raw.match(/[-–|]\s*([^-–|]+?)\s*$/);
  const cand = m?.[1]?.trim();
  if (!cand || SPEC_RE.test(cand) || cand.length > 30) return null;
  // Não confunda cor com marca (ex.: "Resina … - Branco").
  if (COLOR_MAP.some(([re]) => re.test(cand))) return null;
  // Voltagem não é marca (ex.: "… - 220V").
  if (/^\d+\s*v(olts?)?$/i.test(cand)) return null;
  return cand;
}

function stripSuffix(name: string, suffix: string | null): string {
  if (!suffix) return name;
  const esc = suffix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return name.replace(new RegExp(`\\s*[-–|]\\s*${esc}\\s*$`, "i"), "");
}

/** Remove sufixos de marketing/marca/loja do nome. */
function cleanName(
  raw: string,
  sellerName: string | null,
  brand: string | null,
): string {
  let n = raw.replace(/\s*para impressora 3d\s*/i, " ");
  n = stripSuffix(n, brand);
  n = stripSuffix(n, sellerName);
  // Remove sufixo de voltagem (impressoras) p/ consolidar 110V/220V/Bivolt
  // no mesmo produto — senão o re-scrape recria a variante a cada execução.
  n = n.replace(/\s*[-–]\s*(110\s*v|220\s*v|bivolt)\s*$/i, "");
  return n.replace(/\s{2,}/g, " ").trim();
}

/** Normaliza o nome da marca, removendo sufixos genéricos ("para impressora 3d"). */
function normalizeBrand(raw: string): string {
  const n = raw
    .replace(/\s*para impressora(s)?\s*3d\s*/i, " ")
    .replace(/\s*impressora(s)?\s*3d\s*/i, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
  return n || raw.trim();
}

/**
 * Deriva os campos canônicos (nome limpo + marca normalizada) a partir do nome
 * bruto, da marca extraída e da loja. É a MESMA derivação usada na criação do
 * produto — por isso precisa ser usada também no casamento, senão o re-scrape
 * (que vem com o nome bruto e, às vezes, sem marca) não bate com o produto já
 * salvo e o ingest duplica o produto a cada execução.
 */
export function deriveCanonical(
  rawName: string,
  extractedBrand: string | null,
  sellerName: string | null,
): { name: string; brandName: string } {
  const brandName = normalizeBrand(
    extractedBrand ??
      brandFromKnown(rawName) ??
      brandFromName(rawName) ??
      sellerName ??
      "Sem marca",
  );
  const name = cleanName(rawName, sellerName, brandName) || rawName;
  return { name, brandName };
}

async function resolveBrandId(name: string): Promise<string> {
  const existing = await prisma.brand.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
    select: { id: true },
  });
  if (existing) return existing.id;
  const created = await prisma.brand.create({
    data: { name, slug: await uniqueBrandSlug(name) },
    select: { id: true },
  });
  return created.id;
}

/**
 * Cria um produto no catálogo a partir de uma oferta extraída (link),
 * inferindo os campos do nome e usando a imagem do scrape.
 */
export async function createProductFromExtracted(
  extracted: ExtractedOffer,
  sellerName: string | null,
): Promise<{ id: string; name: string }> {
  const rawName = extracted.name ?? "Produto importado";
  const { name, brandName } = deriveCanonical(
    rawName,
    extracted.brand ?? null,
    sellerName,
  );
  const fields = inferProductFields(rawName);
  // Impressora começa só com a tecnologia; demais specs entram por importação.
  const specs =
    fields.kind === "PRINTER"
      ? { tecnologia: detectPrinterTech(rawName) }
      : undefined;
  const brandId = await resolveBrandId(brandName);

  const product = await prisma.product.create({
    data: {
      name,
      slug: await uniqueProductSlug(name),
      kind: fields.kind,
      material: fields.material,
      color: fields.color,
      netWeightG: fields.netWeightG,
      diameterMm: fields.diameterMm,
      brandId,
      gtin: extracted.gtin,
      imageUrl: extracted.image, // puxa a foto do produto
      ...(specs ? { specs } : {}),
    },
    select: { id: true, name: true },
  });
  return product;
}
