"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Search, Loader2, Sparkles, TrendingUp } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { createSuscripcion } from "@/lib/actions/subscriptions"
import { toast } from "sonner"
import type { User } from "@supabase/supabase-js"

interface CatalogoPlan {
  id: string
  nombre_plan: string
  precio_base: number
  frecuencia: string
  catalogo_servicios: {
    id: string
    nombre: string
    catalogo_categorias: {
      nombre: string
    }
  }
}

interface CatalogSectionProps {
  user: User | null
  onSubscriptionAdded: () => Promise<void>
}

export function CatalogSection({ user, onSubscriptionAdded }: CatalogSectionProps) {
  const [planes, setPlanes] = useState<CatalogoPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [addingPlanId, setAddingPlanId] = useState<string | null>(null)

  useEffect(() => {
    loadPlanes()
  }, [])

  const loadPlanes = async () => {
    setLoading(true)
    try {
      // Pedimos todo (*) para evitar errores de nombres de columna específicos como 'id'
      const { data, error } = await supabase
        .from('catalogo_planes')
        .select(`
          *,
          catalogo_servicios!inner (
            *,
            catalogo_categorias!inner (*)
          )
        `)
        .order('precio_base', { ascending: true })

      if (error) {
        console.error("Error detallado Supabase:", error)
        toast.error("Error al conectar con el catálogo")
      } else {
        // Mapeo de seguridad: si no existe 'id', buscamos otras opciones comunes
        const formattedData = (data as any[]).map(p => ({
          ...p,
          // Intentamos pillar el ID de cualquier columna parecida si 'id' falla
          id: p.id || p.ID || p.id_plan_csv || p.created_at || Math.random().toString()
        }))
        setPlanes(formattedData)
      }
    } catch (error) {
      console.error("Error inesperado:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPlanes = planes.filter((plan) => {
    const matchesSearch = 
      plan.nombre_plan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.catalogo_servicios?.nombre?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = 
      selectedCategory === "all" || 
      plan.catalogo_servicios?.catalogo_categorias?.nombre === selectedCategory

    return matchesSearch && matchesCategory
  })

  const categories = ["all", ...Array.from(new Set(planes.map(p => p.catalogo_servicios?.catalogo_categorias?.nombre).filter(Boolean))).sort()]

  const planesPorServicio = filteredPlanes.reduce((acc, plan) => {
    const servicioNombre = plan.catalogo_servicios?.nombre || "Otros"
    if (!acc[servicioNombre]) acc[servicioNombre] = []
    acc[servicioNombre].push(plan)
    return acc
  }, {} as Record<string, CatalogoPlan[]>)

  // Ordenar servicios alfabéticamente
  const serviciosOrdenados = Object.entries(planesPorServicio).sort(([a], [b]) => a.localeCompare(b))

  const handleAddPlan = async (plan: CatalogoPlan) => {
    if (!user) {
      toast.error("Inicia sesión para agregar")
      return
    }

    setAddingPlanId(plan.id)
    try {
      const hoy = new Date()
      hoy.setMonth(hoy.getMonth() + 1)

      const result = await createSuscripcion({
        userId: user.id,
        planId: plan.id,
        precioPersonalizado: plan.precio_base,
        proximaFechaCobro: hoy.toISOString().split('T')[0],
      })

      if (result.success) {
        toast.success(`¡${plan.catalogo_servicios.nombre} añadido!`)
        await onSubscriptionAdded()
      } else {
        toast.error(result.error || "Error al agregar")
      }
    } catch (error) {
      toast.error("Error de conexión")
    } finally {
      setAddingPlanId(null)
    }
  }

  const cardColors = ["bg-neu-lime", "bg-neu-blue", "bg-neu-orange", "bg-neu-cyan", "bg-neu-yellow", "bg-neu-pink"]

  return (
    <section className="mt-16 pb-20">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-neu-cyan p-3 border-[3px] border-neu-black rotate-3 shadow-[6px_6px_0px_0px_#000]">
          <Sparkles className="w-7 h-7 text-neu-black" />
        </div>
        <h2 className="text-4xl font-bold uppercase italic text-neu-black">Catálogo Completo</h2>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="BUSCAR SERVICIOS..."
            className="w-full px-4 py-3 bg-white border-[3px] border-neu-black font-bold uppercase shadow-[6px_6px_0px_0px_#000] focus:outline-none focus:ring-4 focus:ring-neu-yellow"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 font-bold uppercase text-xs border-[3px] border-neu-black shadow-[4px_4px_0px_0px_#000] transition-transform active:translate-y-1 ${
                selectedCategory === cat ? "bg-neu-black text-white" : "bg-white text-neu-black"
              }`}
            >
              {cat === "all" ? "TODAS" : cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-20">
          <Loader2 className="w-12 h-12 animate-spin mb-4" />
          <p className="font-black italic uppercase">Sincronizando planes...</p>
        </div>
      ) : (
        <div className="space-y-16">
          {serviciosOrdenados.map(([servicio, servicioPlanes], idx) => (
            <div key={servicio}>
              <div className="inline-block bg-neu-black text-white px-6 py-2 border-[3px] border-neu-black mb-6 -rotate-1 shadow-[4px_4px_0px_0px_#000]">
                <h3 className="text-2xl font-black uppercase italic">{servicio}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {servicioPlanes.map((plan, pIdx) => (
                  <motion.div
                    key={plan.id}
                    whileHover={{ scale: 1.02, rotate: -1 }}
                    className={`${cardColors[(idx + pIdx) % cardColors.length]} p-6 border-[3px] border-neu-black shadow-[8px_8px_0px_0px_#000] flex flex-col justify-between min-h-[200px]`}
                  >
                    <div>
                      <h4 className="text-xl font-black uppercase italic mb-1">{plan.nombre_plan}</h4>
                      <p className="text-xs font-bold opacity-70 mb-4">{plan.frecuencia}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-3xl font-black italic">€{plan.precio_base}</span>
                      <button
                        onClick={() => handleAddPlan(plan)}
                        disabled={addingPlanId === plan.id}
                        className="bg-neu-black text-white p-3 border-2 border-neu-black hover:bg-white hover:text-neu-black transition-colors disabled:opacity-50"
                      >
                        {addingPlanId === plan.id ? <Loader2 className="animate-spin w-5 h-5" /> : <Plus className="w-5 h-5" />}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}