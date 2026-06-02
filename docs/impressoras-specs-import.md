# Specs de impressora — formato de importação

As impressoras são cadastradas automaticamente pelo scraping (nome, marca, preço,
foto). As **especificações técnicas** entram por importação — cole o JSON em
**/admin/fornecedores**. Casa por **slug** (preferido) ou pelo **nome exato** da
impressora (kind=PRINTER). Os campos enviados são **mesclados** (não apaga o que
já existe).

## Formato

```json
{
  "printers": [
    {
      "name": "Impressora 3D Creality Ender 3 V3",
      "slug": "impressora-3d-creality-ender-3-v3",
      "tecnologia": "FDM",
      "volume": "220 × 220 × 250 mm",
      "resolucao": "0,1–0,4 mm",
      "velocidade": "600 mm/s",
      "bico": "300 °C",
      "mesa": "100 °C",
      "nivelamento": "Automático (CR Touch)",
      "conectividade": "Wi-Fi, USB-C",
      "tela": "Touch 4,3\"",
      "dimensoes": "433 × 366 × 490 mm",
      "peso": "7,8 kg"
    }
  ]
}
```

## Campos (todos opcionais; mande os que tiver)
- **name** ou **slug** (um dos dois, p/ casar). O **slug** está na URL da página
  da impressora (`/produto/<slug>`); o **name** deve ser idêntico ao do catálogo.
- **tecnologia** (FDM / Resina), **volume** (volume de impressão), **resolucao**,
  **velocidade** (máx.), **bico** (temp. máx.), **mesa** (temp. máx.),
  **nivelamento**, **conectividade**, **tela**, **dimensoes**, **peso**.

## Regras
1. **Não invente** specs. Se não tiver certeza, **omita** o campo (vira "—" no site).
2. Use as **unidades** (mm, °C, mm/s, kg) e vírgula decimal (PT-BR).
3. Mande o JSON com a chave **`printers`** (uma entrada por impressora).
