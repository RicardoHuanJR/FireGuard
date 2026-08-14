import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Flame, Wind, Thermometer, Droplets, Satellite, Gauge, MapPin, Layers, CloudRain } from "lucide-react";

import { MapaRegiao } from "@/components/MapaRegiao";
import {
  REGIOES,
  carregarRegiao,
  corDoRisco,
  kmhParaNos,
  rosaDosVentos,
  rotuloRisco,
  type Foco,
  type NivelRisco,
} from "@/lib/queimadas-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AtmosFogo — Monitoramento de Queimadas e Vento" },
      {
        name: "description",
        content:
          "Painel de monitoramento de focos de calor, temperatura de superfície e direção e velocidade do vento por região, com índice de risco de propagação.",
      },
      { property: "og:title", content: "AtmosFogo — Monitoramento de Queimadas e Vento" },
      {
        property: "og:description",
        content:
          "Mapa de regiões com focos de queimada, camada termal e campo de vento em tempo real, com projeção de propagação do fogo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Painel,
});

const PERIODOS = [
  { id: 24, rotulo: "24h" },
  { id: 48, rotulo: "48h" },
  { id: 168, rotulo: "7 dias" },
] as const;

const NIVEIS: NivelRisco[] = ["critico", "alto", "medio", "baixo"];

