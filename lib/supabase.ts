import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Advertencias si faltan variables (pero no lanzar excepciones)
if (!supabaseUrl) {
  console.warn('⚠️ NEXT_PUBLIC_SUPABASE_URL no está configurada')
}

if (!supabaseAnonKey) {
  console.warn('⚠️ NEXT_PUBLIC_SUPABASE_ANON_KEY no está configurada')
}

// Cliente de Supabase para componentes cliente (use client)
// Este es el cliente que usarás en tus componentes con "use client"
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})
