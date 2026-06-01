# Estrutura de dados — Pesquisa de fornecedores (filamentos e resinas 3D, Brasil)

Contrato para o output do agente de pesquisa. O objetivo é mapear **fornecedores**
(fábricas, revendas e lojas) e, de quebra, classificar **como cada um pode ser
importado** (feed / scraping / manual). Eu cuido do mapeamento pro banco
(`Seller`/`Brand`/`Source`), do geocoding dos CEPs e da detecção técnica que
faltar — o agente só precisa entregar neste formato.

## Formato de saída

Um JSON: `{ "suppliers": Fornecedor[] }`. Se a lista for grande, **NDJSON**
(um objeto `Fornecedor` por linha) também serve.

## Contrato (TypeScript)

```ts
type UF =
  | "AC"|"AL"|"AP"|"AM"|"BA"|"CE"|"DF"|"ES"|"GO"|"MA"|"MT"|"MS"|"MG"
  | "PA"|"PB"|"PR"|"PE"|"PI"|"RJ"|"RN"|"RS"|"RO"|"RR"|"SC"|"SP"|"SE"|"TO";

interface Fornecedor {
  // ── Identidade (OBRIGATÓRIO) ──
  name: string;                 // nome comercial. Ex.: "3D Lab"
  website: string;              // "https://dominio.com.br" (com https, sem barra final)
  type: "FABRICANTE" | "REVENDA" | "MARKETPLACE" | "DESCONHECIDO";
  is_active: boolean;           // ainda opera? (false se fechou)

  // ── Identidade (opcional) ──
  legal_name?: string | null;   // razão social
  cnpj?: string | null;         // SÓ se achar em fonte oficial; senão null
  logo_url?: string | null;
  description?: string | null;  // 1–2 frases

  // ── Catálogo ──
  sells_filament: boolean;
  sells_resin: boolean;
  has_own_brand: boolean;       // tem marca própria de filamento/resina?
  brands?: string[];            // marcas vendidas (própria + terceiros)
  materials?: string[];         // ["PLA","ABS","PETG","TPU","ASA","PCTG","NYLON","PC","HIPS","Resina Standard","Resina Tough","Resina Wash"]
  diameters_mm?: number[];      // [1.75, 2.85]

  // ── Localização (pra mapa "perto de você" e frete) ──
  hq?: { city?: string|null; uf?: UF|null; cep?: string|null } | null;
  physical_stores?: Array<{     // lojas físicas (retirada na loja)
    city?: string|null; uf?: UF|null; cep?: string|null;
    address?: string|null; pickup?: boolean;
  }>;
  ships_nationwide?: boolean | null;

  // ── Como importar (estratégia) — preencha o que conseguir; resto = null ──
  ingestion?: {
    google_merchant_feed_url?: string | null;   // URL do feed XML, se pública
    affiliate_network?: "Awin"|"Lomadee"|"Admitad"|"Rakuten"|"Próprio"|null;
    affiliate_program_url?: string | null;
    sitemap_url?: string | null;
    cloudflare_protected?: boolean | null;       // site dá "Just a moment"? (se detectar)
    robots_allows_product_pages?: boolean | null;// checou /robots.txt?
    marketplaces?: Array<{
      platform: "Mercado Livre"|"Shopee"|"Amazon"|"Magalu"|string;
      store_url?: string | null;
    }>;
  } | null;

  // ── Contato (pra parceria/feed) ──
  contact?: {
    email?: string|null; phone?: string|null; whatsapp?: string|null;
    instagram?: string|null; contact_page?: string|null;
  } | null;

  // ── Meta (confiabilidade) ──
  source_urls: string[];        // de onde vieram os dados (≥ 1 URL)
  confidence: "high" | "medium" | "low";
  notes?: string | null;        // ex.: "Cloudflare — importar por feed, não scraping"
}
```

## Exemplo preenchido

