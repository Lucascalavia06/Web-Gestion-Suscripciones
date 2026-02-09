"use client"

import React from "react"

import { motion } from "framer-motion"
import { DollarSign, Calendar, TrendingUp, CreditCard } from "lucide-react"

interface StatCardProps {
  title: string
  value: string
  icon: React.ReactNode
  color: string
  rotation: number
  delay: number
}

function StatCard({ title, value, icon, color, rotation, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: rotation * 2, opacity: 0 }}
      animate={{ scale: 1, rotate: rotation, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 200, 
        damping: 15,
        delay 
      }}
      whileHover={{ 
        scale: 1.05, 
        rotate: 0,
        transition: { type: "spring", stiffness: 400 }
      }}
      className={`${color} p-6 border-[3px] border-neu-black relative`}
      style={{
        boxShadow: "8px 8px 0px 0px #000",
      }}
    >
      {/* Tape effect */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-neu-yellow/80 border-2 border-neu-black transform -rotate-2" />
      
      <div className="flex items-start justify-between">
        <div>
          <p className="text-neu-black text-xs font-bold uppercase tracking-widest mb-2">
            {title}
          </p>
          <p className="text-neu-black text-3xl font-bold italic">
            {value}
          </p>
        </div>
        <div className="bg-neu-black p-3 border-[3px] border-neu-black">
          {icon}
        </div>
      </div>
    </motion.div>
  )
}

interface StatsSectionProps {
  totalSpending: number
  subscriptionCount: number
  nextRenewal: string
  averageCost: number
}

export function StatsSection({ totalSpending, subscriptionCount, nextRenewal, averageCost }: StatsSectionProps) {
  const stats = [
    {
      title: "Total mensual",
      value: `$${totalSpending.toFixed(2)}`,
      icon: <DollarSign className="w-6 h-6 text-neu-lime" />,
      color: "bg-neu-lime",
      rotation: -2,
    },
    {
      title: "Suscripciones activas",
      value: subscriptionCount.toString(),
      icon: <CreditCard className="w-6 h-6 text-neu-blue" />,
      color: "bg-neu-blue",
      rotation: 1,
    },
    {
      title: "Próxima renovación",
      value: nextRenewal,
      icon: <Calendar className="w-6 h-6 text-neu-orange" />,
      color: "bg-neu-orange",
      rotation: -1.5,
    },
    {
      title: "Costo promedio",
      value: `$${averageCost.toFixed(2)}`,
      icon: <TrendingUp className="w-6 h-6 text-neu-pink" />,
      color: "bg-neu-pink",
      rotation: 2,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
      {stats.map((stat, index) => (
        <StatCard
          key={stat.title}
          {...stat}
          delay={index * 0.1}
        />
      ))}
    </div>
  )
}