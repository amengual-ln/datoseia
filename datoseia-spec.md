# datoseia — Implementation Spec
> Public Web App → **Higher Technical Degree in Data Science and AI** — **ISFT 199**

---

## 1. Overview

Public web app (no auth) that centralizes: schedules, courses/subjects, institutional news, curated tech/AI content, class summaries, and RAG chat about institutional documentation or per-course content.

The author updates content by editing repo files and redeploying on Vercel. No admin panel.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| DB | Supabase (Postgres + pgvector) |
| AI — embeddings | Google AI `text-embedding-004` |
| AI — chat/RAG | Vercel AI SDK + multi-model fallback |
| Rate limiting | `@vercel/kv` (Redis) |
| Deploy | Vercel |
| Package manager | pnpm |

### Chat Models (priority order)

| Order | Provider | Model | SDK package |
|---|---|---|---|
| 1st | Google AI | `gemini-2.0-flash` | `@ai-sdk/google` |
| 2nd | Groq | `llama-3.1-8b-instant` | `@ai-sdk/groq` |
| 3rd | Mistral | `mistral-small-latest` | `@ai-sdk/mistral` |

All free tier, no credit card required. Automatic rotation on 429 (quota exhausted).

---

## 3. Folder Structure

```
datoseia/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                        # Home: daily summary
│   ├── calendario/
│   │   └── page.tsx                    # Weekly schedule grid
│   ├── materias/
│   │   ├── page.tsx                    # Filterable listing by year/semester
│   │   └── [slug]/
│   │       └── page.tsx                # Course detail
│   ├── novedades/
│   │   └── page.tsx                    # News feed
│   ├── recursos/
│   │   └── page.tsx                    # Curated resources
│   ├── resumenes/
│   │   ├── page.tsx                    # Filterable listing by course
│   │   └── [id]/
│   │       └── page.tsx                # Individual summary (Markdown)
│   ├── chat/
│   │   └── page.tsx                    # RAG chat interface
│   └── api/
│       └── chat/
│           └── route.ts                # RAG endpoint: rate limit + fallback + stream
├── components/
│   ├── nav.tsx
│   ├── calendario/
│   │   ├── semana-grid.tsx             # 5-day grid, today highlighted
│   │   └── materia-card.tsx
│   ├── materias/
│   │   ├── año-semestre-selector.tsx   # Client Component
│   │   └── materia-detail.tsx
│   ├── novedades/
│   │   └── novedad-card.tsx
│   ├── chat/
│   │   ├── chat-interface.tsx          # Client Component
│   │   └── message-bubble.tsx
│   └── ui/
│       ├── badge.tsx
│       └── markdown-renderer.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # Browser client (chat only)
│   │   └── server.ts                   # Server client
│   └── rag/
│       ├── query.ts                    # embed query → search_chunks → build context
│       ├── fallback.ts                 # withFallback(): rotate models on 429
│       └── rate-limit.ts              # checkRateLimit() with @vercel/kv
├── content/
│   ├── materias.ts
│   ├── novedades.ts
│   ├── recursos.ts
│   └── resumenes/
│       └── [slug].md                   # One .md per class, with frontmatter
├── scripts/
│   └── ingest.ts                       # pnpm ingest -- --file=doc.pdf --materia=slug
├── public/
├── .env.local
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 4. Supabase Schema

Supabase = vector store for RAG. Remaining content in `content/`.

```sql
-- Enable pgvector extension in Supabase: Extensions → pgvector
create extension if not exists vector;

create table documentos_rag (
  id           uuid primary key default gen_random_uuid(),
  materia_slug text,                    -- null = general institutional doc
  nombre       text not null,           -- source filename
  chunk_index  integer not null,
  contenido    text not null,
  embedding    vector(768),             -- dimensions for Google's text-embedding-004
  metadata     jsonb,
  created_at   timestamptz default now()
);

