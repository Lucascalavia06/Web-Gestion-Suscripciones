const fs = require('fs')
const path = require('path')

async function main() {
  const envPath = path.join(__dirname, '..', '.env.local')
  const env = fs.readFileSync(envPath, 'utf8')
  const lines = env.split(/\r?\n/)
  const vars = {}
  for (const line of lines) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/)
    if (m) vars[m[1]] = m[2].replace(/^"|"$/g, '')
  }

  const url = vars.NEXT_PUBLIC_SUPABASE_URL
  const key = vars.SUPABASE_SERVICE_ROLE_KEY

  const { createClient } = require('@supabase/supabase-js')
  const supabase = createClient(url, key)

  console.log('=== VERIFICANDO ESTRUCTURA DE TABLAS ===\n')

  // 1. Listar tablas
  console.log('1. Consultando usuario_suscripciones_contratadas...')
  const { data: subs, error: e1 } = await supabase
    .from('usuario_suscripciones_contratadas')
    .select('*')
    .limit(1)
  
  if (e1) console.error('Error:', e1.message)
  else console.log('✓ Tabla accesible. Campos:', subs[0] ? Object.keys(subs[0]).join(', ') : 'vacía')

  // 2. Probar JOIN con catalogo_planes
  console.log('\n2. Probando JOIN con catalogo_planes...')
  const { data: joined, error: e2 } = await supabase
    .from('usuario_suscripciones_contratadas')
    .select(`
      id,
      user_id,
      id_plan_catalogo,
      precio_personalizado,
      fecha_recordatorio,
      catalogo_planes!usuario_suscripciones_contratadas_id_plan_catalogo_fkey (
        id_plan_csv,
        nombre_plan,
        precio_base,
        frecuencia
      )
    `)
    .limit(1)
  
  if (e2) console.error('Error JOIN:', e2.message)
  else console.log('✓ JOIN funciona. Estructura:', JSON.stringify(joined, null, 2))

  // 3. Probar JOIN anidado con servicios y categorías
  console.log('\n3. Probando JOIN anidado con servicios y categorías...')
  const { data: deep, error: e3 } = await supabase
    .from('usuario_suscripciones_contratadas')
    .select(`
      id,
      catalogo_planes!usuario_suscripciones_contratadas_id_plan_catalogo_fkey (
        id_plan_csv,
        nombre_plan,
        catalogo_servicios!catalogo_planes_id_servicio_fkey (
          nombre,
          catalogo_categorias!catalogo_servicios_id_categoria_fkey (
            nombre
          )
        )
      )
    `)
    .limit(1)
  
  if (e3) console.error('Error JOIN anidado:', e3.message)
  else console.log('✓ JOIN anidado funciona:', JSON.stringify(deep, null, 2))

  // 4. Probar búsqueda de planes
  console.log('\n4. Probando búsqueda en catalogo_planes...')
  const { data: planes, error: e4 } = await supabase
    .from('catalogo_planes')
    .select(`
      id_plan_csv,
      nombre_plan,
      precio_base,
      frecuencia,
      catalogo_servicios!catalogo_planes_id_servicio_fkey (
        nombre,
        catalogo_categorias!catalogo_servicios_id_categoria_fkey (
          nombre
        )
      )
    `)
    .limit(3)
  
  if (e4) console.error('Error búsqueda:', e4.message)
  else console.log('✓ Búsqueda funciona. Planes encontrados:', planes.length)

  console.log('\n=== VERIFICACIÓN COMPLETA ===')
  process.exit(0)
}

main().catch(err => {
  console.error('Error fatal:', err)
  process.exit(1)
})
