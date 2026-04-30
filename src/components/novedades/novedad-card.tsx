import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import type { Novedad } from "@/content/novedades"

interface NovedadCardProps {
  novedad: Novedad
}

export function NovedadCard({ novedad }: NovedadCardProps) {
  const variant = novedad.tipo === 'tech' ? 'tech' : novedad.tipo === 'aviso' ? 'aviso' : 'institucional'

  return (
    <Link
      href={`/novedades#${novedad.id}`}
      className="block bg-surface border border-border rounded-lg p-4 hover:border-accent/50 transition-colors group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-medium group-hover:text-accent transition-colors line-clamp-2">
          {novedad.titulo}
        </h3>
        {novedad.destacada && (
          <span className="shrink-0 text-accent">★</span>
        )}
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{novedad.contenido}</p>
      <div className="flex items-center gap-2">
        <Badge variant={variant}>{novedad.tipo}</Badge>
        <span className="text-xs text-muted-foreground font-mono">{novedad.fecha}</span>
      </div>
    </Link>
  );
}