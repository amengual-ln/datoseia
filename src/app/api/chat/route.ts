import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { checkRateLimit } from '@/lib/rag/rate-limit'
import { withFallback } from '@/lib/rag/fallback'

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

  const genai = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)
  const embedder = genai.getGenerativeModel({ model: 'text-embedding-004' })
  const { embedding } = await embedder.embedContent(userQuery)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data: chunks } = await supabase.rpc('buscar_chunks', {
    query_embedding: embedding.values,
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

  return (result as any).toDataStreamResponse({
    headers: { 'X-RateLimit-Remaining': String(remaining) }
  })
}