export type Horario = { dia: string; inicio: string; fin: string; aula?: string }
export type Materia = {
  slug: string
  nombre: string
  año: 1 | 2 | 3
  semestre: 1 | 2
  docente?: string
  descripcion?: string
  objetivos?: string
  horarios: Horario[]
  links?: { label: string; url: string }[]
}

export const materias: Materia[] = [
  {
    slug: 'machine-learning',
    nombre: 'Machine Learning',
    año: 3,
    semestre: 1,
    docente: 'Profesor Apellido',
    descripcion: 'Fundamentos de aprendizaje automático incluyendo regresión, clasificación, clustering y redes neuronales básicas.',
    objetivos: 'Comprender algoritmos de ML, implementar modelos supervisados y no supervisados, evaluar rendimiento.',
    horarios: [
      { dia: 'lunes', inicio: '18:00', fin: '20:00', aula: '3A' },
      { dia: 'miércoles', inicio: '18:00', fin: '20:00', aula: '3A' },
    ],
    links: [
      { label: 'Programa', url: '#' },
    ],
  },
  {
    slug: 'deep-learning',
    nombre: 'Deep Learning',
    año: 3,
    semestre: 1,
    docente: 'Profesor Apellido',
    descripcion: 'Redes neuronales profundas, CNNs, RNNs, transformers y aplicaciones prácticas.',
    objetivos: 'Diseñar y entrenar redes neuronales profundas, comprender arquitecturas modernas.',
    horarios: [
      { dia: 'martes', inicio: '18:00', fin: '20:00', aula: '3A' },
      { dia: 'jueves', inicio: '18:00', fin: '20:00', aula: '3A' },
    ],
    links: [
      { label: 'Programa', url: '#' },
    ],
  },
  {
    slug: 'bases-de-datos',
    nombre: 'Bases de Datos',
    año: 3,
    semestre: 1,
    docente: 'Profesor Apellido',
    descripcion: 'Diseño de bases de datos relacionales, SQL avanzado, optimización de consultas.',
    objetivos: 'Dominar diseño y administración de bases de datos, optimizar rendimiento.',
    horarios: [
      { dia: 'lunes', inicio: '20:00', fin: '22:00', aula: '2B' },
      { dia: 'miércoles', inicio: '20:00', fin: '22:00', aula: '2B' },
    ],
  },
  {
    slug: 'estadistica-avanzada',
    nombre: 'Estadística Avanzada',
    año: 3,
    semestre: 1,
    docente: 'Profesor Apellido',
    descripcion: 'Probabilidad avanzada, inferencia estadística, pruebas de hipótesis.',
    objetivos: 'Aplicar métodos estadísticos avanzados para análisis de datos.',
    horarios: [
      { dia: 'viernes', inicio: '18:00', fin: '21:00', aula: '3A' },
    ],
  },
  {
    slug: 'visualizacion-datos',
    nombre: 'Visualización de Datos',
    año: 3,
    semestre: 1,
    docente: 'Profesor Apellido',
    descripcion: 'Principios de visualización, herramientas como Tableau, Power BI, D3.js.',
    objetivos: 'Crear visualizaciones efectivas y storytelling con datos.',
    horarios: [
      { dia: 'martes', inicio: '20:00', fin: '22:00', aula: 'Lab 1' },
      { dia: 'jueves', inicio: '20:00', fin: '22:00', aula: 'Lab 1' },
    ],
  },
  {
    slug: 'procesamiento-lenguaje-natural',
    nombre: 'Procesamiento de Lenguaje Natural',
    año: 3,
    semestre: 1,
    docente: 'Profesor Apellido',
    descripcion: 'NLP fundamentals, embeddings, transformers, aplicaciones prácticas.',
    objetivos: 'Implementar soluciones NLP, entender arquitecturas transformer.',
    horarios: [
      { dia: 'miércoles', inicio: '20:00', fin: '22:00', aula: '3A' },
      { dia: 'viernes', inicio: '18:00', fin: '20:00', aula: '3A' },
    ],
  },
]