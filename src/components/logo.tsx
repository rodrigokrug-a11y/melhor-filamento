// Marca Melhor Filamento — carretel de filamento (teal→verde) + lupa com check.
// SVG inline: nítido em qualquer tamanho e adaptável ao tema (usa tokens).
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="mf-spool" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--teal-500)" />
          <stop offset="100%" stopColor="var(--green-500)" />
        </linearGradient>
      </defs>
      {/* corpo do carretel (cilindro) */}
      <path
        d="M3.6 6.2V15.4c0 1.6 3.76 2.9 8.4 2.9s8.4-1.3 8.4-2.9V6.2"
        fill="url(#mf-spool)"
      />
      {/* topo do carretel */}
      <ellipse cx="12" cy="6.2" rx="8.4" ry="2.9" fill="var(--teal-600)" />
      {/* furo central */}
      <ellipse cx="12" cy="6.2" rx="2.2" ry="0.78" fill="#fff" opacity="0.6" />
      {/* enrolamentos do filamento */}
      <path
        d="M3.7 10.1c1 1.3 4.4 2.2 8.3 2.2s7.3-.9 8.3-2.2"
        stroke="#fff"
        strokeOpacity="0.28"
        strokeWidth="0.9"
      />
      <path
        d="M3.7 12.9c1 1.3 4.4 2.2 8.3 2.2s7.3-.9 8.3-2.2"
        stroke="#fff"
        strokeOpacity="0.28"
        strokeWidth="0.9"
      />
      {/* lupa */}
      <circle cx="21.4" cy="21" r="6.2" fill="var(--background)" />
      <circle cx="21.4" cy="21" r="6.2" stroke="var(--teal-600)" strokeWidth="2" />
      <path
        d="M26.1 25.7 29.3 28.9"
        stroke="var(--teal-600)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      {/* check verde */}
      <path
        d="M18.3 21.1 20.6 23.3 24.7 19"
        stroke="var(--green-500)"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
