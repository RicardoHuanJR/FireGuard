import { Link } from "@tanstack/react-router";
import { Flame, Satellite } from "lucide-react";

const ITENS = [
  { to: "/", rotulo: "Painel" },
  { to: "/orientacoes", rotulo: "Orientações" },
  { to: "/planos", rotulo: "Planos" },
] as const;

export function NavTopo({ direita }: { direita?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Link to="/" className="flex items-center gap-2.5">
        <span className="relative flex h-9 w-9 items-center justify-center rounded-md bg-fogo/15 text-fogo">
          <Flame className="h-5 w-5" />
          <Satellite className="absolute -right-1 -bottom-1 h-3.5 w-3.5 text-vento" />
        </span>
        <div>
          <h1 className="text-base leading-none font-semibold tracking-tight">
            FireGuard <span className="text-vento">Sat</span>
          </h1>
          <p className="rotulo mt-1">Detectar antes. Alertar a tempo.</p>
        </div>
      </Link>

      <nav className="flex items-center gap-1">
        {ITENS.map((i) => (
          <Link
            key={i.to}
            to={i.to}
            activeOptions={{ exact: i.to === "/" }}
            className="rounded-md border border-transparent px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "border-ring/60 bg-surface-2 text-foreground" }}
          >
            {i.rotulo}
          </Link>
        ))}
      </nav>

      {direita && <div className="ml-auto flex items-center gap-4">{direita}</div>}
    </div>
  );
}
