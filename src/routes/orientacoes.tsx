import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  Droplets,
  Flame,
  PhoneCall,
  ShieldCheck,
  Sprout,
  Wind,
  ClipboardList,
} from "lucide-react";

import { NavTopo } from "@/components/NavTopo";

export const Route = createFileRoute("/orientacoes")({
  head: () => ({
    meta: [
      { title: "Orientações de controle de fogo — FireGuard Sat" },
      {
        name: "description",
        content:
          "Guia prático de prevenção, controle e resposta a incêndios em propriedades rurais: aceiros, queima controlada, plano de emergência e telefones de socorro.",
      },
      { property: "og:title", content: "Orientações de controle de fogo — FireGuard Sat" },
      {
        property: "og:description",
        content:
          "Como prevenir, conter e reagir a focos de incêndio na fazenda, com checklists e contatos de emergência.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Orientacoes,
});

const PREVENCAO = [
  {
    titulo: "Aceiros bem mantidos",
    texto:
      "Faixas limpas de 5 a 10 m ao redor de divisas, benfeitorias, cercas e reservas. Reforce para 15 m em áreas com vento forte e pasto alto. Refaça antes do pico da seca.",
  },
  {
    titulo: "Reduzir material combustível",
    texto:
      "Controle o acúmulo de palhada, capim seco e restos de poda perto de galpões, silos, currais e caixas de energia. Material seco acima de 30 cm de altura acelera muito a frente de fogo.",
  },
  {
    titulo: "Água e acesso garantidos",
    texto:
      "Mantenha reservatórios, caminhão-pipa e bombas testados, estradas internas trafegáveis e porteiras destravadas para a entrada dos bombeiros.",
  },
  {
    titulo: "Equipe treinada",
    texto:
      "Defina quem faz o quê antes da temporada: quem liga para o socorro, quem opera o pipa, quem retira animais e quem confere o perímetro depois.",
  },
];

const QUEIMA = [
  "Verifique a legislação estadual e obtenha autorização do órgão ambiental antes de qualquer queima.",
  "Só queime com umidade relativa acima de 30% e vento abaixo de 15 km/h — nunca no meio do dia mais quente.",
  "Prefira o fim da tarde ou início da manhã, quando a umidade sobe e o vento cai.",
  "Avise vizinhos e o corpo de bombeiros com antecedência.",
  "Abra aceiros no perímetro inteiro e queime contra o vento, em faixas pequenas e controladas.",
  "Não deixe o local antes do rescaldo completo: brasa em toco ou raiz reacende horas depois.",
];

const DURANTE = [
  {
    titulo: "1. Confirme e posicione",
    texto:
      "Use o painel para ver distância, direção de avanço e setor ameaçado. Nunca avalie o fogo de dentro da fumaça.",
  },
  {
    titulo: "2. Acione o socorro",
    texto:
      "Ligue 193 (Bombeiros) e informe coordenadas, tamanho aproximado, tipo de vegetação e melhor rota de acesso.",
  },
  {
    titulo: "3. Proteja pessoas e animais",
    texto:
      "Retire pessoas, animais e maquinário para áreas já queimadas, estradas largas ou pastos verdes — sempre a favor do vento em relação ao fogo, nunca subindo encosta à frente das chamas.",
  },
  {
    titulo: "4. Ataque só o que é seguro",
    texto:
      "Combata pelos flancos e pela retaguarda, nunca de frente para a cabeça do fogo. Abandone a ação se o vento mudar ou a fumaça fechar a visão.",
  },
  {
    titulo: "5. Rescaldo e registro",
    texto:
      "Vasculhe o perímetro por brasas por pelo menos 24h. Registre fotos, área atingida e prejuízo para seguro e para o histórico da propriedade.",
  },
];

const NUNCA = [
  "Combater fogo sozinho, sem rota de fuga e sem alguém sabendo onde você está.",
  "Entrar em vale estreito, capão fechado ou subir encosta com fogo abaixo de você.",
  "Usar roupas sintéticas, chinelo ou ficar sem proteção para as vias respiratórias.",
  "Confiar em aceiro estreito com vento acima de 25 km/h.",
  "Deixar o local sem rescaldo, mesmo com a chama aparentemente apagada.",
];

function Orientacoes() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:px-6">
        <NavTopo />
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 md:px-6">
        <p className="rotulo">Central de conhecimento</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
          Controle de fogo no campo — o que fazer antes, durante e depois
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          O fogo pode ser imprevisível. A informação não precisa ser. Este guia reúne as práticas
          básicas de prevenção, queima controlada e resposta a incêndios em propriedades rurais.
        </p>

        <section className="painel mt-6 flex flex-col gap-3 border-fogo/40 p-4 md:flex-row md:items-center">
          <PhoneCall className="h-5 w-5 shrink-0 text-fogo" />
          <div className="text-sm">
            <strong>Emergência:</strong> Corpo de Bombeiros <span className="numero-tecnico">193</span> ·
            Defesa Civil <span className="numero-tecnico">199</span> · Polícia Ambiental{" "}
            <span className="numero-tecnico">190</span> · IBAMA/Prevfogo{" "}
            <span className="numero-tecnico">0800 61 8080</span>
          </div>
        </section>

        <Bloco icone={<ShieldCheck className="h-4 w-4 text-vento" />} titulo="Prevenção na propriedade">
          <div className="grid gap-3 sm:grid-cols-2">
            {PREVENCAO.map((p) => (
              <div key={p.titulo} className="painel p-3">
                <h4 className="text-sm font-semibold">{p.titulo}</h4>
                <p className="mt-1 text-xs text-muted-foreground">{p.texto}</p>
              </div>
            ))}
          </div>
        </Bloco>

        <Bloco icone={<Sprout className="h-4 w-4 text-vento" />} titulo="Queima controlada com segurança">
          <ul className="flex flex-col gap-2">
            {QUEIMA.map((q) => (
              <li key={q} className="flex gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-vento" />
                {q}
              </li>
            ))}
          </ul>
        </Bloco>

        <Bloco icone={<Flame className="h-4 w-4 text-fogo" />} titulo="Quando o alerta disparar">
          <ol className="flex flex-col gap-3">
            {DURANTE.map((d) => (
              <li key={d.titulo} className="painel p-3">
                <h4 className="text-sm font-semibold text-fogo">{d.titulo}</h4>
                <p className="mt-1 text-xs text-muted-foreground">{d.texto}</p>
              </li>
            ))}
          </ol>
        </Bloco>

        <Bloco icone={<AlertTriangle className="h-4 w-4 text-risco-critico" />} titulo="Nunca faça">
          <ul className="flex flex-col gap-2">
            {NUNCA.map((n) => (
              <li key={n} className="flex gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-risco-critico" />
                {n}
              </li>
            ))}
          </ul>
        </Bloco>

        <Bloco icone={<Wind className="h-4 w-4 text-vento" />} titulo="Como ler os dados do painel">
          <dl className="grid gap-3 sm:grid-cols-2">
            <Verbete termo="Foco de calor">
              Ponto quente detectado por satélite. Indica calor anômalo na superfície — quase sempre fogo,
              mas pode ser confundido com telhado metálico ou queima industrial.
            </Verbete>
            <Verbete termo="FRP (MW)">
              Potência radiativa do fogo. Quanto maior, mais intensa a queima naquele momento.
            </Verbete>
            <Verbete termo="Direção do vento">
              Indicada de onde o vento vem. A frente de fogo tende a avançar no sentido oposto.
            </Verbete>
            <Verbete termo="Índice de propagação">
              Combina vento, temperatura, umidade e intensidade do foco em uma escala de 0 a 100.
            </Verbete>
            <Verbete termo="Índice de ameaça">
              Cruza o foco com a sua propriedade: distância, alinhamento do avanço e intensidade do fogo.
            </Verbete>
            <Verbete termo="Perímetro de vigilância">
              Raio ao redor da fazenda dentro do qual qualquer foco gera alerta.
            </Verbete>
          </dl>
        </Bloco>

        <Bloco icone={<ClipboardList className="h-4 w-4 text-vento" />} titulo="Checklist da temporada seca">
          <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            {[
              "Aceiros refeitos e conferidos",
              "Reservatórios e bombas testados",
              "Abafadores, enxadas e bombas costais disponíveis",
              "Contatos de emergência afixados na sede",
              "Equipe com função definida e treinada",
              "Perímetro de alerta configurado no app",
              "Rotas de fuga e ponto de encontro combinados",
              "Seguro rural e documentação em dia",
            ].map((c) => (
              <li key={c} className="flex items-center gap-2 rounded-md border border-border bg-surface-2/40 px-3 py-2">
                <Droplets className="h-3.5 w-3.5 shrink-0 text-vento" />
                {c}
              </li>
            ))}
          </ul>
        </Bloco>

        <p className="mt-8 text-xs text-muted-foreground">
          Conteúdo informativo de referência. Em situação real, siga sempre a orientação do Corpo de
          Bombeiros e do órgão ambiental do seu estado.
        </p>
      </main>
    </div>
  );
}

function Bloco({
  icone,
  titulo,
  children,
}: {
  icone: React.ReactNode;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        {icone}
        {titulo}
      </h3>
      {children}
    </section>
  );
}

function Verbete({ termo, children }: { termo: string; children: React.ReactNode }) {
  return (
    <div className="painel p-3">
      <dt className="rotulo">{termo}</dt>
      <dd className="mt-1 text-xs text-muted-foreground">{children}</dd>
    </div>
  );
}
