export type Availability = "IN_STOCK" | "OUT_OF_STOCK" | "UNKNOWN";

export type ExtractSource = "json-ld" | "opengraph" | "html" | "none";

export type ExtractedOffer = {
  name: string | null;
  price: number | null;
  currency: string | null;
  image: string | null;
  availability: Availability;
  brand: string | null;
  gtin: string | null;
  source: ExtractSource;
};

export type PartialOffer = Omit<ExtractedOffer, "source">;