function Painel() {
  const [regiaoId, setRegiaoId] = useState(REGIOES[0]!.id);
  const [camadas, setCamadas] = useState({ focos: true, termal: true, vento: true });
  const [periodo, setPeriodo] = useState<number>(48);
  const [niveis, setNiveis] = useState<NivelRisco[]>(NIVEIS);
  const [selecionado, setSelecionado] = useState<string | null>(null);

  const dados = useMemo(() => carregarRegiao(regiaoId), [regiaoId]);

  const focosFiltrados = useMemo(
    () => dados.focos.filter((f) => f.horasAtras <= periodo && niveis.includes(f.risco)),
    [dados, periodo, niveis],
  );

  const dadosMapa = useMemo(() => ({ ...dados, focos: focosFiltrados }), [dados, focosFiltrados]);
  const foco = focosFiltrados.find((f) => f.id === selecionado) ?? null;
  const { vento } = dados.condicoes;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex flex-wrap items-center gap-4 px-4 py-3 md:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-fogo/15 text-fogo">
              <Flame className="h-4.5 w-4.5" />
            </span>
            <div>
              <h1 className="text-base leading-none font-semibold tracking-tight">AtmosFogo</h1>
              <p className="rotulo mt-1">Monitoramento de queimadas</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <select
              value={regiaoId}
              onChange={(e) => {
                setRegiaoId(e.target.value);
                setSelecionado(null);
              }}
              className="numero-tecnico rounded-md border border-input bg-surface px-3 py-1.5 text-sm text-foreground outline-none focus:border-ring"
              aria-label="Selecionar região"
            >
              {REGIOES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nome} / {r.uf}
                </option>
              ))}
            </select>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <div className="hidden items-center gap-1.5 sm:flex">
              <Layers className="mr-1 h-4 w-4 text-muted-foreground" />
              {(
                [
                  ["focos", "Focos"],
                  ["termal", "Termal"],
                  ["vento", "Vento"],
                ] as const
              ).map(([key, rotulo]) => (
                <button
                  key={key}
                  onClick={() => setCamadas((c) => ({ ...c, [key]: !c[key] }))}
                  aria-pressed={camadas[key]}
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium tracking-wide transition-colors ${
                    camadas[key]
                      ? "border-ring/60 bg-fogo/15 text-fogo"
                      : "border-border bg-surface text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {rotulo}
                </button>
              ))}
            </div>
            <div className="rotulo hidden md:block">Atualizado {dados.atualizadoEm}</div>
          </div>
        </div>
      </header>

      <main className="grid gap-4 p-4 md:p-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-4">
          <div className="painel relative h-[380px] overflow-hidden md:h-[560px]">
            <MapaRegiao
              dados={dadosMapa}
              camadas={camadas}
              focoSelecionado={selecionado}
              onSelecionarFoco={setSelecionado}
            />
            <div className="pointer-events-none absolute top-3 left-3 flex flex-col gap-2">
              <div className="painel bg-background/80 px-3 py-2 backdrop-blur">
                <div className="rotulo">Região</div>
                <div className="text-sm font-semibold">
                  {dados.regiao.nome} <span className="text-muted-foreground">/ {dados.regiao.uf}</span>
                </div>
                <div className="numero-tecnico mt-0.5 text-xs text-muted-foreground">
                  {dados.regiao.lat.toFixed(2)}°, {dados.regiao.lon.toFixed(2)}°
                </div>
              </div>
              <div className="painel bg-background/80 px-3 py-2 backdrop-blur">
                <div className="rotulo mb-1.5">Legenda</div>
                {NIVEIS.map((n) => (
                  <div key={n} className="flex items-center gap-2 text-xs">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: corDoRisco(n) }} />
                    {rotuloRisco(n)}
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute right-3 bottom-3">
              <RosaDosVentos graus={vento.direcaoGraus} velocidade={vento.velocidadeKmh} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Metrica icone={<Thermometer className="h-4 w-4" />} rotulo="Temperatura do ar">
              {dados.condicoes.temperaturaC.toFixed(1)} <small>°C</small>
            </Metrica>
            <Metrica icone={<Flame className="h-4 w-4" />} rotulo="Temp. de superfície" tom="fogo">
              {dados.condicoes.temperaturaSuperficieC.toFixed(1)} <small>°C</small>
            </Metrica>
            <Metrica icone={<Droplets className="h-4 w-4" />} rotulo="Umidade relativa" tom="vento">
              {dados.condicoes.umidadePercent} <small>%</small>
            </Metrica>
            <Metrica icone={<CloudRain className="h-4 w-4" />} rotulo="Chuva 7 dias" tom="vento">
              {dados.condicoes.precipitacao7dMm.toFixed(1)} <small>mm</small>
            </Metrica>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
            <section className="painel p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <Wind className="h-4 w-4 text-vento" /> Vento — próximas 24h
                </h2>
                <span className="numero-tecnico text-xs text-muted-foreground">
                  rajadas até {vento.rajadaKmh.toFixed(0)} km/h
                </span>
              </div>
              <GraficoVento previsao={dados.previsao} />
            </section>

            <section className="painel p-4">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Satellite className="h-4 w-4 text-fogo" /> Focos por dia
              </h2>
              <GraficoBarras serie={dados.serie} />
            </section>
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <section className="painel p-4">
            <div className="rotulo">Índice de propagação da região</div>
            <div className="mt-1 flex items-end gap-2">
              <span className="numero-tecnico text-4xl leading-none font-semibold text-fogo">
                {dados.indiceRiscoRegiao}
              </span>
              <span className="mb-1 text-xs text-muted-foreground">/100</span>
              <span
                className="mb-1 ml-auto rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{
                  backgroundColor: `color-mix(in oklch, ${corDoRisco(nivel(dados.indiceRiscoRegiao))} 22%, transparent)`,
                  color: corDoRisco(nivel(dados.indiceRiscoRegiao)),
                }}
              >
                {rotuloRisco(nivel(dados.indiceRiscoRegiao))}
              </span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${dados.indiceRiscoRegiao}%`,
                  background: `linear-gradient(90deg, var(--risco-baixo), var(--risco-medio), var(--risco-critico))`,
                }}
              />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="rotulo">Vento</dt>
                <dd className="numero-tecnico mt-0.5 text-sm">
                  {vento.velocidadeKmh.toFixed(1)} km/h · {kmhParaNos(vento.velocidadeKmh).toFixed(1)} kt
                </dd>
              </div>
              <div>
                <dt className="rotulo">Direção</dt>
                <dd className="numero-tecnico mt-0.5 text-sm">
                  {rosaDosVentos(vento.direcaoGraus)} · {Math.round(vento.direcaoGraus)}°
                </dd>
              </div>
              <div>
                <dt className="rotulo">Focos ativos</dt>
                <dd className="numero-tecnico mt-0.5 text-sm">{focosFiltrados.length}</dd>
              </div>
              <div>
                <dt className="rotulo">Críticos</dt>
                <dd className="numero-tecnico mt-0.5 text-sm text-risco-critico">
                  {focosFiltrados.filter((f) => f.risco === "critico").length}
                </dd>
              </div>
            </dl>
          </section>

          <section className="painel flex min-h-0 flex-col p-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Gauge className="h-4 w-4 text-fogo" /> Alertas por severidade
            </h2>

            <div className="mt-3 flex gap-1">
              {PERIODOS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPeriodo(p.id)}
                  className={`flex-1 rounded-md border px-2 py-1 text-xs transition-colors ${
                    periodo === p.id
                      ? "border-ring/60 bg-fogo/15 text-fogo"
                      : "border-border bg-surface-2 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p.rotulo}
                </button>
              ))}
            </div>

            <div className="mt-2 flex flex-wrap gap-1">
              {NIVEIS.map((n) => {
                const ativo = niveis.includes(n);
                return (
                  <button
                    key={n}
                    onClick={() =>
                      setNiveis((atual) => (ativo ? atual.filter((x) => x !== n) : [...atual, n]))
                    }
                    aria-pressed={ativo}
                    className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs transition-opacity"
                    style={{
                      opacity: ativo ? 1 : 0.4,
                      color: ativo ? corDoRisco(n) : "var(--muted-foreground)",
                    }}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: corDoRisco(n) }} />
                    {rotuloRisco(n)}
                  </button>
                );
              })}
            </div>

            <ul className="mt-3 -mr-1 flex max-h-[420px] flex-col gap-2 overflow-y-auto pr-1">
              {focosFiltrados.map((f) => (
                <li key={f.id}>
                  <ItemFoco foco={f} ativo={selecionado === f.id} onClick={() => setSelecionado(f.id)} />
                </li>
              ))}
              {focosFiltrados.length === 0 && (
                <li className="py-6 text-center text-xs text-muted-foreground">
                  Nenhum foco no período e filtros selecionados.
                </li>
              )}
            </ul>
          </section>

          {foco && <DetalheFoco foco={foco} />}
        </aside>
      </main>

      <footer className="border-t border-border px-4 py-4 text-xs text-muted-foreground md:px-6">
        Protótipo com dados simulados. Estrutura pronta para integração com INPE / Programa Queimadas, NASA
        FIRMS e Open-Meteo.
      </footer>
    </div>
  );
}

