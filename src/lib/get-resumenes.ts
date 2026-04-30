import fs from "fs"
import path from "path"

export function getResúmenes() {
  const dir = path.join(process.cwd(), "src/content/resumenes")
  if (!fs.existsSync(dir)) return []

  return fs.readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const content = fs.readFileSync(path.join(dir, f), "utf-8")
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
      const frontmatter: Record<string, string> = {}
      if (frontmatterMatch) {
        frontmatterMatch[1].split("\n").forEach((line) => {
          const [key, ...valueParts] = line.split(": ")
          if (key && valueParts.length) {
            frontmatter[key.trim()] = valueParts.join(": ").trim()
          }
        })
      }
      return {
        slug: f.replace(".md", ""),
        ...frontmatter,
      }
    })
}