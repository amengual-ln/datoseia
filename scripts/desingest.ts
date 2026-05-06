import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { count, error } = await supabase
    .from('documentos_rag')
    .delete()
    .eq('nombre', 'horario.pdf')

  if (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }

  console.log(`✓ Eliminados todos los chunks de 'horario.pdf'`)
}

main()
