import { notFound } from "next/navigation"
import { materias } from "@/content/materias"
import { MateriaDetail } from "@/components/materias/materia-detail"

interface Params {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return materias.map((m) => ({ slug: m.slug }))
}

export default async function MateriaSlugPage({ params }: Params) {
  const { slug } = await params
  const materia = materias.find((m) => m.slug === slug)

  if (!materia) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <MateriaDetail materia={materia} />
    </div>
  )
}