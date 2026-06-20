import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Define (ou atualiza) a senha de login de um usuário, com hash bcrypt.
// As credenciais vêm de variáveis de ambiente — nunca ficam no código.
//   ADMIN_EMAIL=voce@email.com ADMIN_PASSWORD='senha' npm run set-password
try {
  process.loadEnvFile(".env");
} catch {
  // .env ausente — variáveis já no ambiente
}

const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD ?? "";

if (!email || !password) {
  console.error(
    "Uso: ADMIN_EMAIL=voce@email.com ADMIN_PASSWORD='senha' npm run set-password",
  );
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    // Admin é decidido por e-mail (ADMIN_EMAILS), não pelo papel; cria como CLIENTE.
    create: { email, passwordHash, role: "CLIENTE" },
  });
  console.log(`Senha definida para ${user.email} (role ${user.role}).`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
