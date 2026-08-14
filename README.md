# AtmosFogo

Protótipo de painel de monitoramento ambiental para acompanhamento de **focos de queimadas**, **direção e velocidade do vento** e **dados termológicos** por região. Ideal para centros de comando, salas de situação e pesquisa ambiental.

## O que ele faz

- Mapa interativo da região (camadas de focos de fogo, calor térmico e campo de vento).
- Indicadores de direção e velocidade do vento com rosa dos ventos.
- Painel de risco de propagação de incêndios.
- Lista de alertas ordenada por severidade e filtrável por período.
- Detalhes de cada foco: temperatura, FRP (potência radiativa do fogo), horário de detecção e índice de risco.

> Os dados atuais são **simulados** para demonstração, prontos para serem trocados por APIs reais como INPE, FIRMS/NASA e Open-Meteo.

## Requisitos

- [Node.js](https://nodejs.org/) 18+ (recomendado 20 ou 22)
- npm (ou [Bun](https://bun.sh/))

## Como rodar no seu PC

1. **Baixe e extraia o projeto**

   ```bash
   unzip atmosfogo-source.zip -d atmosfogo
   cd atmosfogo
   ```

2. **Instale as dependências**

   Com npm:
   ```bash
   npm install
   ```

   Com Bun:
   ```bash
   bun install
   ```

3. **Inicie o servidor de desenvolvimento**

   Com npm:
   ```bash
   npm run dev
   ```

   Com Bun:
   ```bash
   bun run dev
   ```

4. **Abra no navegador**

   Acesse: `http://localhost:8080`

## Scripts disponíveis

| Script | O que faz |
| --- | --- |
| `npm run dev` | Inicia o servidor local com recarga automática |
| `npm run build` | Gera a versão otimizada para produção na pasta `dist/` |
| `npm run build:dev` | Gera a versão de desenvolvimento |
| `npm run preview` | Serve a versão de produção localmente |
| `npm run lint` | Executa a verificação de código com ESLint |
| `npm run format` | Formata os arquivos com Prettier |

## Estrutura do projeto

```
/
├── public/                 # Arquivos estáticos (favicon, robots.txt)
├── src/
│   ├── components/         # Componentes React
│   │   ├── ui/             # Componentes de interface do shadcn/ui
│   │   └── MapaRegiao.tsx  # Mapa SVG interativo com camadas de vento, calor e focos
│   ├── hooks/              # Hooks customizados
│   │   └── use-mobile.tsx
│   ├── lib/                # Utilitários e dados
│   │   ├── queimadas-data.ts  # Geração dos dados simulados (regiões, vento, focos)
│   │   ├── utils.ts           # Funções auxiliares (cn, formatadores)
│   │   └── error-*.ts         # Captura e relatório de erros
│   ├── routes/             # Rotas do TanStack Router
│   │   ├── __root.tsx      # Layout raiz (cabeçalho, tema, providers)
│   │   └── index.tsx       # Dashboard principal do AtmosFogo
│   ├── router.tsx          # Configuração do roteador
│   ├── server.ts           # Configuração do servidor SSR
│   ├── start.ts            # Ponto de entrada do TanStack Start
│   └── styles.css          # Design system, tokens de cor e animações
├── .lovable/               # Configuração do projeto Lovable
├── package.json            # Dependências e scripts
├── vite.config.ts          # Configuração do Vite
├── tsconfig.json           # Configuração do TypeScript
└── README.md               # Este arquivo
```

## Onde estão os dados e como trocar por reais

Todos os dados de demonstração estão em `src/lib/queimadas-data.ts`.

Lá você encontra as funções que geram:

- `regioes`: lista de regiões monitoradas com coordenadas geográficas.
- `windField`: condições atuais de vento (velocidade, rajadas, direção).
- `focos`: focos de queimadas com temperatura, FRP, risco de propagação e horário.
- `generateForecast`: previsão de vento para as próximas horas.
- `generateFireHistory`: histórico de focos por hora.
- `alertas`: lista de alertas gerados a partir dos focos.

Para conectar a APIs reais, substitua essas funções por chamadas a serviços como:

- **INPE Queimadas** — focos de queimadas no Brasil.
- **NASA FIRMS** — dados de focos de calor global.
- **Open-Meteo** — previsão meteorológica e vento.

## Tecnologias

- [TanStack Start](https://tanstack.com/start) — framework full-stack React
- [TanStack Router](https://tanstack.com/router) — roteamento tipado
- [React 19](https://react.dev/) — biblioteca de UI
- [TypeScript](https://www.typescriptlang.org/) — tipagem estática
- [Tailwind CSS v4](https://tailwindcss.com/) — estilização utilitária
- [shadcn/ui](https://ui.shadcn.com/) — componentes de interface
- [Recharts](https://recharts.org/) — gráficos
- [Vite](https://vitejs.dev/) — build e dev server

## Próximos passos sugeridos

1. Publique o app para acessá-lo de qualquer lugar.
2. Conecte uma fonte de dados real de focos de calor.
3. Adicione autenticação para salvar regiões favoritas.
4. Crie notificações automáticas para alertas críticos.
