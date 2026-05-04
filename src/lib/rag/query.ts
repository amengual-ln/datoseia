import { createClient } from '@supabase/supabase-js'

export async function embedQuery(query: string): Promise<number[]> {
  const response = await fetch('https://api.cohere.ai/v1/embed', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.COHERE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'embed-v4.0',
      texts: [query],
      input_type: 'search_query',
      output_dimension: 1024,
      embedding_types: ['float'],
    }),
  })
  const data = await response.json()
  return data.embeddings.float[0]
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