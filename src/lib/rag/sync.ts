import { createClient } from '@supabase/supabase-js'
import { embedQuery } from '@/lib/rag/query'
import { withFallback } from '@/lib/rag/fallback'

export async function ragSync(params: {
  messages: any[]
  materiaSlug?: string | null
}): Promise<string> {
  const userQuery = params.messages.at(-1).content
  const queryEmbedding = await embedQuery(userQuery)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data: chunks } = await supabase.rpc('buscar_chunks', {
    query_embedding: queryEmbedding,
    match_count: 5,
    filter_materia: params.materiaSlug ?? null,
  })

  const context = chunks
    ?.map((c: any) => `[${c.nombre}]\n${c.contenido}`)
    .join('\n\n---\n\n') ?? ''

  const systemPrompt = `You are an academic assistant at ISFT 199 for the Data Science and AI Technical Degree.
Respond using only the information from the provided context. If you cannot find the answer, say so clearly.
Do not make up information.

CONTEXT:
${context}`

  const result = await withFallback({
    system: systemPrompt,
    messages: params.messages,
    maxTokens: 1024,
  })

  const fullText = await result.text()
  return fullText
}