"use client"

import React from "react"

import { motion } from "framer-motion"
import { DollarSign, Calendar, TrendingUp, CreditCard, LogIn, UserPlus } from "lucide-react"

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
  totalSpending?: number
  subscriptionCount?: number
  nextRenewal?: string
  averageCost?: number
  isAuthenticated?: boolean
  onLoginClick?: () => void
  onRegisterClick?: () => void
}

export function StatsSection({ 
  totalSpending = 0, 
  subscriptionCount = 0, 
  nextRenewal = "N/A", 
  averageCost = 0,
  isAuthenticated = false,
  onLoginClick,
  onRegisterClick
}: StatsSectionProps) {
  
  // Si no está autenticado, mostrar mensaje especial
  if (!isAuthenticated) {
    return (
      <div className="mb-12">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-neu-yellow to-neu-lime p-8 md:p-12 border-[4px] border-neu-black relative overflow-hidden"
          style={{
            boxShadow: "12px 12px 0px 0px #000",
          }}
        >
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-neu-pink/20 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-neu-blue/20 rounded-full -ml-20 -mb-20" />
          
          <div className="relative z-10 text-center">
            <h2 className="text-3xl md:text-4xl font-bold uppercase italic text-neu-black mb-4">
              Si no te has registrado o no has iniciado sesión,
            </h2>
            <p className="text-xl md:text-2xl font-bold uppercase text-neu-black mb-8">
              ya estás tardando para administrar mejor tus gastos
            </p>
            
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, rotate: -2 }}
                whileTap={{ scale: 0.95, y: 4 }}
                onClick={onLoginClick}
                className="bg-neu-blue text-neu-black px-6 md:px-8 py-4 font-bold uppercase tracking-wider border-[3px] border-neu-black flex items-center justify-center gap-3 w-full sm:w-auto"
                style={{ boxShadow: "6px 6px 0px 0px #000" }}
              >
                <LogIn className="w-5 h-5" />
                Iniciar Sesión
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05, rotate: 2 }}
                whileTap={{ scale: 0.95, y: 4 }}
                onClick={onRegisterClick}
                className="bg-neu-pink text-neu-black px-6 md:px-8 py-4 font-bold uppercase tracking-wider border-[3px] border-neu-black flex items-center justify-center gap-3 w-full sm:w-auto"
                style={{ boxShadow: "6px 6px 0px 0px #000" }}
              >
                <UserPlus className="w-5 h-5" />
                Registrarse
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

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