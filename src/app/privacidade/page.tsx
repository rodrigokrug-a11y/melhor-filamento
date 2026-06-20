import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { PageBanner } from "@/components/banners";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Como o Melhor Filamento coleta, usa e protege seus dados pessoais, conforme a LGPD.",
  alternates: { canonical: "/privacidade" },
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

export default function PrivacidadePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageBanner placement="GLOBAL" />
      <PageHeader
        icon={ShieldCheck}
        eyebrow="Privacidade"
        title="Política de Privacidade"
        subtitle={`Como tratamos seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018). Última atualização: ${UPDATED}.`}
      />

      <Section title="1. Quem é o controlador">
        <p>
          O Melhor Filamento é um comparador de preços de filamentos e resinas
          para impressão 3D no Brasil. Somos o controlador dos dados tratados
          neste site. Para qualquer assunto sobre privacidade, fale com a gente
          em{" "}
          <a href={`mailto:${CONTACT}`} className="text-brand underline">
            {CONTACT}
          </a>
          .
        </p>
      </Section>

      <Section title="2. Quais dados coletamos">
        <p>
          <strong>Dados que você fornece:</strong> nome e e-mail (ao deixar um
          contato/lead, criar conta ou cadastrar uma oferta), CEP (para estimar
          frete e mostrar lojas próximas) e o conteúdo que você publica
          (avaliações e dicas).
        </p>
        <p>
          <strong>Dados coletados automaticamente:</strong> um identificador de
          sessão, cliques em ofertas, página de origem (referrer), tipo de
          navegador (user agent) e a região derivada do seu CEP.
        </p>
        <p>
          <strong>Cookies:</strong> <code>mf_region</code> (sua região),{" "}
          <code>mf_session</code> (sessão para atribuir cliques),{" "}
          <code>mf_lead</code> (evita pedir seus dados de novo),{" "}
          <code>mf_consent</code> (registro do consentimento) e cookies de
          autenticação quando você faz login.
        </p>
      </Section>

      <Section title="3. Para que usamos seus dados">
        <ul className="list-disc space-y-1 pl-5">
          <li>Comparar preços e estimar o frete para o seu CEP;</li>
          <li>Mostrar lojas com retirada/estoque mais perto de você;</li>
          <li>
            Intermediar o contato com a loja anunciante quando você solicita uma
            oferta (geração de lead);
          </li>
          <li>Moderar e exibir avaliações e dicas da comunidade;</li>
          <li>Medir o uso do site e melhorar a experiência;</li>
          <li>Segurança, prevenção a fraudes e cumprimento legal.</li>
        </ul>
      </Section>

      <Section title="4. Base legal (LGPD, art. 7º)">
        <p>
          Tratamos dados com base no seu <strong>consentimento</strong>, na{" "}
          <strong>execução de procedimentos preliminares e contratuais</strong>{" "}
          (ex.: encaminhar seu lead à loja) e no{" "}
          <strong>legítimo interesse</strong> de operar e melhorar o serviço,
          sempre respeitando seus direitos.
        </p>
      </Section>

      <Section title="5. Compartilhamento">
        <p>
          Quando você pede para ver/entrar em contato sobre uma oferta, seu nome
          e e-mail podem ser enviados à loja anunciante para que ela responda.
          Também usamos provedores que nos ajudam a operar (hospedagem, envio de
          e-mail e geocodificação via ViaCEP e OpenStreetMap/Nominatim) e o{" "}
          <strong>Google (Google Analytics e Google Ads)</strong> para medir o
          uso do site, atribuir conversões e exibir anúncios (incluindo
          remarketing). Esses recursos de medição e publicidade só são ativados{" "}
          <strong>após o seu consentimento</strong> (Consent Mode).{" "}
          <strong>Nós não vendemos seus dados pessoais.</strong>
        </p>
      </Section>

      <Section title="6. Cookies e como controlá-los">
        <p>
          Usamos cookies <strong>essenciais</strong> (memória do seu CEP e do
          consentimento) e, <strong>somente após o seu consentimento</strong>,
          cookies de medição e publicidade do Google Analytics e Google Ads
          (como <code>_ga</code>). Você pode recusar pelo banner de cookies do
          site, bloquear/apagar cookies no navegador, instalar o{" "}
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand underline"
          >
            complemento de opt-out do Google Analytics
          </a>{" "}
          e gerenciar anúncios em{" "}
          <a
            href="https://myadcenter.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand underline"
          >
            myadcenter.google.com
          </a>
          . Bloquear cookies pode desativar recursos como a memória do seu CEP.
        </p>
      </Section>

      <Section title="7. Por quanto tempo guardamos">
        <p>
          Mantemos os dados pelo tempo necessário às finalidades acima ou para
          cumprir obrigações legais. Leads e registros de uso são mantidos
          enquanto úteis para a intermediação e a melhoria do serviço, e
          eliminados quando deixam de ser necessários ou mediante solicitação.
        </p>
      </Section>

      <Section title="8. Seus direitos (LGPD, art. 18)">
        <p>Você pode, a qualquer momento, solicitar:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>confirmação da existência de tratamento e acesso aos dados;</li>
          <li>correção de dados incompletos ou desatualizados;</li>
          <li>
            anonimização, bloqueio ou eliminação de dados desnecessários;
          </li>
          <li>portabilidade e informação sobre compartilhamento;</li>
          <li>revogação do consentimento.</li>
        </ul>
        <p>
          Para exercer seus direitos, escreva para{" "}
          <a href={`mailto:${CONTACT}`} className="text-brand underline">
            {CONTACT}
          </a>
          .
        </p>
      </Section>

      <Section title="9. Segurança">
        <p>
          Adotamos medidas técnicas e organizacionais para proteger seus dados:
          senhas são armazenadas apenas como hash (bcrypt), o tráfego é
          criptografado (HTTPS) e o acesso administrativo é restrito.
        </p>
      </Section>

      <Section title="10. Alterações desta política">
        <p>
          Podemos atualizar esta política para refletir mudanças no serviço ou
          na legislação. Avisaremos sobre alterações relevantes nesta página.
        </p>
      </Section>

      <p className="mt-10 text-sm text-muted-foreground">
        Veja também os nossos{" "}
        <Link href="/termos" className="text-brand underline">
          Termos de Uso
        </Link>
        .
      </p>
    </div>
  );
}
