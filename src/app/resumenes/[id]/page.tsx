import { notFound } from "next/navigation"
import Link from "next/link"
import fs from "fs"
import path from "path"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import { Badge } from "@/components/ui/badge"

interface Params {
  params: Promise<{ id: string }>
}

export async function generateStaticParams() {
  const dir = path.join(process.cwd(), "src/content/resumenes")
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({ id: f.replace(".md", "") }))
}

export default async function ResumenPage({ params }: Params) {
  const { id } = await params
  const filePath = path.join(process.cwd(), "src/content/resumenes", `${id}.md`)

  if (!fs.existsSync(filePath)) {
    notFound()
  }

  const content = fs.readFileSync(filePath, "utf-8")
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)/)

  if (!frontmatterMatch) {
    notFound()
  }

  const frontmatter: Record<string, string> = {}
  frontmatterMatch[1].split("\n").forEach((line) => {
    const [key, ...valueParts] = line.split(": ")
    if (key && valueParts.length) {
      frontmatter[key.trim()] = valueParts.join(": ").trim()
    }
  })

  const markdownContent = frontmatterMatch[2]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-accent mb-2">{frontmatter.titulo || id}</h1>
        <div className="flex flex-wrap gap-2">
          {frontmatter.materiaSlug && (
            <Link href={`/materias/${frontmatter.materiaSlug}`}>
              <Badge variant="institucional">{frontmatter.materiaSlug}</Badge>
            </Link>
          )}
          {frontmatter.fechaClase && (
            <span className="text-sm text-muted-foreground font-mono">{frontmatter.fechaClase}</span>
          )}
        </div>
      </div>
      <MarkdownRenderer content={markdownContent} />
    </div>
  )
}