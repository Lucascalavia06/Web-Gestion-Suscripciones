"use client"

import { motion } from "framer-motion"
import { TrendingDown, TrendingUp, Lightbulb, AlertCircle } from "lucide-react"
import type { Subscription } from "./subscription-card"

interface InsightsPanelProps {
  subscriptions: Subscription[]
}

export function InsightsPanel({ subscriptions }: InsightsPanelProps) {
  if (subscriptions.length === 0) return null

  const monthlyTotal = subscriptions.reduce((acc, sub) => {
    return acc + (sub.billingCycle === "monthly" ? sub.price : sub.price / 12)
  }, 0)

  const yearlyTotal = monthlyTotal * 12

  // Encontrar la suscripción más cara
  const mostExpensive = subscriptions.reduce((max, sub) => {
    const monthlyPrice = sub.billingCycle === "monthly" ? sub.price : sub.price / 12
    const maxMonthlyPrice = max.billingCycle === "monthly" ? max.price : max.price / 12
    return monthlyPrice > maxMonthlyPrice ? sub : max
  })

  // Calcular cuántas son mensuales vs anuales
  const monthlySubs = subscriptions.filter(s => s.billingCycle === "monthly").length
  const yearlySubs = subscriptions.filter(s => s.billingCycle === "yearly").length

  // Calcular ahorro potencial si todas fueran anuales (típicamente 16% descuento)
  const potentialSavings = monthlyTotal * 12 * 0.16

  // Próximas a vencer (próximos 7 días)
  const today = new Date()
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  const upcomingRenewals = subscriptions.filter(sub => {
    const renewalDate = new Date(sub.nextBilling)
    return renewalDate >= today && renewalDate <= nextWeek
  })

  const insights = [
    {
      icon: TrendingDown,
      color: "bg-neu-lime",
      title: "Ahorro Potencial",
      description: `Podrías ahorrar ~€${potentialSavings.toFixed(2)}/año cambiando a planes anuales`,
      show: monthlySubs > 2 && potentialSavings > 50,
    },
    {
      icon: AlertCircle,
      color: "bg-neu-pink",
      title: "Próximos Cobros",
      description: `${upcomingRenewals.length} suscripción${upcomingRenewals.length !== 1 ? 'es' : ''} se renovará${upcomingRenewals.length !== 1 ? 'n' : ''} esta semana`,
      show: upcomingRenewals.length > 0,
    },
    {
      icon: TrendingUp,
      color: "bg-neu-yellow",
      title: "Más Cara",
      description: `${mostExpensive.name} (€${(mostExpensive.billingCycle === "monthly" ? mostExpensive.price : mostExpensive.price / 12).toFixed(2)}/mes)`,
      show: subscriptions.length > 1,
    },
    {
      icon: Lightbulb,
      color: "bg-neu-cyan",
      title: "Distribución",
      description: `${monthlySubs} mensual${monthlySubs !== 1 ? 'es' : ''}, ${yearlySubs} anual${yearlySubs !== 1 ? 'es' : ''}`,
      show: subscriptions.length > 0,
    },
  ]

  const visibleInsights = insights.filter(i => i.show)

  if (visibleInsights.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="mb-8"
    >
      <h3 className="text-2xl font-black uppercase mb-4 text-neu-black flex items-center gap-2">
        <Lightbulb className="w-6 h-6" />
        Insights & Recomendaciones
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {visibleInsights.map((insight, index) => (
          <motion.div
            key={insight.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + index * 0.1 }}
            className={`${insight.color} border-[3px] border-neu-black p-4`}
            style={{ boxShadow: "6px 6px 0px 0px #000" }}
          >
            <div className="flex items-start gap-3">
              <div className="bg-neu-black p-2 border-2 border-neu-black">
                <insight.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-sm uppercase mb-1 text-neu-black">
                  {insight.title}
                </h4>
                <p className="text-xs font-bold text-neu-black/80">
                  {insight.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Resumen anual */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        className="mt-6 bg-gradient-to-r from-neu-yellow to-neu-lime border-[3px] border-neu-black p-6"
        style={{ boxShadow: "8px 8px 0px 0px #000" }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm font-black uppercase text-neu-black/60 mb-1">
              Gasto Proyectado Anual
            </p>
            <p className="text-4xl font-black italic text-neu-black">
              €{yearlyTotal.toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-black uppercase text-neu-black/60 mb-1">
              Promedio Mensual
            </p>
            <p className="text-4xl font-black italic text-neu-black">
              €{monthlyTotal.toFixed(2)}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
