/**
 * Reclassifica a marca dos produtos já salvos (versão de linha de comando).
 *
 * A lógica mora em src/lib/ingest/rebrand.ts, compartilhada com a rota
 * /api/rebrand — é ela que roda em produção, onde a imagem não tem scripts/
 * nem tsx. Este script serve para rodar contra um banco local.
 *
 * Uso:
 *   npx tsx scripts/rebrand.ts           # só relatório, não escreve nada
 *   npx tsx scripts/rebrand.ts --apply   # aplica as trocas listadas
 */

import { prisma } from "@/lib/db";
import { applyRebrand, groupChanges, planRebrand } from "@/lib/ingest/rebrand";

async function main() {
  const apply = process.argv.includes("--apply");

  const plan = await planRebrand();
  console.log(`Marcas conhecidas: ${plan.knownBrands}`);
  console.log(`Produtos: ${plan.products}`);

  if (plan.changes.length === 0) {
    console.log("\nNada a mudar.");
    return;
  }

  console.log(`\n=== ${plan.changes.length} produto(s) mudariam de marca ===`);
  for (const g of groupChanges(plan.changes)) {
    console.log(`\n${g.from} → ${g.to}  (${g.count})`);
    for (const nome of g.sample) console.log(`   · ${nome}`);
    if (g.count > g.sample.length) {
      console.log(`   … mais ${g.count - g.sample.length}`);
    }
  }

  if (!apply) {
    console.log("\nNada foi escrito. Rode com --apply para aplicar.");
    return;
  }

  const { applied, skipped } = await applyRebrand(plan.changes);
  console.log(`\nAplicado: ${applied} produto(s).`);
  if (skipped) console.log(`Pulados por marca não cadastrada: ${skipped}.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
