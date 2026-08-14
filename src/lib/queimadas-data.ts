/**
 * Camada de dados do AtmosFogo.
 *
 * Tudo aqui é MOCK determinístico, com o mesmo formato que APIs reais
 * (INPE Programa Queimadas / NASA FIRMS para focos, Open-Meteo para vento).
 * Para plugar dados reais, basta reimplementar `carregarRegiao` mantendo os tipos.
 */

export type NivelRisco = "baixo" | "medio" | "alto" | "critico";

export interface Regiao {
  id: string;
  nome: string;
  uf: string;
  lat: number;
  lon: number;
  /** bounding box [oeste, sul, leste, norte] */
  bbox: [number, number, number, number];
}

export interface Vento {
  velocidadeKmh: number;
  rajadaKmh: number;
  /** graus meteorológicos: direção DE onde o vento vem */
  direcaoGraus: number;
}

export interface HoraPrevisao {
  hora: string;
  velocidadeKmh: number;
  direcaoGraus: number;
  temperaturaC: number;
}

export interface Foco {
  id: string;
  lat: number;
  lon: number;
  /** potência radiativa do fogo em MW */
  frpMw: number;
  temperaturaK: number;
  detectadoEm: string;
  horasAtras: number;
  satelite: string;
  municipio: string;
  risco: NivelRisco;
  /** direção provável de avanço das chamas, em graus (para onde vai) */
  avancoGraus: number;
  indicePropagacao: number;
}

export interface CondicoesRegiao {
  temperaturaC: number;
  umidadePercent: number;
  temperaturaSuperficieC: number;
  precipitacao7dMm: number;
  vento: Vento;
}

export interface SerieDia {
  dia: string;
  focos: number;
}

export interface DadosRegiao {
  regiao: Regiao;
  condicoes: CondicoesRegiao;
  focos: Foco[];
  previsao: HoraPrevisao[];
  serie: SerieDia[];
  indiceRiscoRegiao: number;
  atualizadoEm: string;
}

export const REGIOES: Regiao[] = [
  {
    id: "novo-progresso-pa",
    nome: "Novo Progresso",
    uf: "PA",
    lat: -7.14,
    lon: -55.38,
    bbox: [-56.4, -8.1, -54.4, -6.2],
  },
  {
    id: "corumba-ms",
    nome: "Corumbá (Pantanal)",
    uf: "MS",
    lat: -19.0,
    lon: -57.65,
    bbox: [-58.6, -19.9, -56.7, -18.1],
  },
  {
    id: "porto-velho-ro",
    nome: "Porto Velho",
    uf: "RO",
    lat: -8.76,
    lon: -63.9,
    bbox: [-64.9, -9.7, -62.9, -7.8],
  },
  {
    id: "chapada-veadeiros-go",
    nome: "Chapada dos Veadeiros",
    uf: "GO",
    lat: -14.13,
    lon: -47.52,
    bbox: [-48.5, -15.0, -46.5, -13.2],
  },
  {
    id: "sao-felix-mt",
    nome: "São Félix do Araguaia",
    uf: "MT",
    lat: -11.61,
    lon: -50.67,
    bbox: [-51.6, -12.5, -49.7, -10.7],
  },
];

const SATELITES = ["AQUA_M-T", "TERRA_M-M", "NOAA-20", "GOES-16", "SUOMI-NPP"];

/** PRNG determinístico — mesma região sempre gera o mesmo cenário. */
function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}

