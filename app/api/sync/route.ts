import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // 1. URL SIN LÍMITE para pillar todo el catálogo
    const response = await fetch('https://api-gestion-suscripciones.vercel.app/suscripciones', {
      cache: 'no-store'
    })
    const planes = await response.json()

    console.log(`🔄 Sincronizando ${planes.length} planes...`)

    for (const p of planes) {
      // 2. Sincronizar Categoría (onConflict asegura que no se repita el nombre)
      const { data: cat } = await supabase
        .from('catalogo_categorias')
        .upsert({ nombre: p.Categoria || 'Otros' }, { onConflict: 'nombre' })
        .select()
        .single()
      
      if (!cat) continue

      // 3. Sincronizar Servicio (onConflict asegura que no se repita el nombre)
      const { data: serv } = await supabase
        .from('catalogo_servicios')
        .upsert({ 
            nombre: p.Plataforma_Servicio, 
            id_categoria: cat.id 
        }, { onConflict: 'nombre' })
        .select()
        .single()

      if (!serv) continue

      // 4. Sincronizar Plan (Usa id_plan_csv para saber si ya existe)
      await supabase.from('catalogo_planes').upsert({
        id_plan_csv: p.ID_Plan,
        id_servicio: serv.id,
        nombre_plan: p.Nombre_Plan,
        precio_base: parseFloat(p.Precio_Base) || 0,
        moneda: p.Moneda || 'EUR',
        frecuencia: p.Frecuencia_Facturacion || 'Mensual',
        caracteristicas: p.Caracteristicas || '',
        trial_disponible: p.Trial_Disponible === 'Sí',
        pais: p.Disponible_En_Pais || 'Global',
        fecha_actualizacion: new Date().toISOString()
      }, { onConflict: 'id_plan_csv' }) // <--- ESTO EVITA LOS DUPLICADOS
    }

    return NextResponse.json({ 
      success: true, 
      count: planes.length,
      message: '✅ Sincronización infinita completada sin duplicados' 
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}