-- Index for cosine similarity search
create index on documentos_rag
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- RPC function for semantic search
create or replace function buscar_chunks(
  query_embedding vector(768),
  match_count     integer default 5,
  filter_materia  text    default null
)
returns table (
  id         uuid,
  contenido  text,
  nombre     text,
  metadata   jsonb,
  similarity float
)
language sql stable as $$
  select
    id, contenido, nombre, metadata,
    1 - (embedding <=> query_embedding) as similarity
  from documentos_rag
  where
    (filter_materia is null or materia_slug = filter_materia)
    and embedding is not null
  order by embedding <=> query_embedding
  limit match_count;
$$;
```

> **Note**: `text-embedding-004` → **768 dimensions** (not 1536 like OpenAI). Schema reflects this with `vector(768)`.

---

## 5. Environment Variables

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # Only for local ingestion script

# AI Models — all free tier
GOOGLE_GENERATIVE_AI_API_KEY=     # Embeddings + primary chat (Gemini Flash)
GROQ_API_KEY=                     # Fallback 1 (Llama 3.1 8B)
MISTRAL_API_KEY=                  # Fallback 2 (Mistral Small)

# Rate limiting
KV_REST_API_URL=                  # Provided by Vercel KV when connecting store
KV_REST_API_TOKEN=                # Same
```

---

## 6. Rate Limiting — `lib/rag/rate-limit.ts`

Limits chat queries by IP using Vercel KV (Redis). Adjust `WINDOW_SECONDS` and `MAX_REQUESTS` according to actual usage.

```typescript
import { kv } from '@vercel/kv'

const WINDOW_SECONDS = 60         // time window
const MAX_REQUESTS   = 5          // max queries per window

export async function checkRateLimit(ip: string): Promise<{
  allowed:   boolean
  remaining: number
  resetIn:   number               // seconds until window resets
}> {
  const key = `rl:chat:${ip}`

  const count = await kv.incr(key)
  if (count === 1) {
    await kv.expire(key, WINDOW_SECONDS)
  }
  const ttl = await kv.ttl(key)

  return {
    allowed:   count <= MAX_REQUESTS,
    remaining: Math.max(0, MAX_REQUESTS - count),
    resetIn:   ttl,
  }
}
```

---

## 7. Model Fallback — `lib/rag/fallback.ts`

Attempts models in order. On 429 (quota exhausted) → next.

```typescript
import { google }  from '@ai-sdk/google'
import { groq }    from '@ai-sdk/groq'
import { mistral } from '@ai-sdk/mistral'
import { streamText, type LanguageModel } from 'ai'

const MODEL_CHAIN: LanguageModel[] = [
  google('gemini-2.0-flash'),
  groq('llama-3.1-8b-instant'),
  mistral('mistral-small-latest'),
]

type StreamTextParams = Parameters<typeof streamText>[0]

export async function withFallback(
  params: Omit<StreamTextParams, 'model'>
) {
  let lastError: unknown

  for (const model of MODEL_CHAIN) {
    try {
      return await streamText({ ...params, model })
    } catch (err: any) {
      const isQuotaError =
        err?.status === 429 ||
        err?.code === 'rate_limit_exceeded' ||
        err?.message?.includes('quota')

      if (isQuotaError) {
        lastError = err
        continue                  // rotate to next model
      }
      throw err                   // different error → propagate
    }
  }

  throw lastError                 // all failed
}
```

---

## 8. RAG Flow

### Ingestion (local, when adding documents)

```
pnpm ingest -- --file=docs/programa-ml.pdf --materia=machine-learning

  → read file (PDF or .txt)
  → chunk into ~500 token blocks, 50 token overlap
  → for each chunk:
      → embed with Google text-embedding-004
      → insert into documentos_rag (materia_slug, nombre, chunk_index, contenido, embedding)
```

`--materia` is optional — without it, document is treated as general institutional context.

### `scripts/ingest.ts` (expected structure)

