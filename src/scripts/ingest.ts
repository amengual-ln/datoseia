import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { basename, extname } from 'path'

interface Chunk {
  text: string
  index: number
}

function parseArgs(args: string[]): { file?: string; materia?: string } {
  const result: { file?: string; materia?: string } = {}
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file' && args[i + 1]) {
      result.file = args[i + 1]
      i++
    } else if (args[i] === '--materia' && args[i + 1]) {
      result.materia = args[i + 1]
      i++
    }
  }
  return result
}

function chunkText(text: string, size: number = 500, overlap: number = 50): Chunk[] {
  const words = text.split(/\s+/)
  const chunks: Chunk[] = []
  let start = 0

  while (start < words.length) {
    const end = Math.min(start + size, words.length)
    const chunkText = words.slice(start, end).join(' ')
    chunks.push({ text: chunkText, index: chunks.length })
    start = end - overlap
    if (start >= words.length - overlap) break
  }

  return chunks
}

async function extractText(file: string): Promise<string> {
  const ext = extname(file).toLowerCase()
  if (ext === '.txt') {
    return readFileSync(file, 'utf-8')
  }
  if (ext === '.pdf') {
    console.warn('PDF extraction not implemented, skipping file:', file)
    return ''
  }
  return readFileSync(file, 'utf-8')
}

async function main() {
  const { file, materia } = parseArgs(process.argv.slice(2))

  if (!file) {
    console.error('Usage: pnpm ingest -- --file=path/to/doc.txt [--materia=slug]')
    process.exit(1)
  }

  const text = await extractText(file)
  if (!text) {
    console.error('No text could be extracted from the file')
    process.exit(1)
  }

  const chunks = chunkText(text, 500, 50)
  console.log(`Loaded ${chunks.length} chunks from ${basename(file)}`)

  const genai = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)
  const embedder = genai.getGenerativeModel({ model: 'text-embedding-004' })
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  for (const chunk of chunks) {
    const { embedding } = await embedder.embedContent(chunk.text)
    await supabase.from('documentos_rag').insert({
      materia_slug: materia ?? null,
      nombre: basename(file),
      chunk_index: chunk.index,
      contenido: chunk.text,
      embedding: embedding.values,
    })
    console.log(`Ingested chunk ${chunk.index + 1}/${chunks.length}`)
  }

  console.log(`✓ ${chunks.length} chunks ingested from ${basename(file)}`)
}

main()