import type { Materia } from "@/content/materias"
import Link from "next/link"

interface MateriaCardProps {
  materia: Materia
}

const diasMap: Record<string, string> = {
  lunes: "Lun",
  martes: "Mar",
  miércoles: "Mié",
  jueves: "Jue",
  viernes: "Vie",
}

export function MateriaCard({ materia }: MateriaCardProps) {
  return (
    <Link
      href={`/materias/${materia.slug}`}
      className="block bg-surface border border-border rounded-lg p-4 hover:border-accent/50 transition-colors group"
    >
      <h3 className="font-medium text-accent group-hover:underline mb-1">{materia.nombre}</h3>
      {materia.docente && (
        <p className="text-sm text-muted-foreground mb-2">{materia.docente}</p>
      )}
      <div className="flex flex-wrap gap-1">
        {materia.horarios.map((h, i) => (
          <span key={i} className="text-xs font-mono px-2 py-0.5 bg-background rounded border border-border">
            {diasMap[h.dia] || h.dia} {h.inicio}-{h.fin}
          </span>
        ))}
      </div>
    </Link>
  );
}