import { materias } from "@/content/materias"
import { MateriaCard } from "@/components/calendario/materia-card"
import { AñoSemestreSelector } from "@/components/materias/año-semestre-selector"

interface Params {
  searchParams: Promise<{ año?: string; semestre?: string }>
}

export default async function MateriasPage({ searchParams }: Params) {
  const params = await searchParams
  const año = (Number(params.año) as 1 | 2 | 3) || 3
  const semestre = (Number(params.semestre) as 1 | 2) || 1

  const filtered = materias.filter((m) => m.año === año && m.semestre === semestre)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-accent mb-2">Materias</h1>
        <p className="text-muted-foreground">Cursos del Técnico Superior en Data Science e Inteligencia Artificial</p>
      </div>
      <AñoSemestreSelector año={año} semestre={semestre} onChange={() => {}} />
      {filtered.length === 0 ? (
        <p className="text-muted-foreground">No hay materias para este período</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <MateriaCard key={m.slug} materia={m} />
          ))}
        </div>
      )}
    </div>
  )
}