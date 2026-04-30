import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import type { Materia } from "@/content/materias"

interface MateriaDetailProps {
  materia: Materia
}

const diasMap: Record<string, string> = {
  lunes: "Lun",
  martes: "Mar",
  miércoles: "Mié",
  jueves: "Jue",
  viernes: "Vie",
}

export function MateriaDetail({ materia }: MateriaDetailProps) {
  return (
    <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-accent mb-2">{materia.nombre}</h1>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="institucional">{materia.año}º Año</Badge>
          <Badge>{materia.semestre}º Semestre</Badge>
        </div>
      </div>

      {materia.docente && (
        <div className="border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">Docente</p>
          <p className="font-medium">{materia.docente}</p>
        </div>
      )}

      {materia.descripcion && (
        <div className="border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">Descripción</p>
          <p>{materia.descripcion}</p>
        </div>
      )}

      {materia.objetivos && (
        <div className="border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">Objetivos</p>
          <p>{materia.objetivos}</p>
        </div>
      )}

      <div className="border-t border-border pt-4">
        <p className="text-sm text-muted-foreground mb-2">Horarios</p>
        <div className="flex flex-wrap gap-2">
          {materia.horarios.map((h, i) => (
            <div key={i} className="bg-background px-3 py-1.5 rounded border border-border text-sm font-mono">
              <span className="text-accent">{diasMap[h.dia] || h.dia}</span>{" "}
              {h.inicio} - {h.fin}
              {h.aula && <span className="text-muted-foreground ml-2">📍 {h.aula}</span>}
            </div>
          ))}
        </div>
      </div>

      {materia.links && materia.links.length > 0 && (
        <div className="border-t border-border pt-4">
          <p className="text-sm text-muted-foreground mb-2">Links</p>
          <div className="flex flex-wrap gap-2">
            {materia.links.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm px-3 py-1.5 bg-accent/10 text-accent border border-accent/30 rounded hover:bg-accent/20 transition-colors"
              >
                {link.label} ↗
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-border pt-4">
        <Link
          href={`/materias/${materia.slug}`}
          className="text-sm text-accent hover:underline"
        >
          Ver página completa →
        </Link>
      </div>
    </div>
  );
}