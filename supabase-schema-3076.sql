drop table if exists documentos_rag;

create extension if not exists vector;

create table documentos_rag (
  id uuid primary key default gen_random_uuid(),
  materia_slug text,
  nombre text not null,
  chunk_index integer not null,
  contenido text not null,
  embedding vector(3076),
  metadata jsonb,
  created_at timestamptz default now()
);

create index on documentos_rag using ivfflat (embedding vector_cosine_ops) with (lists = 100);

create or replace function buscar_chunks(
  query_embedding vector(3076),
  match_count integer default 5,
  filter_materia text default null
)
returns table (
  id uuid,
  contenido text,
  nombre text,
  metadata jsonb,
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