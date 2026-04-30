import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function embedQuery(query: string): Promise<number[]> {
  const genai = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)
  const embedder = genai.getGenerativeModel({ model: 'text-embedding-004' })
  const { embedding } = await embedder.embedContent(query)
  return embedding.values
}

export async function searchChunks(
  queryEmbedding: number[],
  matchCount: number = 5,
  filterMateria: string | null = null
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data } = await supabase.rpc('buscar_chunks', {
    query_embedding: queryEmbedding,
    match_count: matchCount,
    filter_materia: filterMateria,
  })

  return data
}

export function buildContext(chunks: any[]): string {
  if (!chunks?.length) return ''
  return chunks
    .map((c) => `[${c.nombre}]\n${c.contenido}`)
    .join('\n\n---\n\n')
}