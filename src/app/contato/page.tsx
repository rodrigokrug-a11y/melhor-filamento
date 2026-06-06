import type { Metadata } from "next";
import { Mail } from "lucide-react";

import { ContactForm } from "@/components/contact-form";
import { PageHeader } from "@/components/page-header";

const contactEmail =
  process.env.CONTACT_EMAIL ?? "contact@beadev.ai";

const description =
  "Fale com a equipe do Melhor Filamento: dúvidas, sugestões, correções, anúncios ou parcerias. Envie sua mensagem e anexe imagem ou documento.";

export const metadata: Metadata = {
  title: "Entre em contato",
  description,
  alternates: { canonical: "/contato" },
  openGraph: { title: "Entre em contato", description, url: "/contato" },
};

export default function ContatoPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <PageHeader
        icon={Mail}
        eyebrow="Fale conosco"
        title="Entre em contato"
        subtitle="Dúvidas, sugestões, correções, anúncios ou parcerias? Mande sua mensagem — você pode anexar uma imagem ou documento. Respondemos no seu e-mail."
      />
      <ContactForm />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Prefere e-mail direto?{" "}
        <a
          href={`mailto:${contactEmail}`}
          className="font-medium text-teal hover:underline"
        >
          {contactEmail}
        </a>
      </p>
    </div>
  );
}
