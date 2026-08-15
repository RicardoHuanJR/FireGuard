import { useMemo } from "react";
import type { AmeacaFoco, DadosRegiao, Foco, Propriedade } from "@/lib/queimadas-data";
import { corDoRisco } from "@/lib/queimadas-data";

const W = 1000;
const H = 660;

interface Props {
  dados: DadosRegiao;
  camadas: { focos: boolean; termal: boolean; vento: boolean; propriedade: boolean };
  focoSelecionado: string | null;
  onSelecionarFoco: (id: string) => void;
  propriedade: Propriedade;
  ameacaPrincipal?: AmeacaFoco | null;
}

export function MapaRegiao({
  dados,
  camadas,
  focoSelecionado,
  onSelecionarFoco,
  propriedade,
  ameacaPrincipal,
}: Props) {
  const [oeste, sul, leste, norte] = dados.regiao.bbox;


  const proj = useMemo(
    () => (lon: number, lat: number) => ({
      x: Number((((lon - oeste) / (leste - oeste)) * W).toFixed(2)),
      y: Number((((norte - lat) / (norte - sul)) * H).toFixed(2)),
    }),
    [oeste, leste, sul, norte],
  );

  /** pixels do viewBox por km, usando a largura da bbox. */
  const pxPorKm = useMemo(() => {
    const kmLargura = (leste - oeste) * 111.32 * Math.cos((((norte + sul) / 2) * Math.PI) / 180);
    return W / Math.max(kmLargura, 1);
  }, [oeste, leste, norte, sul]);



  const gridVento = useMemo(() => {
    const cols = 13;
    const rows = 9;
    const pontos: { x: number; y: number; ang: number; forca: number }[] = [];
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = Number((((i + 0.5) / cols) * W).toFixed(2));
        const y = Number((((j + 0.5) / rows) * H).toFixed(2));
        const jitter = Math.sin(i * 1.7 + j * 2.3) * 16;
        pontos.push({
          x,
          y,
          ang: Number((dados.condicoes.vento.direcaoGraus + 180 + jitter).toFixed(2)),
          forca: Number((0.55 + Math.abs(Math.sin(i * 0.8 + j * 1.1)) * 0.45).toFixed(3)),
        });
      }
    }
    return pontos;
  }, [dados.condicoes.vento.direcaoGraus]);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-full w-full"
      role="img"
      aria-label={`Mapa de focos de calor em ${dados.regiao.nome}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="grad-termal">
          <stop offset="0%" stopColor="var(--fogo-forte)" stopOpacity="0.55" />
          <stop offset="55%" stopColor="var(--fogo)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="var(--fogo)" stopOpacity="0" />
        </radialGradient>
        <pattern id="grade" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M50 0 L0 0 0 50" fill="none" stroke="var(--grade)" strokeWidth="1" />
        </pattern>
        <linearGradient id="relevo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.24 0.03 165)" />
          <stop offset="60%" stopColor="oklch(0.21 0.022 200)" />
          <stop offset="100%" stopColor="oklch(0.2 0.02 250)" />
        </linearGradient>
      </defs>

      <rect width={W} height={H} fill="url(#relevo)" />

      {/* massas de vegetação / hidrografia estilizadas */}
      <g opacity="0.5">
        <path
          d="M-20 120 C 180 60, 320 200, 520 150 S 860 90, 1040 170 L1040 -20 L-20 -20 Z"
          fill="oklch(0.26 0.045 158)"
          opacity="0.55"
        />
        <path
          d="M-20 560 C 200 520, 340 640, 560 600 S 880 540, 1040 590 L1040 700 L-20 700 Z"
          fill="oklch(0.25 0.04 150)"
          opacity="0.5"
        />
        <path
          d="M60 700 C 200 520, 300 460, 420 380 S 620 250, 720 -20"
          fill="none"
          stroke="oklch(0.42 0.08 225)"
          strokeWidth="9"
          strokeLinecap="round"
          opacity="0.7"
        />
        <path
          d="M980 660 C 860 540, 760 520, 640 420 S 470 330, 420 380"
          fill="none"
          stroke="oklch(0.42 0.08 225)"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.6"
        />
      </g>

      <rect width={W} height={H} fill="url(#grade)" opacity="0.55" />

      {/* Camada termal */}
      {camadas.termal && (
        <g>
          {dados.focos.map((f) => {
            const { x, y } = proj(f.lon, f.lat);
            const r = Number((40 + (f.frpMw / 260) * 130).toFixed(2));
            return <circle key={`t-${f.id}`} cx={x} cy={y} r={r} fill="url(#grad-termal)" />;
          })}
        </g>
      )}

      {/* Camada de vento */}
      {camadas.vento && (
        <g stroke="var(--vento)" strokeLinecap="round" fill="none">
          {gridVento.map((p, i) => (
            <g key={`v-${i}`} transform={`translate(${p.x} ${p.y}) rotate(${p.ang})`} opacity={Number((0.25 + p.forca * 0.4).toFixed(3))}>
              <path
                d="M0 14 L0 -14"
                strokeWidth={Number((1.6 * p.forca + 0.5).toFixed(3))}
                strokeDasharray="6 6"
                className="animate-[fluxo_2.4s_linear_infinite]"
              />
              <path d="M-4 -8 L0 -15 L4 -8" strokeWidth={1.5} />
            </g>
          ))}
        </g>
      )}

      {/* Camada de focos */}
      {camadas.focos && (
        <g>
          {dados.focos.map((f) => (
            <MarcadorFoco
              key={f.id}
              foco={f}
              pos={proj(f.lon, f.lat)}
              selecionado={focoSelecionado === f.id}
              onClick={() => onSelecionarFoco(f.id)}
            />
          ))}
        </g>
      )}

      {/* Cone de possível propagação até a propriedade */}
      {ameacaPrincipal && camadas.propriedade && (() => {
        const p = proj(ameacaPrincipal.foco.lon, ameacaPrincipal.foco.lat);
        const alcance = Number(
          Math.min(Math.max(ameacaPrincipal.distanciaKm * 1.35, 8) * pxPorKm, 900).toFixed(2),
        );
        const meia = Math.tan((28 * Math.PI) / 180) * alcance;
        return (
          <g transform={`translate(${p.x} ${p.y}) rotate(${ameacaPrincipal.azimuteAvanco.toFixed(1)})`}>
            <path
              d={`M0 0 L${(-meia).toFixed(2)} ${(-alcance).toFixed(2)} L${meia.toFixed(2)} ${(-alcance).toFixed(2)} Z`}
              fill="var(--fogo)"
              opacity="0.16"
              stroke="var(--fogo)"
              strokeOpacity="0.45"
              strokeWidth="2"
              strokeDasharray="8 7"
            />
          </g>
        );
      })()}

      {/* Camada da propriedade */}
      {camadas.propriedade && (() => {
        const p = proj(propriedade.lon, propriedade.lat);
        const rProp = Number((propriedade.raioKm * pxPorKm).toFixed(2));
        const rAlerta = Number((propriedade.perimetroAlertaKm * pxPorKm).toFixed(2));
        return (
          <g>
            <circle
              cx={p.x}
              cy={p.y}
              r={rAlerta}
              fill="none"
              stroke="var(--vento)"
              strokeOpacity="0.5"
              strokeWidth="2"
              strokeDasharray="10 10"
            />
            <circle cx={p.x} cy={p.y} r={rProp} fill="var(--vento)" opacity="0.14" />
            <circle cx={p.x} cy={p.y} r={rProp} fill="none" stroke="var(--vento)" strokeWidth="2.5" />
            <g transform={`translate(${p.x} ${p.y})`}>
              <path
                d="M-13 6 L0 -8 L13 6 Z"
                fill="var(--vento)"
                stroke="oklch(0.17 0.012 260)"
                strokeWidth="1.5"
              />
              <rect x="-8" y="6" width="16" height="10" fill="var(--vento)" />
              <text
                y="34"
                textAnchor="middle"
                fontSize="17"
                fill="var(--foreground)"
                className="numero-tecnico"
              >
                {propriedade.nome}
              </text>
              <title>{`${propriedade.nome} — ${propriedade.hectares} ha`}</title>
            </g>
          </g>
        );
      })()}



      {/* Escala e coordenadas */}
      <g className="numero-tecnico" fill="var(--muted-foreground)" fontSize="16">
        <text x="18" y="30">
          {norte.toFixed(2)}°
        </text>
        <text x="18" y={H - 16}>
          {sul.toFixed(2)}°
        </text>
        <text x={W - 90} y={H - 16}>
          {leste.toFixed(2)}°
        </text>
      </g>
      <g>
        <line x1={140} y1={H - 30} x2={270} y2={H - 30} stroke="var(--foreground)" strokeWidth="3" />
        <text
          x={140}
          y={H - 40}
          fill="var(--foreground)"
          fontSize="16"
          className="numero-tecnico"
          opacity="0.8"
        >
          50 km
        </text>
      </g>
    </svg>
  );
}

function MarcadorFoco({
  foco,
  pos,
  selecionado,
  onClick,
}: {
  foco: Foco;
  pos: { x: number; y: number };
  selecionado: boolean;
  onClick: () => void;
}) {
  const cor = corDoRisco(foco.risco);
  const r = Number((5 + (foco.frpMw / 260) * 10).toFixed(2));
  const critico = foco.risco === "critico" || foco.risco === "alto";

  return (
    <g transform={`translate(${pos.x} ${pos.y})`} onClick={onClick} style={{ cursor: "pointer" }}>
      {critico && <circle r={r} fill={cor} opacity="0.5" style={{ animation: "pulso-foco 1.8s ease-out infinite" }} />}
      {selecionado && (
        <>
          <circle r={r + 14} fill="none" stroke="var(--foreground)" strokeWidth="2" strokeDasharray="4 5" />
          <g stroke={cor} strokeWidth="2.5" strokeLinecap="round" transform={`rotate(${foco.avancoGraus})`}>
            <path d={`M0 ${-(r + 6)} L0 ${-(r + 40)}`} />
            <path d={`M-7 ${-(r + 30)} L0 ${-(r + 42)} L7 ${-(r + 30)}`} fill="none" />
          </g>
        </>
      )}
      <circle r={r} fill={cor} stroke="oklch(0.17 0.012 260)" strokeWidth="1.5" />
      <circle r={r * 0.4} fill="oklch(0.98 0.03 90)" opacity="0.85" />
      <title>{`${foco.frpMw} MW · índice ${foco.indicePropagacao}`}</title>
    </g>
  );
}
