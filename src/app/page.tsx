import { novedades } from "@/content/novedades"
import { materias } from "@/content/materias"
import { MateriaCard } from "@/components/calendario/materia-card"
import { NovedadCard } from "@/components/novedades/novedad-card"
import Link from "next/link"

export default function HomePage() {
  const featuredNews = [...novedades]
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 3)

  const today = new Date().getDay()
  const dayMap: Record<number, string> = {
    1: "lunes",
    2: "martes",
    3: "miércoles",
    4: "jueves",
    5: "viernes",
  }
  const todayKey = dayMap[today]
  const todayCourses = todayKey
    ? materias.filter((m) =>
        m.horarios.some((h) => h.dia === todayKey)
      ).slice(0, 3)
    : []

  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold text-accent">datoseia</h1>
        <p className="text-lg text-muted-foreground">
          Técnico Superior en Data Science e Inteligencia Artificial — ISFT 199
        </p>
      </section>

      {todayCourses.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Clases de hoy</h2>
            <Link href="/calendario" className="text-sm text-accent hover:underline">
              Ver calendario →
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {todayCourses.map((m) => (
              <MateriaCard key={m.slug} materia={m} />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Últimas novedades</h2>
          <Link href="/novedades" className="text-sm text-accent hover:underline">
            Ver todas →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {featuredNews.map((n) => (
            <NovedadCard key={n.id} novedad={n} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Accesos rápidos</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/materias" className="bg-surface border border-border rounded-lg p-4 hover:border-accent/50 transition-colors">
            <h3 className="font-medium text-accent mb-1">Materias</h3>
            <p className="text-sm text-muted-foreground">Ver todos los cursos</p>
          </Link>
          <Link href="/recursos" className="bg-surface border border-border rounded-lg p-4 hover:border-accent/50 transition-colors">
            <h3 className="font-medium text-accent mb-1">Recursos</h3>
            <p className="text-sm text-muted-foreground">Cursos y herramientas</p>
          </Link>
          <Link href="/resumenes" className="bg-surface border border-border rounded-lg p-4 hover:border-accent/50 transition-colors">
            <h3 className="font-medium text-accent mb-1">Resúmenes</h3>
            <p className="text-sm text-muted-foreground">Apuntes de clases</p>
          </Link>
          <Link href="/chat" className="bg-surface border border-border rounded-lg p-4 hover:border-accent/50 transition-colors">
            <h3 className="font-medium text-accent mb-1">Chat IA</h3>
            <p className="text-sm text-muted-foreground">Preguntá sobre la carrera</p>
          </Link>
        </div>
      </section>
    </div>
  )
}