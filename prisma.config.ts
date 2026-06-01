import { defineConfig } from "prisma/config";

// Prisma 7 não carrega .env automaticamente — carregamos aqui para Migrate/CLI.
try {
  process.loadEnvFile(".env");
} catch {
  // .env ausente (ex.: produção, onde as variáveis já vêm do ambiente)
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
