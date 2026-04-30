export type Novedad = {
  id: string
  titulo: string
  contenido: string
  tipo: 'institucional' | 'tech' | 'aviso'
  destacada?: boolean
  fecha: string
}

export const novedades: Novedad[] = [
  {
    id: 'n1',
    titulo: 'Inscripciones abiertas segundo cuatrimestre 2025',
    contenido: 'Las inscripciones para el segundo cuatrimestre están abiertas desde el 15 de marzo. Consultá en secretaría.',
    tipo: 'institucional',
    destacada: true,
    fecha: '2025-03-15',
  },
  {
    id: 'n2',
    titulo: 'Nuevo curso de LangChain disponible',
    contenido: 'Se agregó un nuevo recurso sobre LangChain para desarrollo de aplicaciones con LLMs.',
    tipo: 'tech',
    fecha: '2025-03-10',
  },
  {
    id: 'n3',
    titulo: 'Clase de Machine Learning suspendida',
    contenido: 'La clase del lunes 17 de marzo fue suspendida. Se recuperará el viernes 21.',
    tipo: 'aviso',
    fecha: '2025-03-16',
  },
  {
    id: 'n4',
    titulo: 'Meetup de Data Science en Buenos Aires',
    contenido: 'El próximo meetup de Data Science se realizará el 25 de marzo en Palermo.',
    tipo: 'tech',
    fecha: '2025-03-14',
  },
]