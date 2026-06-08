import type { GuiaMaterial } from "@/lib/guias";

function Dificuldade({ nivel }: { nivel: number }) {
  return (
    <span
      className="inline-flex items-center gap-0.5"
      aria-label={`Dificuldade ${nivel} de 5`}
      title={`Dificuldade ${nivel} de 5`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          aria-hidden
          className={`size-1.5 rounded-full ${i < nivel ? "bg-brand" : "bg-muted-foreground/25"}`}
        />
      ))}
    </span>
  );
}

/**
 * Tabela comparativa dos materiais do guia. Rola na horizontal no mobile.
 * Cada material aponta para seu card (âncora #material-<key>).
 */
export function GuiaTabela({ materiais }: { materiais: GuiaMaterial[] }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <table className="w-full min-w-[640px] border-separate border-spacing-0 text-sm">
        <thead>
          <tr className="text-left">
            {["Material", "Dificuldade", "Bico", "Mesa", "Resistência", "Food-safe", "Preço"].map(
              (h) => (
                <th
                  key={h}
                  className="border-b bg-muted/40 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wide text-muted-foreground first:rounded-l-lg last:rounded-r-lg"
                >
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {materiais.map((m) => (
            <tr key={m.key} className="align-middle">
              <td className="border-b px-3 py-2.5 font-medium">
                <a href={`#material-${m.key}`} className="hover:text-brand hover:underline">
                  {m.nome}
                </a>
              </td>
              <td className="border-b px-3 py-2.5">
                <Dificuldade nivel={m.dificuldade} />
              </td>
              <td className="border-b px-3 py-2.5 whitespace-nowrap tnum text-muted-foreground">
                {m.bico}
              </td>
              <td className="border-b px-3 py-2.5 whitespace-nowrap tnum text-muted-foreground">
                {m.mesa}
              </td>
              <td className="border-b px-3 py-2.5 text-muted-foreground">{m.resistencia}</td>
              <td className="border-b px-3 py-2.5 text-muted-foreground">{m.foodSafe}</td>
              <td className="border-b px-3 py-2.5 font-mono font-bold text-offer">{m.preco}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
