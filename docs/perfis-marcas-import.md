# Perfis de marca — formato de importação

Cada marca (empresa) tem um **perfil** com o mesmo conjunto de campos. O coworker
preenche o JSON abaixo e a gente importa em **/admin/fornecedores** (cole o JSON).
A importação casa pelo **nome** da marca (igual ao que aparece no site) e atualiza
só os campos enviados.

## Formato do arquivo

```json
{
  "profiles": [
    {
      "name": "Anycubic",
      "summary": "Fabricante chinesa de impressoras 3D e insumos, conhecida pelo custo-benefício.",
      "about": "Desenvolve e vende impressoras 3D (FDM e resina), resinas, filamentos e acessórios, com forte presença no público maker e iniciante.",
      "sells": "Impressoras 3D, resinas, filamentos e acessórios",
      "headquarters": "Shenzhen",
      "country": "China",
      "website": "https://www.anycubic.com",
      "foundedYear": 2015
    }
  ]
}
```

## Campos (todos opcionais; mande os que tiver)
- **name** (obrigatório) — nome da marca, idêntico ao do site.
- **summary** — resumo curto, 1–2 frases (o "elevator pitch").
- **about** — o que a empresa faz (parágrafo).
- **sells** — o que ela vende (linha de produtos).
- **headquarters** — sede/endereço (cidade, estado).
- **country** — país de origem.
- **website** — site oficial (com https).
- **foundedYear** — ano de fundação (número, ex.: 2015).

## Regras
1. **Não invente** dados (ano, sede, faturamento). Se não tiver certeza, **omita** o campo.
2. `name` deve bater com a marca no sistema (ex.: "Bambu Lab", "3D Fila", "Creality").
3. Texto em **português do Brasil**, factual e direto. `summary` curtinho; `about` um parágrafo.
4. Mande o JSON com a chave **`profiles`** (uma entrada por marca).
