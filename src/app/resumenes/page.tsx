import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default async function ResumenesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-accent mb-2">Resúmenes</h1>
        <p className="text-muted-foreground">Apuntes y resúmenes de clases</p>
      </div>
      <p className="text-muted-foreground">Próximamente.</p>
    </div>
  )
}