import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Nodemailer from "next-auth/providers/nodemailer";

import { isAdminEmail } from "@/lib/admin-emails";
import { prisma } from "@/lib/db";
import { emailFrom, emailLayout, mailerConfigured, sendMail } from "@/lib/mailer";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // JWT é necessário para o provider de credenciais (senha) conviver com o
  // magic link. O adapter continua sendo usado para usuários/verificação.
  session: { strategy: "jwt" },
  trustHost: true,
  pages: { signIn: "/entrar" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
    Nodemailer({
      from: emailFrom(),
      // O provider exige `server`; o envio real acontece em sendVerificationRequest
      // (via @/lib/mailer), então este valor é apenas um placeholder.
      server: process.env.EMAIL_SERVER || "smtp://localhost:587",
      async sendVerificationRequest({ identifier, url }) {
        // Sem SMTP (dev): imprime o link no console para login.
        if (!mailerConfigured()) {
          console.log(`\n[auth] Link de acesso para ${identifier}:\n${url}\n`);
          return;
        }
        await sendMail({
          to: identifier,
          subject: "Seu link de acesso — Melhor Filamento",
          html: emailLayout({
            heading: "Entrar no Melhor Filamento",
            intro:
              "Use o botão abaixo para acessar sua conta. O link expira em alguns minutos e só pode ser usado uma vez.",
            ctaLabel: "Acessar minha conta",
            ctaUrl: url,
            footnote:
              "Se você não solicitou este e-mail, ignore-o com segurança.",
          }),
        });
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.isAdmin = isAdminEmail(session.user.email);
        // Papel buscado fresco do banco → promoção pelo admin vale na hora.
        const u = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true },
        });
        session.user.role = u?.role ?? "CLIENTE";
      }
      return session;
    },
  },
});
