"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Plus, Sparkles, Search, Loader2, Check, TrendingUp } from "lucide-react"
import { useState, useEffect } from "react"
import type { Subscription } from "./subscription-card"
import { searchPlanes, createSuscripcion } from "@/lib/actions/subscriptions"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface AddSubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: () => Promise<void>
  editingSubscription?: Subscription | null
  onUpdate?: () => Promise<void>
  currentSubscriptions?: Subscription[] // Suscripciones actuales del usuario
}

export function AddSubscriptionModal({ 
  isOpen, 
  onClose, 
  onAdd, 
  editingSubscription,
  onUpdate,
  currentSubscriptions = [] 
}: AddSubscriptionModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [planes, setPlanes] = useState<any[]>([])
  const [popularPlanes, setPopularPlanes] = useState<any[]>([])
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const [price, setPrice] = useState("")
  const [nextBilling, setNextBilling] = useState("")

  useEffect(() => {
    if (isOpen && !editingSubscription) {
      loadPopularPlanes()
    }
  }, [isOpen])

  const loadPopularPlanes = async () => {
    try {
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
        .limit(20) // Traemos más para tener opciones después del filtrado
      
      if (error) {
        console.error("Error cargando populares:", error.message)
        return
      }
      
      if (data) {
        // Obtener IDs de planes ya contratados
        const contractedPlanIds = new Set(
          currentSubscriptions
            .map(sub => {
              // Extraer el id_plan_csv del nombre si está en formato "Servicio - Plan"
              // O buscar en los datos si tienes el campo disponible
              return null // Por ahora filtramos por nombre del servicio
            })
            .filter(Boolean)
        )

        // Obtener nombres de servicios ya contratados para filtrar
        const contractedServices = new Set(
          currentSubscriptions.map(sub => {
            // Extraer nombre del servicio del campo name (formato: "Servicio - Plan")
            const serviceName = sub.name.split(' - ')[0].trim()
            return serviceName.toLowerCase()
          })
        )
        
        // Filtrar planes que NO estén ya contratados
        const availablePlanes = data.filter((p: any) => {
          const serviceName = p.catalogo_servicios?.nombre?.toLowerCase() || ''
          return !contractedServices.has(serviceName)
        })

        // IMPORTANTE: Mapeamos id_plan_csv como el ID principal
        const safeData = availablePlanes.map((p: any) => ({
          ...p,
          id: p.id_plan_csv 
        })).slice(0, 8) // Limitamos a 8 después del filtrado
        
        setPopularPlanes(safeData)
      }
    } catch (error) {
      console.error("Error cargando populares:", error)
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2 && !selectedPlan) {
        setLoading(true)
        try {
          const results = await searchPlanes(searchQuery)
          
          // Filtrar planes que ya están contratados
          const contractedServices = new Set(
            currentSubscriptions.map(sub => {
              const serviceName = sub.name.split(' - ')[0].trim()
              return serviceName.toLowerCase()
            })
          )
          
          const availableResults = results.filter((p: any) => {
            const serviceName = p.catalogo_servicios?.nombre?.toLowerCase() || ''
            return !contractedServices.has(serviceName)
          })
          
          const safeResults = availableResults.map((p: any) => ({
            ...p,
            id: p.id_plan_csv
          }))
          setPlanes(safeResults)
          setShowDropdown(safeResults.length > 0)
        } catch (error) {
          console.error("Error buscando:", error)
        } finally {
          setLoading(false)
        }
      } else {
        setPlanes([])
        setShowDropdown(false)
      }
    }, 300)
    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery, currentSubscriptions])

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan)
    setSearchQuery(plan.nombre_plan)
    setPrice(plan.precio_base.toString())
    
    // Calcular fecha automática (1 mes después)
    const hoy = new Date()
    hoy.setMonth(hoy.getMonth() + 1)
    setNextBilling(hoy.toISOString().split('T')[0])
    setShowDropdown(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlan) return toast.error("Selecciona un plan")

    setSubmitting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return toast.error("Inicia sesión")

      const result = await createSuscripcion({
        userId: session.user.id,
        planId: selectedPlan.id, // Esto envía el id_plan_csv
        precioPersonalizado: parseFloat(price),
        proximaFechaCobro: nextBilling,
      })

      if (result.success) {
        toast.success("¡Suscripción guardada!")
        resetForm()
        onClose()
        await onAdd()
      } else {
        toast.error(result.error || "Error al guardar")
      }
    } catch (error) {
      toast.error("Error inesperado")
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setSearchQuery("")
    setSelectedPlan(null)
    setPrice("")
    setNextBilling("")
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-neu-black/60 z-50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg z-50"
          >
            <div className="bg-neu-cream border-4 border-neu-black p-6 md:p-8 max-h-[90vh] overflow-y-auto shadow-[12px_12px_0px_0px_#000]">
              
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black uppercase italic tracking-tight text-neu-black">
                   Nueva Suscripción
                </h2>
                <button onClick={onClose} className="bg-neu-pink p-2 border-[3px] border-neu-black shadow-[3px_3px_0px_0px_#000]">
                  <X className="w-5 h-5 text-neu-black" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="relative">
                  <label className="block text-xs font-black uppercase mb-2 text-neu-black">Buscar Servicio</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        if (selectedPlan) setSelectedPlan(null)
                      }}
                      className="w-full px-4 py-3 bg-white border-[3px] border-neu-black font-bold text-neu-black focus:ring-4 focus:ring-neu-yellow outline-none shadow-[4px_4px_0px_0px_#000]"
                      placeholder="Netflix, Spotify..."
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {loading ? <Loader2 className="animate-spin w-5 h-5" /> : selectedPlan ? <Check className="text-green-600 w-5 h-5" /> : <Search className="w-5 h-5 opacity-30" />}
                    </div>
                  </div>

                  {showDropdown && planes.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-white border-[3px] border-neu-black shadow-[6px_6px_0px_0px_#000] max-h-48 overflow-y-auto">
                      {planes.map((plan) => (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => handleSelectPlan(plan)}
                          className="w-full p-3 text-left border-b-2 border-neu-black/10 hover:bg-neu-yellow font-bold text-sm text-neu-black"
                        >
                          {plan.catalogo_servicios?.nombre} - {plan.nombre_plan} (€{plan.precio_base})
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase mb-2 text-neu-black">Precio (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      disabled={!selectedPlan}
                      className="w-full px-4 py-3 bg-white border-[3px] border-neu-black font-bold text-neu-black shadow-[4px_4px_0px_0px_#000] disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase mb-2 text-neu-black">Fecha Recordatorio</label>
                    <input
                      type="date"
                      value={nextBilling}
                      onChange={(e) => setNextBilling(e.target.value)}
                      className="w-full px-4 py-3 bg-white border-[3px] border-neu-black font-bold text-neu-black shadow-[4px_4px_0px_0px_#000]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!selectedPlan || submitting}
                  className="w-full bg-neu-black text-neu-lime py-4 font-black uppercase text-lg border-[3px] border-neu-black shadow-[6px_6px_0px_0px_#A3E635] active:translate-y-1 disabled:opacity-50 transition-all"
                >
                  {submitting ? "Guardando..." : "Agregar ahora"}
                </button>
              </form>

              {!selectedPlan && popularPlanes.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-sm font-black uppercase mb-3 flex items-center gap-2 text-neu-black">
                    <TrendingUp className="w-4 h-4" /> Populares
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {popularPlanes.map((plan) => (
                      <button
                        key={plan.id}
                        onClick={() => handleSelectPlan(plan)}
                        className="p-3 bg-white border-[3px] border-neu-black text-left hover:bg-neu-lime transition-colors shadow-[3px_3px_0px_0px_#000]"
                      >
                        <p className="font-black text-xs truncate text-neu-black">{plan.catalogo_servicios?.nombre}</p>
                        <p className="text-[10px] font-bold opacity-60 truncate text-neu-black">{plan.nombre_plan}</p>
                        <p className="font-black text-sm mt-1 text-neu-black">€{plan.precio_base}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}