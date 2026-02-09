'use server'

import { createClient } from '@supabase/supabase-js'

// Tipo para la respuesta de suscripciones del usuario
// NOTA: id es integer en la BD, pero lo tratamos como string para consistencia
export interface SuscripcionUsuario {
  id: number
  user_id: string
  id_plan_catalogo: string
  nombre_personalizado?: string
  precio_personalizado?: number
  fecha_recordatorio?: string
  activo: boolean
  created_at?: string
  catalogo_planes?: {
    id_plan_csv: string
    nombre_plan: string
    precio_base: number
    moneda?: string
    frecuencia: string
    catalogo_servicios?: {
      id: number
      nombre: string
      catalogo_categorias?: {
        id: number
        nombre: string
      }
    }
  }
}

const getSupabaseServer = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Buscar planes (Autocomplete)
 * Relación: catalogo_planes -> catalogo_servicios (via id_servicio) -> catalogo_categorias (via id_categoria)
 */
export async function searchPlanes(query: string) {
  const supabase = getSupabaseServer()
  
  const { data, error } = await supabase
    .from('catalogo_planes')
    .select(`
      id_plan_csv,
      nombre_plan,
      precio_base,
      moneda,
      frecuencia,
      catalogo_servicios!catalogo_planes_id_servicio_fkey (
        id,
        nombre,
        catalogo_categorias!catalogo_servicios_id_categoria_fkey (
          id,
          nombre
        )
      )
    `)
    .ilike('nombre_plan', `%${query}%`)
    .limit(10)
  
  if (error) {
    console.error('Error buscando planes:', error.message)
    return []
  }
  return data || []
}

/**
 * Crear nueva suscripción
 * Corregido: nombres de columna exactos de tu tabla usuario_suscripciones_contratadas
 */
export async function createSuscripcion(data: {
  userId: string
  planId: string
  precioPersonalizado?: number
  proximaFechaCobro: string
}): Promise<{ success: boolean; error?: string; data?: any }> {
  const supabase = getSupabaseServer()
  
  const { data: newSub, error } = await supabase
    .from('usuario_suscripciones_contratadas') 
    .insert({
      user_id: data.userId, 
      id_plan_catalogo: data.planId, // <--- ESTE ERA EL NOMBRE CORRECTO
      precio_personalizado: data.precioPersonalizado,
      fecha_recordatorio: data.proximaFechaCobro, // <--- EN TU SQL ES fecha_recordatorio
      activo: true
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error insertando suscripción:', error.message)
    return { success: false, error: error.message }
  }
  
  return { success: true, data: newSub }
}

/**
 * Obtener suscripciones del usuario
 * Relación: usuario_suscripciones_contratadas -> catalogo_planes (via id_plan_catalogo)
 *           catalogo_planes -> catalogo_servicios (via id_servicio)
 *           catalogo_servicios -> catalogo_categorias (via id_categoria)
 */
export async function getUserSuscripciones(userId: string): Promise<SuscripcionUsuario[]> {
  const supabase = getSupabaseServer()
  
  const { data, error } = await supabase
    .from('usuario_suscripciones_contratadas')
    .select(`
      id,
      user_id,
      id_plan_catalogo,
      nombre_personalizado,
      precio_personalizado,
      fecha_recordatorio,
      activo,
      created_at,
      catalogo_planes!usuario_suscripciones_contratadas_id_plan_catalogo_fkey (
        id_plan_csv,
        nombre_plan,
        precio_base,
        moneda,
        frecuencia,
        catalogo_servicios!catalogo_planes_id_servicio_fkey (
          id,
          nombre,
          catalogo_categorias!catalogo_servicios_id_categoria_fkey (
            id,
            nombre
          )
        )
      )
    `)
    .eq('user_id', userId)
    .eq('activo', true)
  
  if (error) {
    console.error('Error obteniendo suscripciones:', error.message)
    return []
  }
  
  // Mapear la respuesta al tipo correcto
  return (data || []).map((item: any) => ({
    ...item,
    catalogo_planes: Array.isArray(item.catalogo_planes) 
      ? item.catalogo_planes[0] 
      : item.catalogo_planes
  })) as SuscripcionUsuario[]
}

/**
 * Borrar suscripción
 * NOTA: id es integer en la BD
 */
export async function deleteSuscripcion(suscripcionId: string | number) {
  const supabase = getSupabaseServer()
  const { error } = await supabase
    .from('usuario_suscripciones_contratadas')
    .delete()
    .eq('id', Number(suscripcionId))

  if (error) return { success: false, error: error.message }
  return { success: true }
}