```json
{
  "suppliers": [
    {
      "name": "3D Lab",
      "website": "https://3dlab.com.br",
      "type": "FABRICANTE",
      "is_active": true,
      "legal_name": null,
      "cnpj": null,
      "logo_url": null,
      "description": "Fabricante de filamentos com fábrica em Betim/MG (ISO 9001). Também revende Creality e Bambu Lab.",
      "sells_filament": true,
      "sells_resin": false,
      "has_own_brand": true,
      "brands": ["3D Lab", "Creality", "Bambu Lab"],
      "materials": ["PLA", "ABS Premium", "PETG", "TPU/Flex", "ASA", "HIPS", "Wood"],
      "diameters_mm": [1.75, 2.85],
      "hq": { "city": "Betim", "uf": "MG", "cep": null },
      "physical_stores": [],
      "ships_nationwide": true,
      "ingestion": {
        "google_merchant_feed_url": null,
        "affiliate_network": null,
        "affiliate_program_url": null,
        "sitemap_url": null,
        "cloudflare_protected": true,
        "robots_allows_product_pages": true,
        "marketplaces": [{ "platform": "Mercado Livre", "store_url": null }]
      },
      "contact": {
        "email": null, "phone": null, "whatsapp": null,
        "instagram": "@3dlab.fila", "contact_page": "https://3dlab.com.br/contato/"
      },
      "source_urls": ["https://3dlab.com.br/", "https://3dlab.com.br/tipos-de-filamentos-para-impressoras-3d/"],
      "confidence": "high",
      "notes": "Site protegido por Cloudflare — importar via feed/parceria, não por scraping."
    },
    {
      "name": "3D Fila",
      "website": "https://3dfila.com.br",
      "type": "FABRICANTE",
      "is_active": true,
      "sells_filament": true,
      "sells_resin": true,
      "has_own_brand": true,
      "brands": ["3D Fila"],
      "materials": ["PLA", "ABS", "PETG", "ASA", "Resina Wash"],
      "diameters_mm": [1.75],
      "hq": { "city": "Tatuí", "uf": "SP", "cep": null },
      "physical_stores": [],
      "ships_nationwide": true,
      "ingestion": {
        "google_merchant_feed_url": null,
        "affiliate_network": null,
        "sitemap_url": "https://3dfila.com.br/sitemap_index.xml",
        "cloudflare_protected": false,
        "robots_allows_product_pages": true,
        "marketplaces": []
      },
      "contact": { "instagram": "@3dfila" },
      "source_urls": ["https://3dfila.com.br/"],
      "confidence": "medium",
      "notes": "Site aberto com JSON-LD — importável por scraping automático."
    }
  ]
}
```

## Regras pro agente (importantes pra qualidade)

1. **Uma entrada por fornecedor** — deduplique por **domínio** (`website`). Nada de
   uma entrada por página/produto.
2. **Não invente.** Campo desconhecido = `null` (ou omitido). **Nunca** chute CNPJ,
   CEP, coordenadas, preço ou marca.
3. **Cite tudo** em `source_urls` (páginas "sobre/contato", marketplace, etc.).
4. **Normalize:** `uf` em 2 letras maiúsculas; `website` com `https://` e **sem**
   barra final; telefones em `+55...`.
5. **Escopo:** lojas/fábricas/revendas **brasileiras** que vendem **filamento e/ou
   resina** pra impressão 3D. Priorize quem tem **site próprio** (fábricas como 3D Lab,
   Voolt, PrintaLot, National3D, Cliever, GTMax…; lojas maker; revendas). Marketplaces
   puros (Mercado Livre/Shopee) entram só como `type: "MARKETPLACE"` se relevante.
6. **Sinais de importabilidade** (campo `ingestion`): se conseguir, cheque o
   `/robots.txt` e se o site retorna **"Just a moment" (Cloudflare)**. Isso me diz se
   vou por **feed** (Cloudflare/sem JSON-LD) ou **scraping** (site aberto). Se não
   conseguir checar, deixe `null` que eu detecto.
7. **`materials`/`brands`**: escreva como aparece no site; eu normalizo pros enums do
   banco depois.

## O que EU faço com esse JSON

- Crio/atualizo cada `Seller` (com `type`, cidade/UF, retirada) e geocodifico os CEPs
  pro mapa "perto de você".
- Crio as `Brand`s e ligo aos produtos.
- Pra quem tiver `google_merchant_feed_url`/datafeed → crio uma `Source` (FEED) e
  importo o catálogo inteiro.
- Pra site aberto (sem Cloudflare, com JSON-LD) → agendo **scraping** automático.
- Pra Cloudflare sem feed → fica como **lead de parceria** (te aviso pra contatar).
