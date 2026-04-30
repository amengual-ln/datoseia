import { novedades } from "@/content/novedades"
import { NovedadCard } from "@/components/novedades/novedad-card"
import { Badge } from "@/components/ui/badge"

interface Params {
  searchParams: Promise<{ tipo?: string }>
}

const tipos = ["todos", "institucional", "tech", "aviso"] as const

export default async function NovedadesPage({ searchParams }: Params) {
  const params = await searchParams
  const tipo = params.tipo || "todos"

  const filtered = tipo === "todos"
    ? novedades
    : novedades.filter((n) => n.tipo === tipo)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-accent mb-2">Novedades</h1>
        <p className="text-muted-foreground">Noticias institucionales, avisos y contenido tech</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tipos.map((t) => (
          <a
            key={t}
            href={t === "todos" ? "/novedades" : `/novedades?tipo=${t}`}
            className={`px-3 py-1.5 text-sm font-mono rounded border transition-colors ${
              tipo === t
                ? "bg-accent text-background border-accent"
                : "bg-surface border-border hover:border-accent"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </a>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((n) => (
          <NovedadCard key={n.id} novedad={n} />
        ))}
      </div>
    </div>
  )
}