// Marca Melhor Filamento — carretel de filamento (disco + cubo + fio saindo).
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* disco do carretel */}
      <circle cx="13" cy="16" r="9.5" className="fill-brand" />
      {/* anel interno (filamento enrolado) */}
      <circle
        cx="13"
        cy="16"
        r="6.4"
        className="stroke-brand-foreground/30"
        strokeWidth="1.2"
      />
      {/* cubo central */}
      <circle cx="13" cy="16" r="2.9" className="fill-background" />
      {/* fio de filamento saindo */}
      <path
        d="M21.5 13.6c4.6 0.4 4.6 6.4 0 6.8"
        className="stroke-teal"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="21.6" cy="20.4" r="1.7" className="fill-teal" />
    </svg>
  );
}
