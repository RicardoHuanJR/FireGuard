import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Flame,
  Wind,
  Thermometer,
  Droplets,
  Satellite,
  Gauge,
  MapPin,
  Layers,
  CloudRain,
  Ruler,
  Timer,
  ShieldAlert,
  Compass,
} from "lucide-react";

import { MapaRegiao } from "@/components/MapaRegiao";
import { NavTopo } from "@/components/NavTopo";
import {
  REGIOES,
  analisarRegiao,
  carregarRegiao,
  corDoRisco,
  kmhParaNos,
  propriedadeDaRegiao,
  rosaDosVentos,
  rotuloRisco,
  type AmeacaFoco,
  type NivelRisco,
} from "@/lib/queimadas-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FireGuard Sat — Alerta de incêndio para propriedades rurais" },
      {
        name: "description",
        content:
          "Monitoramento por satélite de focos de incêndio próximos à sua fazenda: distância, direção de avanço do fogo, setor ameaçado e nível de risco em tempo real.",
      },
      { property: "og:title", content: "FireGuard Sat — Detectar antes. Alertar a tempo." },
      {
        property: "og:description",
        content:
          "Cruzamento de focos de calor detectados por satélite com a localização da propriedade, vento e risco de propagação.",
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
  const [camadas, setCamadas] = useState({ focos: true, termal: true, vento: true, propriedade: true });
  const [periodo, setPeriodo] = useState<number>(48);
  const [niveis, setNiveis] = useState<NivelRisco[]>(NIVEIS);
  const [selecionado, setSelecionado] = useState<string | null>(null);

  const dados = useMemo(() => carregarRegiao(regiaoId), [regiaoId]);
  const propriedade = useMemo(() => propriedadeDaRegiao(regiaoId), [regiaoId]);

  const ameacas = useMemo(
    () =>
      analisarRegiao(dados, propriedade).filter(
        (a) => a.foco.horasAtras <= periodo && niveis.includes(a.nivel),
      ),
    [dados, propriedade, periodo, niveis],
  );

  const focosFiltrados = useMemo(() => ameacas.map((a) => a.foco), [ameacas]);
  const dadosMapa = useMemo(() => ({ ...dados, focos: focosFiltrados }), [dados, focosFiltrados]);

  const principal = ameacas[0] ?? null;
  const selecionada = ameacas.find((a) => a.foco.id === selecionado) ?? null;
  const emFoco = selecionada ?? principal;
  const dentroDoPerimetro = ameacas.filter(
    (a) => a.distanciaKm - propriedade.raioKm <= propriedade.perimetroAlertaKm,
  );
  const { vento } = dados.condicoes;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:px-6">
        <NavTopo
          direita={
            <>
              <div className="hidden items-center gap-1.5 sm:flex">
                <Layers className="mr-1 h-4 w-4 text-muted-foreground" />
                {(
                  [
                    ["focos", "Focos"],
                    ["termal", "Termal"],
                    ["vento", "Vento"],
                    ["propriedade", "Fazenda"],
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
            </>
          }
        />

        <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-border pt-3">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <select
            value={regiaoId}
            onChange={(e) => {
              setRegiaoId(e.target.value);
              setSelecionado(null);
            }}
            className="numero-tecnico rounded-md border border-input bg-surface px-3 py-1.5 text-sm text-foreground outline-none focus:border-ring"
            aria-label="Selecionar propriedade monitorada"
          >
            {REGIOES.map((r) => (
              <option key={r.id} value={r.id}>
                {propriedadeDaRegiao(r.id).nome} — {r.nome}/{r.uf}
              </option>
            ))}
          </select>
          <span className="numero-tecnico text-xs text-muted-foreground">
            {propriedade.hectares.toLocaleString("pt-BR")} ha · {propriedade.cultura} · perímetro de
            vigilância {propriedade.perimetroAlertaKm} km
          </span>
        </div>
      </header>

      <main className="grid gap-4 p-4 md:p-6 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-4">
          <BannerAlerta ameaca={principal} propriedade={propriedade.nome} totalNoPerimetro={dentroDoPerimetro.length} />

          <div className="painel relative h-[380px] overflow-hidden md:h-[560px]">
            <MapaRegiao
              dados={dadosMapa}
              camadas={camadas}
              focoSelecionado={selecionado}
              onSelecionarFoco={setSelecionado}
              propriedade={propriedade}
              ameacaPrincipal={emFoco}
            />
            <div className="pointer-events-none absolute top-3 left-3 flex flex-col gap-2">
              <div className="painel bg-background/80 px-3 py-2 backdrop-blur">
                <div className="rotulo">Propriedade monitorada</div>
                <div className="text-sm font-semibold">{propriedade.nome}</div>
                <div className="numero-tecnico mt-0.5 text-xs text-muted-foreground">
                  {propriedade.lat.toFixed(2)}°, {propriedade.lon.toFixed(2)}° · {dados.regiao.nome}/
                  {dados.regiao.uf}
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
                <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-vento" /> Fazenda e perímetro
                </div>
              </div>
            </div>

            <div className="absolute right-3 bottom-3">
              <RosaDosVentos graus={vento.direcaoGraus} velocidade={vento.velocidadeKmh} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Metrica icone={<Ruler className="h-4 w-4" />} rotulo="Foco mais próximo" tom="fogo">
              {principal ? principal.distanciaKm.toFixed(1) : "—"} <small>km</small>
            </Metrica>
            <Metrica icone={<Thermometer className="h-4 w-4" />} rotulo="Temperatura do ar">
              {dados.condicoes.temperaturaC.toFixed(1)} <small>°C</small>
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
                <Satellite className="h-4 w-4 text-fogo" /> Focos por dia na região
              </h2>
              <GraficoBarras serie={dados.serie} />
            </section>
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <section className="painel p-4">
            <div className="rotulo">Risco para a propriedade</div>
            <div className="mt-1 flex items-end gap-2">
              <span className="numero-tecnico text-4xl leading-none font-semibold text-fogo">
                {principal ? principal.indiceAmeaca : 0}
              </span>
              <span className="mb-1 text-xs text-muted-foreground">/100</span>
              <span
                className="mb-1 ml-auto rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{
                  backgroundColor: `color-mix(in oklch, ${corDoRisco(principal?.nivel ?? "baixo")} 22%, transparent)`,
                  color: corDoRisco(principal?.nivel ?? "baixo"),
                }}
              >
                {rotuloRisco(principal?.nivel ?? "baixo")}
              </span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${principal?.indiceAmeaca ?? 0}%`,
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
                <dt className="rotulo">Focos no perímetro</dt>
                <dd className="numero-tecnico mt-0.5 text-sm">{dentroDoPerimetro.length}</dd>
              </div>
              <div>
                <dt className="rotulo">Risco da região</dt>
                <dd className="numero-tecnico mt-0.5 text-sm">{dados.indiceRiscoRegiao}/100</dd>
              </div>
            </dl>
          </section>

          <section className="painel flex min-h-0 flex-col p-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Gauge className="h-4 w-4 text-fogo" /> Focos por proximidade e ameaça
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
              {ameacas.map((a) => (
                <li key={a.foco.id}>
                  <ItemAmeaca
                    ameaca={a}
                    ativo={selecionado === a.foco.id}
                    onClick={() => setSelecionado(a.foco.id)}
                  />
                </li>
              ))}
              {ameacas.length === 0 && (
                <li className="py-6 text-center text-xs text-muted-foreground">
                  Nenhum foco no período e filtros selecionados.
                </li>
              )}
            </ul>
          </section>

          {emFoco && <DetalheAmeaca ameaca={emFoco} />}
        </aside>
      </main>

      <footer className="border-t border-border px-4 py-4 text-xs text-muted-foreground md:px-6">
        Protótipo com dados simulados de satélite. Estrutura pronta para integração com INPE / Programa
        Queimadas, NASA FIRMS e Open-Meteo. "O fogo pode ser imprevisível. A informação não precisa ser."
      </footer>
    </div>
  );
}

function BannerAlerta({
  ameaca,
  propriedade,
  totalNoPerimetro,
}: {
  ameaca: AmeacaFoco | null;
  propriedade: string;
  totalNoPerimetro: number;
}) {
  if (!ameaca) {
    return (
      <section className="painel flex items-center gap-3 border-vento/40 p-4">
        <ShieldAlert className="h-5 w-5 text-vento" />
        <p className="text-sm">
          Nenhum foco ativo nos filtros atuais para a <strong>{propriedade}</strong>.
        </p>
      </section>
    );
  }

  const cor = corDoRisco(ameaca.nivel);
  return (
    <section
      className="painel p-4"
      style={{ borderColor: `color-mix(in oklch, ${cor} 55%, transparent)` }}
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Flame className="h-4 w-4" style={{ color: cor }} />
        <span className="rotulo" style={{ color: cor }}>
          Alerta de risco
        </span>
        <span
          className="rounded-full px-2 py-0.5 text-xs font-semibold"
          style={{ backgroundColor: `color-mix(in oklch, ${cor} 22%, transparent)`, color: cor }}
        >
          {rotuloRisco(ameaca.nivel).toUpperCase()}
        </span>
        <span className="numero-tecnico ml-auto text-xs text-muted-foreground">
          {totalNoPerimetro} foco(s) dentro do perímetro de vigilância
        </span>
      </div>

      <p className="mt-2 text-sm md:text-base">
        Foco detectado a{" "}
        <strong className="numero-tecnico" style={{ color: cor }}>
          {ameaca.distanciaKm.toFixed(1)} km
        </strong>{" "}
        da sua propriedade, a {rosaDosVentos(ameaca.azimuteDoFoco)}. Direção estimada de avanço:{" "}
        <strong>{rosaDosVentos(ameaca.azimuteAvanco)}</strong>. Área potencialmente ameaçada: região{" "}
        <strong>{ameaca.setorAmeacado}</strong> da propriedade.
      </p>

      <div className="mt-3 grid gap-2 text-xs sm:grid-cols-3">
        <LinhaAlerta
          icone={<Timer className="h-3.5 w-3.5" />}
          rotulo="Tempo estimado de aproximação"
          valor={
            ameaca.horasAteChegar === null
              ? "Fogo não avança para a fazenda"
              : `~${ameaca.horasAteChegar} h no ritmo atual`
          }
        />
        <LinhaAlerta
          icone={<Compass className="h-3.5 w-3.5" />}
          rotulo="Alinhamento com a propriedade"
          valor={`${Math.round(ameaca.alinhamento * 100)}%`}
        />
        <LinhaAlerta
          icone={<Wind className="h-3.5 w-3.5" />}
          rotulo="Velocidade da frente de fogo"
          valor={`${ameaca.velocidadeAvancoKmh.toFixed(2)} km/h`}
        />
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Ação recomendada: acompanhar a situação, conferir aceiros do setor {ameaca.setorAmeacado} e
        comunicar as equipes responsáveis quando necessário.
      </p>
    </section>
  );
}

function LinhaAlerta({
  icone,
  rotulo,
  valor,
}: {
  icone: React.ReactNode;
  rotulo: string;
  valor: string;
}) {
  return (
    <div className="rounded-md border border-border bg-surface-2/40 px-3 py-2">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icone}
        <span className="rotulo">{rotulo}</span>
      </div>
      <div className="numero-tecnico mt-0.5 text-sm text-foreground">{valor}</div>
    </div>
  );
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

function ItemAmeaca({
  ameaca,
  ativo,
  onClick,
}: {
  ameaca: AmeacaFoco;
  ativo: boolean;
  onClick: () => void;
}) {
  const cor = corDoRisco(ameaca.nivel);
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-md border p-2.5 text-left transition-colors ${
        ativo ? "border-ring/70 bg-surface-2" : "border-border bg-surface-2/40 hover:bg-surface-2"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: cor }} />
        <span className="numero-tecnico text-sm font-semibold" style={{ color: cor }}>
          {ameaca.distanciaKm.toFixed(1)} km
        </span>
        <span className="text-xs text-muted-foreground">
          a {rosaDosVentos(ameaca.azimuteDoFoco)} · setor {ameaca.setorAmeacado}
        </span>
        <span className="numero-tecnico ml-auto text-xs" style={{ color: cor }}>
          {ameaca.indiceAmeaca}
        </span>
      </div>
      <div className="numero-tecnico mt-1 flex gap-3 text-[11px] text-muted-foreground">
        <span>{ameaca.foco.frpMw.toFixed(0)} MW</span>
        <span>há {ameaca.foco.horasAtras.toFixed(0)} h</span>
        <span>
          {ameaca.horasAteChegar === null ? "sem avanço p/ fazenda" : `~${ameaca.horasAteChegar} h`}
        </span>
      </div>
    </button>
  );
}

function DetalheAmeaca({ ameaca }: { ameaca: AmeacaFoco }) {
  const cor = corDoRisco(ameaca.nivel);
  const { foco } = ameaca;
  return (
    <section className="painel p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Foco em análise</h2>
        <span
          className="rounded-full px-2 py-0.5 text-xs font-semibold"
          style={{ backgroundColor: `color-mix(in oklch, ${cor} 22%, transparent)`, color: cor }}
        >
          {rotuloRisco(ameaca.nivel)}
        </span>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
        <Campo rotulo="Distância" valor={`${ameaca.distanciaKm.toFixed(1)} km`} />
        <Campo rotulo="Setor ameaçado" valor={ameaca.setorAmeacado} />
        <Campo rotulo="Coordenadas" valor={`${foco.lat.toFixed(4)}, ${foco.lon.toFixed(4)}`} />
        <Campo rotulo="Satélite" valor={foco.satelite} />
        <Campo rotulo="Potência radiativa" valor={`${foco.frpMw.toFixed(1)} MW`} />
        <Campo rotulo="Temp. estimada" valor={`${(foco.temperaturaK - 273.15).toFixed(0)} °C`} />
        <Campo rotulo="Detecção" valor={`há ${foco.horasAtras.toFixed(0)} h`} />
        <Campo
          rotulo="Avanço provável"
          valor={`${rosaDosVentos(ameaca.azimuteAvanco)} · ${Math.round(ameaca.azimuteAvanco)}°`}
        />
      </dl>
    </section>
  );
}

function Campo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <dt className="rotulo">{rotulo}</dt>
      <dd className="numero-tecnico mt-0.5 text-sm capitalize">{valor}</dd>
    </div>
  );
}