function hash(txt: string) {
  let h = 2166136261;
  for (let i = 0; i < txt.length; i++) {
    h ^= txt.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function rosaDosVentos(graus: number) {
  const pontos = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO"];
  return pontos[Math.round(((graus % 360) / 22.5)) % 16];
}

export function kmhParaNos(kmh: number) {
  return kmh / 1.852;
}

export function corDoRisco(risco: NivelRisco) {
  return {
    baixo: "var(--risco-baixo)",
    medio: "var(--risco-medio)",
    alto: "var(--risco-alto)",
    critico: "var(--risco-critico)",
  }[risco];
}

export function rotuloRisco(risco: NivelRisco) {
  return { baixo: "Baixo", medio: "Médio", alto: "Alto", critico: "Crítico" }[risco];
}

/**
 * Índice de propagação (0-100): combina vento, temperatura, umidade e
 * intensidade do foco. Fórmula simplificada inspirada no FWI.
 */
export function calcularIndicePropagacao(args: {
  ventoKmh: number;
  temperaturaC: number;
  umidadePercent: number;
  frpMw: number;
}) {
  const fVento = Math.min(args.ventoKmh / 45, 1) * 38;
  const fTemp = Math.min(Math.max(args.temperaturaC - 20, 0) / 20, 1) * 24;
  const fUmid = Math.min(Math.max(70 - args.umidadePercent, 0) / 55, 1) * 22;
  const fFrp = Math.min(args.frpMw / 220, 1) * 16;
  return Math.round(Math.min(fVento + fTemp + fUmid + fFrp, 100));
}

function nivelPorIndice(indice: number): NivelRisco {
  if (indice >= 78) return "critico";
  if (indice >= 58) return "alto";
  if (indice >= 36) return "medio";
  return "baixo";
}

export function carregarRegiao(regiaoId: string, referencia = 0): DadosRegiao {
  const regiao = REGIOES.find((r) => r.id === regiaoId) ?? REGIOES[0];
  const r = rng(hash(regiao.id) + referencia);

  const temperaturaC = 26 + r() * 12;
  const umidadePercent = 14 + r() * 44;
  const ventoBase = 6 + r() * 30;
  const direcaoBase = Math.floor(r() * 360);

  const condicoes: CondicoesRegiao = {
    temperaturaC: Number(temperaturaC.toFixed(1)),
    umidadePercent: Math.round(umidadePercent),
    temperaturaSuperficieC: Number((temperaturaC + 6 + r() * 10).toFixed(1)),
    precipitacao7dMm: Number((r() * 18).toFixed(1)),
    vento: {
      velocidadeKmh: Number(ventoBase.toFixed(1)),
      rajadaKmh: Number((ventoBase * (1.3 + r() * 0.5)).toFixed(1)),
      direcaoGraus: direcaoBase,
    },
  };

  const [oeste, sul, leste, norte] = regiao.bbox;
  const total = 14 + Math.floor(r() * 22);
  const focos: Foco[] = Array.from({ length: total }, (_, i) => {
    const frpMw = Number((4 + Math.pow(r(), 2.1) * 260).toFixed(1));
    const horasAtras = Number((r() * 168).toFixed(1));
    const ventoLocal = ventoBase * (0.75 + r() * 0.6);
    const indice = calcularIndicePropagacao({
      ventoKmh: ventoLocal,
      temperaturaC: temperaturaC + r() * 4,
      umidadePercent,
      frpMw,
    });
    const detectadoEm = new Date(Date.UTC(2026, 7, 14, 22, 0) - horasAtras * 3600_000).toISOString();
    return {
      id: `${regiao.id}-${i.toString().padStart(2, "0")}`,
      lat: Number((sul + r() * (norte - sul)).toFixed(4)),
      lon: Number((oeste + r() * (leste - oeste)).toFixed(4)),
      frpMw,
      temperaturaK: Math.round(305 + Math.pow(r(), 1.5) * 105),
      detectadoEm,
      horasAtras,
      satelite: SATELITES[Math.floor(r() * SATELITES.length)],
      municipio: regiao.nome,
      risco: nivelPorIndice(indice),
      avancoGraus: (direcaoBase + 180 + (r() * 40 - 20) + 360) % 360,
      indicePropagacao: indice,
    };
  }).sort((a, b) => b.indicePropagacao - a.indicePropagacao);

  const previsao: HoraPrevisao[] = Array.from({ length: 24 }, (_, h) => ({
    hora: `${((19 + h) % 24).toString().padStart(2, "0")}h`,
    velocidadeKmh: Number(Math.max(2, ventoBase + Math.sin(h / 3.4) * 8 + (r() * 5 - 2.5)).toFixed(1)),
    direcaoGraus: (direcaoBase + Math.sin(h / 5) * 42 + 360) % 360,
    temperaturaC: Number((temperaturaC + Math.sin((h - 4) / 3.8) * 6).toFixed(1)),
  }));

  const serie: SerieDia[] = Array.from({ length: 7 }, (_, d) => ({
    dia: `D-${6 - d}`,
    focos: Math.round(total * (0.45 + r() * 0.9)),
  }));

  const indiceRiscoRegiao = calcularIndicePropagacao({
    ventoKmh: ventoBase,
    temperaturaC,
    umidadePercent,
    frpMw: focos.reduce((acc, f) => acc + f.frpMw, 0) / Math.max(focos.length, 1),
  });

  return {
    regiao,
    condicoes,
    focos,
    previsao,
    serie,
    indiceRiscoRegiao,
    atualizadoEm: "14/08/2026 19:00 (BRT)",
  };
}
