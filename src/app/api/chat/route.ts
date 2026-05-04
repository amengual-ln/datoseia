import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit } from '@/lib/rag/rate-limit'
import { withFallback } from '@/lib/rag/fallback'
import { embedQuery } from '@/lib/rag/query'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  const { allowed, remaining, resetIn } = await checkRateLimit(ip)

  if (!allowed) {
    return new Response(
      JSON.stringify({ error: `Demasiadas solicitudes. Intentá en ${resetIn}s.` }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const { messages, materiaSlug } = await req.json()
  const userQuery = messages.at(-1).content

  const queryEmbedding = await embedQuery(userQuery)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data: chunks } = await supabase.rpc('buscar_chunks', {
    query_embedding: queryEmbedding,
    match_count: 5,
    filter_materia: materiaSlug ?? null,
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
    messages,
    maxTokens: 1024,
  })

  return result.toTextStreamResponse({
    headers: { 'X-RateLimit-Remaining': String(remaining) }
  })
}