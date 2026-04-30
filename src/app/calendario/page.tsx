import { materias } from "@/content/materias"
import { SemanaGrid } from "@/components/calendario/semana-grid"

interface Params {
  searchParams: Promise<{ año?: string; semestre?: string }>
}

export default async function CalendarioPage({ searchParams }: Params) {
  const params = await searchParams
  const año = (Number(params.año) as 1 | 2 | 3) || 3
  const semestre = (Number(params.semestre) as 1 | 2) || 1

  const filtered = materias.filter((m) => m.año === año && m.semestre === semestre)
  const allHorarios = filtered.flatMap((m) => m.horarios)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-accent mb-2">Calendario</h1>
        <p className="text-muted-foreground">Horario semanal por año y semestre</p>
      </div>
      <SemanaGrid horarios={allHorarios} año={año} semestre={semestre} />
    </div>
  )
}