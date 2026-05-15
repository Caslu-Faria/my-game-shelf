export default function HomePage() {
  return (
    <main style={{ fontFamily: "sans-serif", padding: 32 }}>
      <p style={{ color: "#6b7280", fontSize: 14, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        My Game Shelf
      </p>
      <h1 style={{ fontSize: 40, margin: "12px 0" }}>Monorepo inicial criado.</h1>
      <p style={{ maxWidth: 720, lineHeight: 1.6 }}>
        Esta aplicacao nasce alinhada com a arquitetura aprovada: frontend em Next.js,
        API separada por modulos de dominio, worker para sincronizacoes e pacotes
        compartilhados para contratos, dominio e configuracao.
      </p>
    </main>
  );
}
