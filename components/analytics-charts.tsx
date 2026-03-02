"use client"

import { motion } from "framer-motion"
import { TrendingUp, PieChart, BarChart3, Calendar } from "lucide-react"
import type { Subscription } from "./subscription-card"
import { useMemo } from "react"

interface AnalyticsChartsProps {
  subscriptions: Subscription[]
}

export function AnalyticsCharts({ subscriptions }: AnalyticsChartsProps) {
  if (subscriptions.length === 0) return null

  // Análisis por categoría
  const categoryData = useMemo(() => {
    const categoryMap = new Map<string, { total: number; count: number }>()
    
    subscriptions.forEach(sub => {
      const monthlyPrice = sub.billingCycle === "monthly" ? sub.price : sub.price / 12
      const current = categoryMap.get(sub.category) || { total: 0, count: 0 }
      categoryMap.set(sub.category, {
        total: current.total + monthlyPrice,
        count: current.count + 1,
      })
    })

    const total = Array.from(categoryMap.values()).reduce((acc, { total }) => acc + total, 0)
    
    return Array.from(categoryMap.entries())
      .map(([category, { total, count }]) => ({
        category,
        total,
        count,
        percentage: (total / total) * 100,
      }))
      .sort((a, b) => b.total - a.total)
  }, [subscriptions])

  // Análisis mensual vs anual
  const billingCycleData = useMemo(() => {
    const monthly = subscriptions.filter(s => s.billingCycle === "monthly")
    const yearly = subscriptions.filter(s => s.billingCycle === "yearly")
    
    const monthlyTotal = monthly.reduce((acc, sub) => acc + sub.price, 0)
    const yearlyTotal = yearly.reduce((acc, sub) => acc + sub.price / 12, 0)
    
    return {
      monthly: { count: monthly.length, total: monthlyTotal },
      yearly: { count: yearly.length, total: yearlyTotal },
      totalMonthly: monthlyTotal + yearlyTotal,
    }
  }, [subscriptions])

  // Próximos cobros por mes
  const upcomingCharges = useMemo(() => {
    const now = new Date()
    const monthsData = []
    
    for (let i = 0; i < 3; i++) {
      const month = new Date(now.getFullYear(), now.getMonth() + i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + i + 1, 0)
      
      const monthSubs = subscriptions.filter(sub => {
        const nextBilling = new Date(sub.nextBilling)
        return nextBilling >= month && nextBilling <= monthEnd
      })
      
      const total = monthSubs.reduce((acc, sub) => {
        return acc + (sub.billingCycle === "monthly" ? sub.price : sub.price)
      }, 0)
      
      monthsData.push({
        month: month.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase(),
        total,
        count: monthSubs.length,
      })
    }
    
    return monthsData
  }, [subscriptions])

  const colors = [
    "bg-neu-yellow",
    "bg-neu-lime", 
    "bg-neu-cyan",
    "bg-neu-pink",
    "bg-neu-purple",
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mb-8"
    >
      <h3 className="text-2xl font-black uppercase mb-4 text-neu-black flex items-center gap-2">
        <BarChart3 className="w-6 h-6" />
        Análisis Detallado
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico por Categorías */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white border-[3px] border-neu-black p-6"
          style={{ boxShadow: "8px 8px 0px 0px #000" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-neu-yellow p-2 border-2 border-neu-black">
              <PieChart className="w-5 h-5" />
            </div>
            <h4 className="font-black text-lg uppercase">Por Categoría</h4>
          </div>

          <div className="space-y-3">
            {categoryData.map((item, index) => (
              <div key={item.category}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sm uppercase">{item.category}</span>
                  <span className="font-black text-neu-black">€{item.total.toFixed(2)}/mes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="h-6 border-[3px] border-neu-black relative overflow-hidden"
                    style={{ 
                      width: `${Math.max(item.percentage, 10)}%`,
                      boxShadow: "3px 3px 0px 0px #000",
                    }}
                  >
                    <div className={`h-full ${colors[index % colors.length]}`} />
                  </div>
                  <span className="text-xs font-bold text-neu-black/60">
                    {item.count} {item.count === 1 ? 'suscripción' : 'suscripciones'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Mensual vs Anual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white border-[3px] border-neu-black p-6"
          style={{ boxShadow: "8px 8px 0px 0px #000" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-neu-lime p-2 border-2 border-neu-black">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="font-black text-lg uppercase">Tipo de Facturación</h4>
          </div>

          <div className="space-y-6">
            {/* Mensual */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-sm uppercase">Mensual</span>
                <span className="font-black text-neu-black">
                  {billingCycleData.monthly.count} planes
                </span>
              </div>
              <div 
                className="bg-neu-yellow border-[3px] border-neu-black p-4"
                style={{ boxShadow: "4px 4px 0px 0px #000" }}
              >
                <div className="text-3xl font-black italic">
                  €{billingCycleData.monthly.total.toFixed(2)}
                </div>
                <div className="text-xs font-bold uppercase text-neu-black/60 mt-1">
                  por mes
                </div>
              </div>
            </div>

            {/* Anual */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-sm uppercase">Anual</span>
                <span className="font-black text-neu-black">
                  {billingCycleData.yearly.count} planes
                </span>
              </div>
              <div 
                className="bg-neu-lime border-[3px] border-neu-black p-4"
                style={{ boxShadow: "4px 4px 0px 0px #000" }}
              >
                <div className="text-3xl font-black italic">
                  €{billingCycleData.yearly.total.toFixed(2)}
                </div>
                <div className="text-xs font-bold uppercase text-neu-black/60 mt-1">
                  por mes (prorrateado)
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Próximos Cobros */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-white border-[3px] border-neu-black p-6 lg:col-span-2"
          style={{ boxShadow: "8px 8px 0px 0px #000" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-neu-cyan p-2 border-2 border-neu-black">
              <Calendar className="w-5 h-5" />
            </div>
            <h4 className="font-black text-lg uppercase">Próximos 3 Meses</h4>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {upcomingCharges.map((month, index) => (
              <div 
                key={month.month}
                className={`${colors[index]} border-[3px] border-neu-black p-4`}
                style={{ boxShadow: "4px 4px 0px 0px #000" }}
              >
                <div className="text-sm font-black uppercase mb-2">{month.month}</div>
                <div className="text-2xl font-black italic mb-1">€{month.total.toFixed(2)}</div>
                <div className="text-xs font-bold uppercase text-neu-black/60">
                  {month.count} {month.count === 1 ? 'cobro' : 'cobros'}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
