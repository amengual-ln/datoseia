export type Recurso = {
  id: string
  titulo: string
  descripcion?: string
  url: string
  tipo: 'curso' | 'paper' | 'herramienta' | 'video' | 'otro'
  tags?: string[]
  materiaSlug?: string
}

export const recursos: Recurso[] = [
  {
    id: 'r1',
    titulo: 'FastAPI Documentation',
    descripcion: 'Documentación oficial de FastAPI para construir APIs con Python.',
    url: 'https://fastapi.tiangolo.com/',
    tipo: 'curso',
    tags: ['python', 'api'],
  },
  {
    id: 'r2',
    titulo: 'Google Machine Learning Course',
    descripcion: 'Curso gratuito de ML de Google.',
    url: 'https://developers.google.com/machine-learning',
    tipo: 'curso',
    tags: ['ml', 'google'],
    materiaSlug: 'machine-learning',
  },
  {
    id: 'r3',
    titulo: 'Hugging Face Transformers',
    descripcion: 'Librería state-of-the-art para NLP y transformers.',
    url: 'https://huggingface.co/docs/transformers/',
    tipo: 'herramienta',
    tags: ['nlp', 'transformers'],
    materiaSlug: 'procesamiento-lenguaje-natural',
  },
  {
    id: 'r4',
    titulo: 'Attention Is All You Need',
    descripcion: 'Paper original de transformers.',
    url: 'https://arxiv.org/abs/1706.03762',
    tipo: 'paper',
    tags: ['transformers', 'attention'],
    materiaSlug: 'procesamiento-lenguaje-natural',
  },
  {
    id: 'r5',
    titulo: 'D3.js Video Tutorials',
    descripcion: 'Tutoriales en video para aprender D3.js.',
    url: 'https://d3js.org/',
    tipo: 'video',
    tags: ['visualization', 'd3'],
    materiaSlug: 'visualizacion-datos',
  },
]