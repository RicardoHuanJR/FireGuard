import { createFileRoute } from "@tanstack/react-router";
import { Check, Satellite } from "lucide-react";

import { NavTopo } from "@/components/NavTopo";

export const Route = createFileRoute("/planos")({
  head: () => ({
    meta: [
      { title: "Planos e assinatura — FireGuard Sat" },
      {
        name: "description",
        content:
          "Planos de monitoramento por satélite para pequenos produtores, propriedades maiores e cooperativas: alertas, mapa de risco e relatórios.",
      },
      { property: "og:title", content: "Planos e assinatura — FireGuard Sat" },
      {
        property: "og:description",
        content: "Monitoramento por satélite de focos de incêndio por assinatura mensal.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Planos,
});

const PLANOS = [
  {
    nome: "Básico",
    para: "Pequenos produtores",
    preco: "R$ 79",
    destaque: false,
    itens: [
      "Monitoramento por satélite",
      "Alertas de focos próximos",
      "Mapa da propriedade",
      "Notificações no celular",
    ],
  },
  {
    nome: "Profissional",
    para: "Propriedades maiores",
    preco: "R$ 249",
    destaque: true,
    itens: [
      "Tudo do Básico",
      "Mapa de risco por setor",
      "Análise de condições meteorológicas",
      "Estimativa de propagação",
      "Histórico de ocorrências",
    ],
  },
  {
    nome: "Empresarial",
    para: "Cooperativas e grupos",
    preco: "Sob consulta",
    destaque: false,
    itens: [
      "Várias propriedades em um painel",
      "Painel administrativo",
      "Relatórios periódicos",
      "Histórico completo de incêndios",
      "Integração com sistemas de gestão",
    ],
  },
];

function Planos() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:px-6">
        <NavTopo />
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 md:px-6">
        <p className="rotulo">Modelo de negócio</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
          Assinatura mensal por propriedade monitorada
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          O produto não é o satélite. Usamos dados públicos e comerciais de sensoriamento remoto e
          cobramos pelo processamento, pela análise de risco, pelos alertas e pela plataforma.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {PLANOS.map((p) => (
            <section
              key={p.nome}
              className={`painel flex flex-col p-5 ${p.destaque ? "border-fogo/60" : ""}`}
            >
              {p.destaque && <span className="rotulo mb-2 text-fogo">Mais escolhido</span>}
              <h3 className="text-lg font-semibold">{p.nome}</h3>
              <p className="text-xs text-muted-foreground">{p.para}</p>
              <div className="numero-tecnico mt-3 text-2xl font-semibold">
                {p.preco}
                {p.preco.startsWith("R$") && (
                  <span className="text-xs font-normal text-muted-foreground"> /mês</span>
                )}
              </div>
              <ul className="mt-4 flex flex-col gap-2 text-sm">
                {p.itens.map((i) => (
                  <li key={i} className="flex gap-2 text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-vento" />
                    {i}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section className="painel mt-8 p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Satellite className="h-4 w-4 text-vento" /> Como o produto evolui
          </h3>
          <ol className="mt-3 grid gap-3 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Pesquisa", "Frequência das imagens, localização dos focos e dados meteorológicos complementares."],
              ["Protótipo", "Mapa + propriedade + focos + nível de risco (esta versão)."],
              ["Sistema de alerta", "Disparo automático quando um foco entra no perímetro de vigilância."],
              ["Modelo de propagação", "Fogo + vento + relevo + tipo de vegetação para estimar avanço."],
              ["Teste com histórico", "Validar se o alerta teria chegado com antecedência em incêndios reais."],
              ["Projeto piloto", "Operação em propriedades rurais parceiras."],
            ].map(([titulo, texto], i) => (
              <li key={titulo} className="rounded-md border border-border bg-surface-2/40 p-3">
                <div className="numero-tecnico text-fogo">Etapa {i + 1}</div>
                <div className="mt-0.5 text-sm font-semibold text-foreground">{titulo}</div>
                <p className="mt-1">{texto}</p>
              </li>
            ))}
          </ol>
        </section>

        <p className="mt-8 text-sm text-muted-foreground italic">
          "O fogo pode ser imprevisível. A informação não precisa ser."
        </p>
      </main>
    </div>
  );
}