```typescript
// Usage: pnpm ingest -- --file=path/to/doc.pdf --materia=subject-slug
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'

async function main() {
  const { file, materia } = parseArgs(process.argv)
  const text   = await extractText(file)          // PDF → plain text
  const chunks = chunkText(text, 500, 50)         // size, overlap in tokens

  const genai    = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)
  const embedder = genai.getGenerativeModel({ model: 'text-embedding-004' })
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  for (const [i, chunk] of chunks.entries()) {
    const { embedding } = await embedder.embedContent(chunk)
    await supabase.from('documentos_rag').insert({
      materia_slug: materia ?? null,
      nombre:       basename(file),
      chunk_index:  i,
      contenido:    chunk,
      embedding:    embedding.values,
    })
  }

  console.log(`✓ ${chunks.length} chunks ingested from ${basename(file)}`)
}

main()
```

### Query (user at `/chat`) — `app/api/chat/route.ts`

```typescript
import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { checkRateLimit } from '@/lib/rag/rate-limit'
import { withFallback } from '@/lib/rag/fallback'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  // 1. Rate limiting
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  const { allowed, remaining, resetIn } = await checkRateLimit(ip)

  if (!allowed) {
    return new Response(
      JSON.stringify({ error: `Too many requests. Try again in ${resetIn}s.` }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // 2. Parse body
  const { messages, materiaSlug } = await req.json()
  const userQuery = messages.at(-1).content

  // 3. Embed the query
  const genai    = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)
  const embedder = genai.getGenerativeModel({ model: 'text-embedding-004' })
  const { embedding } = await embedder.embedContent(userQuery)

  // 4. Search for relevant chunks in Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data: chunks } = await supabase.rpc('buscar_chunks', {
    query_embedding: embedding.values,
    match_count:     5,
    filter_materia:  materiaSlug ?? null,
  })

  // 5. Build context and system prompt
  const context = chunks
    ?.map((c: any) => `[${c.nombre}]\n${c.contenido}`)
    .join('\n\n---\n\n') ?? ''

  const systemPrompt = `You are an academic assistant at ISFT 199 for the Data Science and AI Technical Degree.
Respond using only the information from the provided context. If you cannot find the answer, say so clearly.
Do not make up information.

CONTEXT:
${context}`

  // 6. Generate response with model fallback
  const result = await withFallback({
    system:    systemPrompt,
    messages,
    maxTokens: 1024,
  })

  return result.toDataStreamResponse({
    headers: { 'X-RateLimit-Remaining': String(remaining) }
  })
}
```

---

## 9. Content Structure in Repo

Editable content → TypeScript or Markdown files. Update: edit file, commit, Vercel auto-redeploys.

### `content/materias.ts`

```typescript
export type Horario = { dia: string; inicio: string; fin: string; aula?: string }
export type Materia = {
  slug:         string
  nombre:       string
  año:          1 | 2 | 3
  semestre:     1 | 2
  docente?:     string
  descripcion?: string
  objetivos?:   string
  horarios:     Horario[]
  links?:       { label: string; url: string }[]
}

export const materias: Materia[] = [
  {
    slug:     'machine-learning',
    nombre:   'Machine Learning',
    año:      3,
    semestre: 1,
    docente:  'Name Lastname',
    horarios: [{ dia: 'lunes', inicio: '18:00', fin: '20:00', aula: '3A' }],
  },
  // ... remaining 6 courses from year 3
]
```

### `content/novedades.ts`

```typescript
export type Novedad = {
  id:        string
  titulo:    string
  contenido: string
  tipo:      'institucional' | 'tech' | 'aviso'
  destacada?: boolean
  fecha:     string          // ISO date: '2025-03-15'
}

export const novedades: Novedad[] = [
  // Most recent first
]
```

### `content/recursos.ts`

```typescript
export type Recurso = {
  id:           string
  titulo:       string
  descripcion?: string
  url:          string
  tipo:         'curso' | 'paper' | 'herramienta' | 'video' | 'otro'
  tags?:        string[]
  materiaSlug?: string       // undefined = general resource
}

export const recursos: Recurso[] = []
```

### `content/resumenes/[slug].md`