function nivel(indice: number): NivelRisco {
  if (indice >= 78) return "critico";
  if (indice >= 58) return "alto";
  if (indice >= 36) return "medio";
  return "baixo";
}

function Metrica({
  icone,
  rotulo,
  children,
  tom = "neutro",
}: {
  icone: React.ReactNode;
  rotulo: string;
  children: React.ReactNode;
  tom?: "neutro" | "fogo" | "vento";
}) {
  const cor = tom === "fogo" ? "text-fogo" : tom === "vento" ? "text-vento" : "text-foreground";
  return (
    <div className="painel p-3">
      <div className={`flex items-center gap-1.5 ${cor}`}>
        {icone}
        <span className="rotulo">{rotulo}</span>
      </div>
      <div className={`numero-tecnico mt-1.5 text-2xl font-semibold ${cor}`}>{children}</div>
    </div>
  );
}

function RosaDosVentos({ graus, velocidade }: { graus: number; velocidade: number }) {
  return (
    <div className="painel flex items-center gap-3 bg-background/85 px-3 py-2 backdrop-blur">
      <svg viewBox="0 0 100 100" className="h-16 w-16">
        <circle cx="50" cy="50" r="44" fill="none" stroke="var(--border)" strokeWidth="2" />
        <circle cx="50" cy="50" r="30" fill="none" stroke="var(--border)" strokeWidth="1" opacity="0.6" />
        {["N", "L", "S", "O"].map((p, i) => (
          <text
            key={p}
            x={50 + Math.sin((i * Math.PI) / 2) * 38}
            y={50 - Math.cos((i * Math.PI) / 2) * 38 + 4}
            textAnchor="middle"
            fontSize="11"
            fill="var(--muted-foreground)"
            className="numero-tecnico"
          >
            {p}
          </text>
        ))}
        <g transform={`rotate(${graus + 180} 50 50)`}>
          <path d="M50 16 L58 56 L50 50 L42 56 Z" fill="var(--vento)" />
          <path d="M50 84 L42 56 L50 50 L58 56 Z" fill="var(--vento-suave)" opacity="0.45" />
        </g>
        <circle cx="50" cy="50" r="3" fill="var(--foreground)" />
      </svg>
      <div>
        <div className="rotulo">Vento</div>
        <div className="numero-tecnico text-lg leading-tight font-semibold text-vento">
          {velocidade.toFixed(1)} <span className="text-xs">km/h</span>
        </div>
        <div className="numero-tecnico text-xs text-muted-foreground">
          {rosaDosVentos(graus)} {Math.round(graus)}°
        </div>
      </div>
    </div>
  );
}

