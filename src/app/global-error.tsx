"use client";

// Error boundary raiz: captura falhas no próprio layout. Precisa renderizar
// <html>/<body> porque substitui a árvore inteira. Estilos inline (o CSS do
// app pode não estar disponível neste caminho).
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0C1F23",
          color: "#E7EFEE",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", padding: 24, maxWidth: 420 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Algo deu errado</h1>
          <p style={{ color: "#9FC0BC", marginTop: 8 }}>
            Tivemos um problema temporário. Tente recarregar a página.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: 20,
              background: "linear-gradient(135deg, #0E7E7B, #54B62E)",
              color: "#fff",
              border: 0,
              borderRadius: 999,
              padding: "10px 22px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Tentar de novo
          </button>
        </div>
      </body>
    </html>
  );
}