One `.md` per class, YAML frontmatter:

```markdown
---
id: ml-clase-01
materiaSlug: machine-learning
titulo: Introduction to Linear Regression
fechaClase: 2025-03-10
tags: [regression, supervised]
---

Content in Markdown. Can include code, tables, formulas, etc.
```

Summaries read with `fs` at build time (SSG) — no CMS or extra library.

---

## 10. Public Frontend Sections

### `/` — Home
- Featured news (latest 3 from `content/novedades.ts`)
- Today's courses (calculated from schedules in `content/materias.ts`)
- Latest summary per course

### `/calendario` — Weekly Schedule
- Monday to Friday grid, generated from `content/materias.ts`
- Year and semester selector
- Current day highlighted (SSR)
- Cell click → course detail

### `/materias` — Course Listing
- Filter by year and semester
- Cards with instructor and summarized schedules

### `/materias/[slug]` — Course Detail
- Name, instructor, description, objectives, schedules, links
- Latest summaries for that course
- Related resources

### `/novedades` — News Feed
- Filterable by type: `institucional` / `tech` / `aviso`
- Cards with date and type badge

### `/recursos` — Curated Resources
- Filterable by type and course
- Each resource: title, description, external link, tags

### `/resumenes` — Class Summaries
- Listing filterable by course
- Individual view with Markdown rendering

### `/chat` — RAG Chat
- Optional course selector (filters RAG context)
- Streaming chat interface
- Visual indicator when rate limit is near
- Disclaimer: "Responses are generated from documentation uploaded by the author"

---

## 11. Design and UX

**Audience**: Technical degree students, instructors, administrators. Wide age range.

**Principles**:
- Information first, no friction
- Mobile-first (used from phone between classes)
- Quick to scan (clear typographic hierarchy, type badges)
- No login, no popups, no newsletters

**Suggested palette**: dark/technical with phosphorescent blue or green accent — evokes terminal, data science, without being generic. Typography with personality (not Inter/Roboto).

---

## 12. Suggested Implementation Order

1. **Initial setup**: `pnpm create next-app datoseia --typescript`, configure Tailwind
2. **Supabase**: create project, enable pgvector, run `documentos_rag` schema
3. **Vercel KV**: connect KV store to project from Vercel dashboard
4. **Environment variables**: complete `.env.local` with all keys
5. **Course content**: load the 6 year-3 courses in `content/materias.ts`
6. **Calendar**: `semana-grid.tsx` + `/calendario` page with year/semester selector
7. **Course detail**: `/materias/[slug]` page
8. **News**: `content/novedades.ts` + public page
9. **Summaries**: first `.md` files in `content/resumenes/` + listing + individual view
10. **Resources**: `content/recursos.ts` + public page
11. **Home page**: compose blocks from previous sections
12. **Ingestion script**: `scripts/ingest.ts` + `pnpm ingest` command
13. **Full RAG**: `lib/rag/rate-limit.ts` + `lib/rag/fallback.ts` + `/api/chat` endpoint + `/chat` UI
14. **Deploy to Vercel**: configure env vars in dashboard, domain

---

## 13. Notes for AI

- Follow the **implementation order** strictly — do not skip steps
- **No admin panel**: all content is edited as files in the repo
- Supabase = **exclusively** for RAG embeddings; remaining content in `content/`
- Embeddings use **768 dimensions** (`text-embedding-004`) → schema reflects with `vector(768)`
- Use **Server Components** by default; Client Components only where real interactivity is needed (`año-semestre-selector`, `chat-interface`)
- Calendar must work **without JS** on initial render (SSR of current day)
- Summary `.md` files read with `fs` at build time — no CMS or content library
- `withFallback()` and `checkRateLimit()` only in `app/api/chat/route.ts` — not in ingestion script
- Ingestion script uses `SUPABASE_SERVICE_ROLE_KEY` directly — do not route through Next.js API
- RAG: prioritize **functionality** before optimizing chunking or rate limit parameters
