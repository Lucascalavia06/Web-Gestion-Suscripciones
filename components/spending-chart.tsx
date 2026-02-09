"use client"

import { motion } from "framer-motion"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import type { Subscription } from "./subscription-card"

interface SpendingChartProps {
  subscriptions: Subscription[]
}

const COLORS = {
  Streaming: "#A3E635",
  Music: "#FDE047",
  Cloud: "#67E8F9",
  Gaming: "#F472B6",
  Education: "#C084FC",
  Fitness: "#FB923C",
  TV: "#34D399",
  Shopping: "#F87171",
  Otros: "#94A3B8",
}

export function SpendingChart({ subscriptions }: SpendingChartProps) {
  // Agrupar por categoría y calcular gasto mensual
  const categoryData = subscriptions.reduce((acc, sub) => {
    const monthlyPrice = sub.billingCycle === "monthly" ? sub.price : sub.price / 12
    const category = sub.category || "Otros"
    
    if (!acc[category]) {
      acc[category] = 0
    }
    acc[category] += monthlyPrice
    
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value: Math.round(value * 100) / 100,
    percentage: 0, // Se calculará después
  }))

  const total = chartData.reduce((sum, item) => sum + item.value, 0)
  chartData.forEach(item => {
    item.percentage = Math.round((item.value / total) * 100)
  })

  if (chartData.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-white border-[3px] border-neu-black p-6"
      style={{ boxShadow: "8px 8px 0px 0px #000" }}
    >
      <h3 className="text-xl font-black uppercase mb-4 text-neu-black">
        💰 Gasto por Categoría
      </h3>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name} ${percentage}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              strokeWidth={3}
              stroke="#000"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.Otros}
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: "#FEF9C3",
                border: "3px solid #000",
                borderRadius: 0,
                fontWeight: "bold",
              }}
              formatter={(value: number) => `€${value.toFixed(2)}/mes`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Leyenda personalizada */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {chartData.map((item) => (
          <div 
            key={item.name} 
            className="flex items-center gap-2 p-2 bg-neu-cream border-2 border-neu-black"
          >
            <div 
              className="w-4 h-4 border-2 border-neu-black"
              style={{ 
                backgroundColor: COLORS[item.name as keyof typeof COLORS] || COLORS.Otros 
              }}
            />
            <span className="text-xs font-bold text-neu-black">
              {item.name}: €{item.value.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
