"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles } from "lucide-react";

import { formatBRL } from "@/lib/utils";

type Mat = "PLA" | "PETG" | "ABS" | "ASA" | "TPU" | "NYLON";

const QUESTIONS: {
  q: string;
  options: { label: string; s: Partial<Record<Mat, number>> }[];
}[] = [
  {
    q: "O que você vai imprimir?",
    options: [
      { label: "Decoração, protótipos, peças leves", s: { PLA: 3, PETG: 1 } },
      { label: "Peças funcionais que aguentam uso", s: { PETG: 3, ABS: 2, NYLON: 1 } },
      { label: "Algo flexível (capa, vedação, pé de apoio)", s: { TPU: 6 } },
      { label: "Uso externo (sol e chuva)", s: { ASA: 4, PETG: 2 } },
      { label: "Peça mecânica / engrenagem", s: { NYLON: 3, ABS: 2, PETG: 1 } },
    ],
  },
  {
    q: "Vai pegar calor? (ex.: dentro do carro, perto de motor)",
    options: [
      { label: "Sim, precisa aguentar calor", s: { ABS: 3, ASA: 3, PETG: 1, PLA: -3 } },
      { label: "Não / tanto faz", s: { PLA: 1 } },
    ],
  },
  {
    q: "Sua impressora é fechada (tem caixa/enclosure)?",
    options: [
      { label: "Sim, é fechada", s: { ABS: 2, ASA: 2 } },
      { label: "Não / não sei", s: { ABS: -3, ASA: -3, PLA: 2, PETG: 2 } },
    ],
  },
  {
    q: "Qual a sua prioridade?",
    options: [
      { label: "Facilidade de imprimir", s: { PLA: 3, PETG: 1 } },
      { label: "Resistência e durabilidade", s: { PETG: 2, ABS: 1, NYLON: 2 } },
      { label: "Menor custo", s: { PLA: 2 } },
      { label: "Acabamento bonito", s: { PLA: 1, PETG: 1 } },
    ],
  },
];

const REASONS: Record<Mat, string> = {
  PLA: "Fácil de imprimir, barato e com ótimo acabamento — perfeito pra decoração, protótipos e quem está começando. Só evite calor.",
  PETG: "Equilíbrio entre facilidade e resistência: aguenta uso, umidade e um pouco de calor. Ótimo pra peças funcionais.",
  ABS: "Resistente a impacto e calor, mas pede impressora fechada e boa ventilação. Clássico pra peças de engenharia.",
  ASA: "Como o ABS, porém resistente ao sol e ao tempo — ideal pra uso externo. Também pede caixa fechada.",
  TPU: "Flexível e emborrachado: capas, vedações, pés e peças que precisam dobrar sem quebrar.",
  NYLON: "Muito resistente e com baixo atrito — engrenagens e peças mecânicas. Mais difícil e absorve umidade.",
};

// Ordem de desempate (preferência por materiais mais comuns/fáceis).
const ORDER: Mat[] = ["PLA", "PETG", "ASA", "ABS", "NYLON", "TPU"];

export type CheapestMap = Record<
  string,
  { name: string; slug: string; price: number; brand: string }
>;

export function FilamentQuiz({ cheapest }: { cheapest: CheapestMap }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const done = step >= QUESTIONS.length;

  function pick(optIdx: number) {
    const next = [...answers.slice(0, step), optIdx];
    setAnswers(next);
    setStep(step + 1);
  }
  function back() {
    if (step > 0) setStep(step - 1);
  }
  function restart() {
    setStep(0);
    setAnswers([]);
  }

  if (!done) {
    const Q = QUESTIONS[step];
    return (
      <div className="rounded-2xl border bg-card p-5 sm:p-6">
        <div className="mb-1 flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>
            Pergunta {step + 1} de {QUESTIONS.length}
          </span>
          {step > 0 ? (
            <button
              type="button"
              onClick={back}
              className="inline-flex items-center gap-1 hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              Voltar
            </button>
          ) : null}
        </div>
        <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-brand transition-all"
            style={{ width: `${(step / QUESTIONS.length) * 100}%` }}
          />
        </div>
        <h2 className="text-lg font-semibold">{Q.q}</h2>
        <div className="mt-4 grid gap-2">
          {Q.options.map((o, i) => (
            <button
              key={i}
              type="button"
              onClick={() => pick(i)}
              className="flex items-center justify-between gap-2 rounded-xl border bg-background px-4 py-3 text-left text-sm transition-colors hover:border-brand/40 hover:bg-brand-soft/40"
            >
              {o.label}
              <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Resultado: soma os pontos e escolhe o material vencedor.
  const score: Record<Mat, number> = {
    PLA: 0,
    PETG: 0,
    ABS: 0,
    ASA: 0,
    TPU: 0,
    NYLON: 0,
  };
  answers.forEach((optIdx, qi) => {
    const s = QUESTIONS[qi].options[optIdx]?.s ?? {};
    for (const k in s) score[k as Mat] += s[k as Mat] ?? 0;
  });
  const winner = ORDER.reduce((best, m) =>
    score[m] > score[best] ? m : best,
  );
  const pick0 = cheapest[winner];

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand">
        <Sparkles className="size-3.5" />
        Recomendado pra você
      </div>
      <h2 className="mt-3 font-display text-3xl font-bold">{winner}</h2>
      <p className="mt-2 max-w-2xl text-muted-foreground">{REASONS[winner]}</p>

      {pick0 ? (
        <Link
          href={`/produto/${pick0.slug}`}
          className="mt-5 flex items-center justify-between gap-3 rounded-xl border bg-background p-4 transition-colors hover:border-brand/40 hover:bg-brand-soft/30"
        >
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Opção mais barata</p>
            <p className="truncate font-medium">{pick0.name}</p>
            <p className="text-xs text-muted-foreground">{pick0.brand}</p>
          </div>
          <span className="shrink-0 text-right">
            <span className="font-display text-lg font-bold">
              {formatBRL(pick0.price)}
            </span>
          </span>
        </Link>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href={`/filamentos?material=${winner}`}
          className="grad-brand inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-px"
        >
          Ver todos os filamentos {winner}
          <ArrowRight className="size-4" />
        </Link>
        <button
          type="button"
          onClick={restart}
          className="inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <RotateCcw className="size-4" />
          Refazer
        </button>
      </div>
    </div>
  );
}
