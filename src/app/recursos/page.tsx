import { recursos } from "@/content/recursos"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface Params {
  searchParams: Promise<{ tipo?: string; materia?: string }>
}

const tipos = ["todos", "curso", "paper", "herramienta", "video", "otro"] as const

export default async function RecursosPage({ searchParams }: Params) {
  const params = await searchParams
  const tipo = params.tipo || "todos"
  const materia = params.materia || "todos"

  let filtered = recursos
  if (tipo !== "todos") {
    filtered = filtered.filter((r) => r.tipo === tipo)
  }
  if (materia !== "todos") {
    filtered = filtered.filter((r) => r.materiaSlug === materia)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-accent mb-2">Recursos</h1>
        <p className="text-muted-foreground">Cursos, papers, herramientas y videos curados</p>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {tipos.map((t) => (
            <a
              key={t}
              href={t === "todos" ? "/recursos" : `/recursos?tipo=${t}`}
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
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((r) => (
          <a
            key={r.id}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-surface border border-border rounded-lg p-4 hover:border-accent/50 transition-colors group"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-medium group-hover:text-accent transition-colors">{r.titulo}</h3>
              <Badge variant="tech">{r.tipo}</Badge>
            </div>
            {r.descripcion && (
              <p className="text-sm text-muted-foreground mb-3">{r.descripcion}</p>
            )}
            {r.tags && (
              <div className="flex gap-1 flex-wrap">
                {r.tags.map((tag) => (
                  <span key={tag} className="text-xs font-mono px-2 py-0.5 bg-background rounded border border-border">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </a>
        ))}
      </div>
    </div>
  )
}