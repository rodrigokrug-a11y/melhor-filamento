// Tipos e helpers do catálogo seguros para o cliente (sem Prisma/Postgres).
// As funções de acesso a dados ficam em src/lib/catalog.ts (somente servidor).
import { type CouponType } from "@/lib/pricing";
import { type ShippingRuleLite } from "@/lib/shipping";

export type ProductKind = "FILAMENT" | "RESIN" | "PRINTER";

export const KIND_LABELS: Record<string, string> = {
  FILAMENT: "Filamento",
  RESIN: "Resina",
  PRINTER: "Impressora 3D",
};

/** Campos técnicos de impressora (na ordem de exibição). Guardados em `specs`;
 *  preenchidos por importação — "—" quando ausentes. */
export const PRINTER_SPEC_FIELDS: { key: string; label: string }[] = [
  { key: "tecnologia", label: "Tecnologia" },
  { key: "volume", label: "Volume de impressão" },
  { key: "resolucao", label: "Resolução" },
  { key: "velocidade", label: "Velocidade máx." },
  { key: "bico", label: "Temp. máx. do bico" },
  { key: "mesa", label: "Temp. máx. da mesa" },
  { key: "nivelamento", label: "Nivelamento" },
  { key: "conectividade", label: "Conectividade" },
  { key: "tela", label: "Tela" },
  { key: "dimensoes", label: "Dimensões" },
  { key: "peso", label: "Peso" },
];

export type CatalogSort = "preco-asc" | "preco-desc" | "preco-kg" | "nome";

export type CatalogFilters = {
  materials?: string[];
  marcas?: string[];
  cores?: string[];
  tech?: string;
  faixa?: string; // id da faixa de preço selecionada
  sort?: CatalogSort;
};

export const MATERIAL_LABELS: Record<string, string> = {
  PLA: "PLA",
  ABS: "ABS",
  PETG: "PETG",
  TPU: "TPU (flexível)",
  ASA: "ASA",
  PCTG: "PCTG",
  NYLON: "Nylon",
  RESIN_STANDARD: "Resina Standard",
  RESIN_TOUGH: "Resina Tough",
  RESIN_WATER_WASHABLE: "Resina Lavável em água",
  OUTRO: "Outro",
};

export function materialLabel(material: string): string {
  return MATERIAL_LABELS[material] ?? material;
}

export const FILAMENT_MATERIALS = [
  "PLA",
  "PETG",
  "ABS",
  "TPU",
  "ASA",
  "PCTG",
  "NYLON",
] as const;

export const MATERIAL_INFO: Record<
  string,
  { description: string; nozzle: string; bed: string }
> = {
  PLA: {
    description:
      "O mais fácil de imprimir: baixa temperatura e pouco empenamento. Ótimo para iniciantes e peças decorativas.",
    nozzle: "190–220 °C",
    bed: "50–60 °C",
  },
  PETG: {
    description:
      "Resistente e levemente flexível, com boa adesão entre camadas. Ótimo para peças funcionais.",
    nozzle: "230–250 °C",
    bed: "70–80 °C",
  },
  ABS: {
    description:
      "Resistente a calor e impacto, mas exige mesa quente e, de preferência, câmara fechada (empena e solta odor).",
    nozzle: "230–250 °C",
    bed: "90–110 °C",
  },
  TPU: {
    description:
      "Flexível (borracha). Imprima devagar e com retração baixa para evitar entupimentos.",
    nozzle: "210–230 °C",
    bed: "40–60 °C",
  },
  ASA: {
    description:
      "Parecido com o ABS, porém resistente a UV — ideal para peças que ficam ao ar livre.",
    nozzle: "240–260 °C",
    bed: "90–110 °C",
  },
  PCTG: {
    description:
      "Evolução do PETG: mais resistente e fácil de imprimir, com boa transparência.",
    nozzle: "240–260 °C",
    bed: "70–80 °C",
  },
  NYLON: {
    description:
      "Muito resistente e durável, porém higroscópico — precisa estar bem seco antes de imprimir.",
    nozzle: "240–270 °C",
    bed: "70–90 °C",
  },
};

export type FacetOption = {
  value: string;
  label: string;
  count: number;
  logoUrl?: string | null;
};

export type BrandSummary = {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  productCount: number;
  promotedActive: boolean;
  sortOrder: number; // ordem manual do admin (maior = primeiro)
};

/** Dados mínimos por oferta para o cliente calcular o total por região. */
export type OfferShippingLite = {
  effectivePrice: number;
  shippingRules: ShippingRuleLite[];
};

export type ProductListItem = {
  id: string;
  slug: string;
  name: string;
  kind: ProductKind;
  material: string;
  color: string;
  tech: string | null;
  netWeightG: number;
  diameterMm: number | null;
  imageUrl: string | null;
  brandName: string;
  brandSlug: string;
  offerCount: number;
  bestPrice: number;
  bestPriceHasCoupon: boolean;
  discountPct: number; // % de desconto da melhor oferta (0 = sem desconto)
  boost: number | null; // lance de destaque ativo (R$/mês); null = sem destaque
  sortOrder: number; // ordem manual do admin (maior = primeiro)
  offers: OfferShippingLite[];
};

export type PriceBand = {
  id: string;
  label: string;
  min: number;
  max: number | null;
  count: number;
};

export type CatalogResult = {
  products: ProductListItem[];
  materials: FacetOption[];
  brands: FacetOption[];
  colors: FacetOption[];
  techs: FacetOption[];
  priceBands: PriceBand[];
};

export type BrandProfile = {
  website: string | null;
  country: string | null;
  headquarters: string | null;
  summary: string | null;
  sells: string | null;
  about: string | null;
  foundedYear: number | null;
};

export type BrandPage = {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  promotedActive: boolean;
  profile: BrandProfile;
  products: ProductListItem[];
};

export type OfferView = {
  id: string;
  sellerName: string;
  sellerSlug: string;
  sellerType: string;
  sellerVerified: boolean;
  sellerLogoUrl: string | null;
  url: string;
  price: number;
  couponCode: string | null;
  couponType: CouponType | null;
  discount: number;
  effectivePrice: number;
  sponsoredActive: boolean;
  shippingRules: ShippingRuleLite[];
  submittedByName: string | null;
};

export type ProductDetail = {
  id: string;
  slug: string;
  name: string;
  kind: ProductKind;
  material: string;
  materialLabel: string;
  color: string;
  netWeightG: number;
  diameterMm: number | null;
  imageUrl: string | null;
  specs: Record<string, string> | null;
  brandName: string;
  brandSlug: string;
  offers: OfferView[];
  bestPrice: number | null;
};

/** Produto com todas as ofertas para o comparador dinâmico (/comparar). */
export type CompareProduct = {
  id: string;
  slug: string;
  name: string;
  kind: ProductKind;
  material: string;
  brandName: string;
  color: string;
  imageUrl: string | null;
  netWeightG: number;
  diameterMm: number | null;
  specs: Record<string, string> | null;
  offers: OfferView[];
};

/** Loja com localização, para o mapa "perto de você" (/perto). */
export type NearbyStore = {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  uf: string | null;
  latitude: number;
  longitude: number;
  offersPickup: boolean;
  isVerified: boolean;
  offerCount: number;
  cheapestPrice: number | null;
  cheapestProduct: { name: string; slug: string } | null;
};
