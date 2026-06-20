import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";

import { PageBanner } from "@/components/banners";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description:
    "Regras de uso do Melhor Filamento — comparador de preços de filamentos e resinas 3D.",
  alternates: { canonical: "/termos" },
};

const UPDATED = "31 de maio de 2026";
const CONTACT = process.env.CONTACT_EMAIL ?? "contact@beadev.ai";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-lg font-semibold text-foreground">
        {title}
      </h2>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

export default function TermosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageBanner placement="GLOBAL" />
      <PageHeader
        icon={FileText}
        eyebrow="Termos"
        title="Termos de Uso"
        subtitle={`Ao usar o Melhor Filamento, você concorda com estas regras. Última atualização: ${UPDATED}.`}
      />

      <Section title="1. O que é o Melhor Filamento">
        <p>
          Somos um comparador de preços de filamentos e resinas para impressão
          3D. <strong>Não vendemos produtos</strong>: reunimos ofertas de lojas
          parceiras e ajudamos você a encontrar o melhor custo total (preço +
          frete) para a sua região.
        </p>
      </Section>

      <Section title="2. Preços, frete e disponibilidade">
        <p>
          Os preços, cupons, fretes e estoques são informados pelas lojas ou
          coletados de páginas públicas e têm caráter{" "}
          <strong>indicativo</strong>. Eles podem mudar a qualquer momento.
          Confirme sempre as condições finais no site da loja antes de comprar.
          Não garantimos a exatidão, o preço ou a disponibilidade de nenhuma
          oferta.
        </p>
      </Section>

      <Section title="3. Cadastro de ofertas e conteúdo da comunidade">
        <p>
          Usuários e lojas podem sugerir ofertas, avaliações e dicas. Todo
          conteúdo passa por <strong>moderação</strong> antes de ser publicado.
          Ao enviar algo, você declara que as informações são verdadeiras e que
          tem o direito de compartilhá-las, e nos concede licença para exibi-las
          no site. Podemos editar ou remover conteúdo que viole estes termos.
        </p>
      </Section>

      <Section title="4. Links e lojas de terceiros">
        <p>
          Ao clicar em uma oferta, você é direcionado ao site da loja. Não
          controlamos esses sites e a compra é uma relação direta entre você e a
          loja. Podemos receber comissão por indicações (afiliados), o que não
          altera o preço pago por você nem a ordem do nosso ranking, baseado em
          custo.
        </p>
      </Section>

      <Section title="5. Conta e segurança">
        <p>
          Você é responsável por manter a confidencialidade das suas credenciais
          e por toda atividade na sua conta. Avise-nos sobre qualquer uso não
          autorizado.
        </p>
      </Section>

      <Section title="6. Conduta proibida">
        <ul className="list-disc space-y-1 pl-5">
          <li>Publicar informações falsas, enganosas ou spam;</li>
          <li>Coletar dados do site de forma abusiva ou automatizada;</li>
          <li>Tentar burlar a moderação ou comprometer a segurança;</li>
          <li>Violar direitos de terceiros ou a legislação aplicável.</li>
        </ul>
      </Section>

      <Section title="7. Limitação de responsabilidade">
        <p>
          O serviço é fornecido “no estado em que se encontra”. Não nos
          responsabilizamos por decisões de compra, por divergências de preço ou
          estoque, nem por prejuízos decorrentes do uso das informações. Use o
          site por sua conta e risco.
        </p>
      </Section>

      <Section title="8. Alterações dos termos">
        <p>
          Podemos atualizar estes termos a qualquer momento. O uso continuado do
          site após mudanças significa concordância com a versão vigente.
        </p>
      </Section>

      <Section title="9. Lei aplicável e contato">
        <p>
          Estes termos são regidos pelas leis do Brasil. Dúvidas? Escreva para{" "}
          <a href={`mailto:${CONTACT}`} className="text-brand underline">
            {CONTACT}
          </a>
          .
        </p>
      </Section>

      <p className="mt-10 text-sm text-muted-foreground">
        Veja também a nossa{" "}
        <Link href="/privacidade" className="text-brand underline">
          Política de Privacidade
        </Link>
        .
      </p>
    </div>
  );
}
