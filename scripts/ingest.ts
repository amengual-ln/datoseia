import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { basename, extname } from 'path'
import { execSync } from 'child_process'
import { config } from 'dotenv'

config({ path: '.env.local' })

interface Chunk {
  text: string
  index: number
}

function parseArgs(args: string[]): { file?: string; materia?: string } {
  const result: { file?: string; materia?: string } = {}
  for (const arg of args) {
    if (arg.startsWith('--file=')) {
      result.file = arg.slice('--file='.length)
    } else if (arg.startsWith('--materia=')) {
      result.materia = arg.slice('--materia='.length)
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

function extractText(file: string): string {
  const ext = extname(file).toLowerCase()
  if (ext === '.txt') {
    return readFileSync(file, 'utf-8')
  }
  if (ext === '.pdf') {
    return execSync(`pdftotext -layout "${file}" -`, { encoding: 'utf-8' })
  }
  return readFileSync(file, 'utf-8')
}

async function embedCohere(texts: string[]): Promise<number[][]> {
  const response = await fetch('https://api.cohere.ai/v1/embed', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.COHERE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'embed-v4.0',
      texts,
      input_type: 'search_document',
      output_dimension: 1024,
      embedding_types: ['float'],
    }),
  })
  const data = await response.json()
  return data.embeddings.float
}

async function main() {
  const args = process.argv.slice(2)
  const { file, materia } = parseArgs(args)

  if (!file) {
    console.error('Usage: pnpm ingest -- --file=path/to/doc.txt [--materia=slug]')
    process.exit(1)
  }

  const text = extractText(file)
  if (!text) {
    console.error('No text could be extracted from the file')
    process.exit(1)
  }

  const chunks = chunkText(text, 500, 50)
  console.log(`Loaded ${chunks.length} chunks from ${basename(file)}`)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const CONCURRENCY = 5

  for (let i = 0; i < chunks.length; i += CONCURRENCY) {
    const batch = chunks.slice(i, i + CONCURRENCY)
    console.log(`Embedding batch ${i + 1}-${i + batch.length}...`)

    const embeddings = await embedCohere(batch.map(c => c.text))

    for (let j = 0; j < batch.length; j++) {
      const chunk = batch[j]
      const embedding = embeddings[j]

      await supabase.from('documentos_rag').insert({
        materia_slug: materia ?? null,
        nombre: basename(file),
        chunk_index: chunk.index,
        contenido: chunk.text,
        embedding,
      })
    }

    console.log(`Ingested chunks ${i + 1} to ${i + batch.length}/${chunks.length}`)
  }

  console.log(`✓ ${chunks.length} chunks ingested from ${basename(file)}`)
}

main()