function GraficoVento({ previsao }: { previsao: { hora: string; velocidadeKmh: number; direcaoGraus: number }[] }) {
  const max = Math.max(...previsao.map((p) => p.velocidadeKmh));
  const min = Math.min(...previsao.map((p) => p.velocidadeKmh));
  const pontos = previsao
    .map((p, i) => {
      const x = (i / (previsao.length - 1)) * 100;
      const y = 100 - ((p.velocidadeKmh - min) / Math.max(max - min, 1)) * 78 - 11;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-28 w-full">
        <polyline points={pontos} fill="none" stroke="var(--vento)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
        <polygon points={`0,100 ${pontos} 100,100`} fill="var(--vento)" opacity="0.14" />
      </svg>
      <div className="mt-2 grid grid-cols-8 gap-1">
        {previsao
          .filter((_, i) => i % 3 === 0)
          .map((p) => (
            <div key={p.hora} className="flex flex-col items-center gap-1">
              <svg viewBox="0 0 20 20" className="h-4 w-4" style={{ transform: `rotate(${p.direcaoGraus + 180}deg)` }}>
                <path d="M10 3 L10 17 M6 7 L10 2 L14 7" stroke="var(--vento)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              </svg>
              <span className="numero-tecnico text-[10px] text-muted-foreground">{p.hora}</span>
              <span className="numero-tecnico text-[10px]">{p.velocidadeKmh.toFixed(0)}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

function GraficoBarras({ serie }: { serie: { dia: string; focos: number }[] }) {
  const max = Math.max(...serie.map((s) => s.focos));
  return (
    <div className="flex h-32 items-end gap-2">
      {serie.map((s) => (
        <div key={s.dia} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
          <span className="numero-tecnico text-[10px] text-muted-foreground">{s.focos}</span>
          <div
            className="w-full rounded-t-sm"
            style={{
              height: `${(s.focos / max) * 100}%`,
              background: "linear-gradient(180deg, var(--fogo), var(--fogo-forte))",
            }}
          />
          <span className="numero-tecnico text-[10px] text-muted-foreground">{s.dia}</span>
        </div>
      ))}
    </div>
  );
}

function ItemFoco({ foco, ativo, onClick }: { foco: Foco; ativo: boolean; onClick: () => void }) {
  const cor = corDoRisco(foco.risco);
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-md border p-2.5 text-left transition-colors ${
        ativo ? "border-ring/70 bg-surface-2" : "border-border bg-surface-2/40 hover:bg-surface-2"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: cor }} />
        <span className="numero-tecnico text-xs">
          {foco.lat.toFixed(3)}, {foco.lon.toFixed(3)}
        </span>
        <span className="numero-tecnico ml-auto text-sm font-semibold" style={{ color: cor }}>
          {foco.indicePropagacao}
        </span>
      </div>
      <div className="numero-tecnico mt-1 flex gap-3 text-[11px] text-muted-foreground">
        <span>{foco.frpMw.toFixed(0)} MW</span>
        <span>{(foco.temperaturaK - 273.15).toFixed(0)} °C</span>
        <span>há {foco.horasAtras.toFixed(0)} h</span>
      </div>
    </button>
  );
}

function DetalheFoco({ foco }: { foco: Foco }) {
  const cor = corDoRisco(foco.risco);
  return (
    <section className="painel p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Foco selecionado</h2>
        <span
          className="rounded-full px-2 py-0.5 text-xs font-semibold"
          style={{ backgroundColor: `color-mix(in oklch, ${cor} 22%, transparent)`, color: cor }}
        >
          {rotuloRisco(foco.risco)}
        </span>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
        <Campo rotulo="Coordenadas" valor={`${foco.lat.toFixed(4)}, ${foco.lon.toFixed(4)}`} />
        <Campo rotulo="Satélite" valor={foco.satelite} />
        <Campo rotulo="Potência radiativa" valor={`${foco.frpMw.toFixed(1)} MW`} />
        <Campo rotulo="Temp. estimada" valor={`${(foco.temperaturaK - 273.15).toFixed(0)} °C`} />
        <Campo rotulo="Detecção" valor={`há ${foco.horasAtras.toFixed(0)} h`} />
        <Campo
          rotulo="Avanço provável"
          valor={`${rosaDosVentos(foco.avancoGraus)} · ${Math.round(foco.avancoGraus)}°`}
        />
      </dl>
    </section>
  );
}

function Campo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <dt className="rotulo">{rotulo}</dt>
      <dd className="numero-tecnico mt-0.5 text-sm">{valor}</dd>
    </div>
  );
}
