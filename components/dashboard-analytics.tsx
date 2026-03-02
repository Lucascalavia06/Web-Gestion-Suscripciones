"use client"

import React, { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { StatsSection } from "./stats-section"
import { AnalyticsCharts } from "./analytics-charts"
import { SpendingChart } from "./spending-chart"
import type { Subscription } from "./subscription-card"

export default function DashboardAnalytics() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const userId = sessionData?.session?.user?.id
        if (!userId) {
          setSubscriptions([])
          setLoading(false)
          return
        }

        const { data, error } = await supabase
          .from("usuario_suscripciones_contratadas")
          .select(`
            id,
            nombre_personalizado,
            precio_personalizado,
            fecha_recordatorio,
            activo,
            catalogo_planes!usuario_suscripciones_contratadas_id_plan_catalogo_fkey (
              id_plan_csv,
              nombre_plan,
              precio_base,
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
          .eq("user_id", userId)
          .eq("activo", true)

        if (error) {
          console.error("Error cargando suscripciones:", error)
          setSubscriptions([])
          setLoading(false)
          return
        }

        const mapped: Subscription[] = (data || []).map((item: any, idx: number) => {
          const catalog = Array.isArray(item.catalogo_planes) ? item.catalogo_planes[0] : item.catalogo_planes
          const service = catalog?.catalogo_servicios ? (Array.isArray(catalog.catalogo_servicios) ? catalog.catalogo_servicios[0] : catalog.catalogo_servicios) : null
          const category = service?.catalogo_categorias ? (Array.isArray(service.catalogo_categorias) ? service.catalogo_categorias[0]?.nombre : service.catalogo_categorias?.nombre) : "Otros"

          const price = item.precio_personalizado ?? catalog?.precio_base ?? 0
          const billingCycle = (catalog?.frecuencia || "monthly") === "yearly" ? "yearly" : "monthly"

          return {
            id: String(item.id),
            name: item.nombre_personalizado || catalog?.nombre_plan || "Sin nombre",
            price: Number(price),
            billingCycle,
            category: category || "Otros",
            nextBilling: item.fecha_recordatorio || new Date().toISOString(),
            color: ["bg-neu-lime", "bg-neu-blue", "bg-neu-orange"][idx % 3],
          }
        })

        setSubscriptions(mapped)
      } catch (err) {
        console.error(err)
        setSubscriptions([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) {
    return (
      <div className="mt-6">
        <div className="h-6 w-48 bg-neu-yellow/50 border-[3px] border-neu-black animate-pulse" />
      </div>
    )
  }

  return (
    <div className="mt-8">
      <StatsSection
        totalSpending={subscriptions.reduce((acc, s) => acc + (s.billingCycle === "monthly" ? s.price : s.price / 12), 0)}
        subscriptionCount={subscriptions.length}
        nextRenewal={subscriptions[0]?.nextBilling ? new Date(subscriptions[0].nextBilling).toLocaleDateString('es-ES') : "N/A"}
        averageCost={subscriptions.length > 0 ? subscriptions.reduce((acc, s) => acc + (s.billingCycle === "monthly" ? s.price : s.price / 12), 0) / subscriptions.length : 0}
        isAuthenticated={true}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AnalyticsCharts subscriptions={subscriptions} />
        </div>
        <div>
          <SpendingChart subscriptions={subscriptions} />
        </div>
      </div>
    </div>
  )
}
