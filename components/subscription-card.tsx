"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { 
  Trash2, 
  Edit3, 
  Music, 
  Film, 
  Cloud, 
  Gamepad2, 
  BookOpen, 
  Dumbbell,
  Tv,
  ShoppingBag,
  Clock,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface Subscription {
  id: string
  name: string
  price: number
  billingCycle: "monthly" | "yearly"
  category: string
  nextBilling: string
  color: string
}

const categoryIcons: Record<string, LucideIcon> = {
  music: Music,
  streaming: Film,
  cloud: Cloud,
  gaming: Gamepad2,
  education: BookOpen,
  fitness: Dumbbell,
  tv: Tv,
  shopping: ShoppingBag,
}

const translateCategory = (cat: string) => {
  const map: Record<string, string> = {
    Music: "Música",
    Streaming: "Streaming",
    Cloud: "Nube",
    Gaming: "Juegos",
    Education: "Educación",
    Fitness: "Fitness",
    TV: "TV",
    Shopping: "Compras",
  }
  return map[cat] ?? cat
}

const cardColors = [
  "bg-neu-lime",
  "bg-neu-blue", 
  "bg-neu-orange",
  "bg-neu-cyan",
  "bg-neu-yellow",
  "bg-neu-pink",
]

interface SubscriptionCardProps {
  subscription: Subscription
  index: number
  onDelete: (id: string) => void
  onEdit: (subscription: Subscription) => void
}

export function SubscriptionCard({ subscription, index, onDelete, onEdit }: SubscriptionCardProps) {
  const Icon = categoryIcons[subscription.category.toLowerCase()] || Cloud
  const bgColor = cardColors[index % cardColors.length]

  // Countdown timer
  const [timeRemaining, setTimeRemaining] = useState<string>("")

  // Calcular badges
  const getBadges = () => {
    const badges = []
    const now = new Date()
    const nextBilling = new Date(subscription.nextBilling)
    const daysUntilRenewal = Math.floor((nextBilling.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    // Próxima a vencer
    if (daysUntilRenewal <= 7 && daysUntilRenewal > 0) {
      badges.push({ text: "Próxima", color: "bg-neu-pink" })
    }
    
    // Vencida
    if (daysUntilRenewal < 0) {
      badges.push({ text: "Vencida", color: "bg-destructive" })
    }
    
    // Anual
    if (subscription.billingCycle === "yearly") {
      badges.push({ text: "Anual", color: "bg-neu-lime" })
    }
    
    return badges
  }

  const badges = getBadges()

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date()
      const nextBilling = new Date(subscription.nextBilling)
      if (isNaN(nextBilling.getTime())) {
        setTimeRemaining("Fecha inválida")
        return
      }

      const diff = nextBilling.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeRemaining("Vencido")
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h`)
      } else {
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        setTimeRemaining(`${hours}h ${minutes}m`)
      }
    }

    calculateTimeRemaining()
    const interval = setInterval(calculateTimeRemaining, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [subscription.nextBilling])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -50 }}
      transition={{ 
        type: "spring", 
        stiffness: 200, 
        damping: 20,
        delay: index * 0.05 
      }}
      whileHover={{ 
        rotate: 2, 
        scale: 1.02,
        transition: { type: "spring", stiffness: 400 }
      }}
      className={`${bgColor} p-6 border-[3px] border-neu-black relative group`}
      style={{
        boxShadow: "10px 10px 0px 0px #000",
      }}
    >
      {/* Badges */}
      {badges.length > 0 && (
        <div className="absolute -top-3 -right-3 flex gap-2 z-10">
          {badges.map((badge, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className={`${badge.color} px-3 py-1 border-[3px] border-neu-black font-black text-xs uppercase`}
              style={{ boxShadow: "3px 3px 0px 0px #000" }}
            >
              {badge.text}
            </motion.div>
          ))}
        </div>
      )}

      {/* Corner fold effect */}
      <div className="absolute top-0 right-0 w-0 h-0 border-t-20 border-t-neu-black border-l-20 border-l-transparent" />

      <div className="flex items-start justify-between mb-4">
        <div className="bg-neu-black p-3 border-[3px] border-neu-black transform -rotate-3">
          <Icon className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9, y: 2 }}
            onClick={() => onEdit(subscription)}
            className="bg-neu-yellow p-2 border-[3px] border-neu-black"
            style={{ boxShadow: "3px 3px 0px 0px #000" }}
          >
            <Edit3 className="w-4 h-4 text-neu-black" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9, y: 2 }}
            onClick={() => onDelete(subscription.id)}
            className="bg-destructive p-2 border-[3px] border-neu-black"
            style={{ boxShadow: "3px 3px 0px 0px #000" }}
          >
            <Trash2 className="w-4 h-4 text-neu-black" />
          </motion.button>
        </div>
      </div>

      <h3 className="text-xl font-bold uppercase italic text-neu-black mb-1 tracking-tight">
        {subscription.name}
      </h3>
      
      <p className="text-xs font-bold uppercase tracking-widest text-neu-black/70 mb-4">
        {translateCategory(subscription.category)}
      </p>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-4xl font-bold italic text-neu-black">
            ${subscription.price.toFixed(2)}
          </p>
          <p className="text-xs font-bold uppercase tracking-wider text-neu-black/70">
            /{subscription.billingCycle === "monthly" ? "mes" : "año"}
          </p>
        </div>
        
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neu-black/70 flex items-center gap-1 justify-end mb-1">
            <Clock className="w-3 h-3" />
            Próximo cobro
          </p>
          <p className="text-lg font-bold bg-neu-black text-white px-2 py-1 border-2 border-neu-black inline-block"
             style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,0.3)" }}>
            {timeRemaining}
          </p>
          <p className="text-xs font-bold text-neu-black/70 mt-1">
            {(() => {
              const d = new Date(subscription.nextBilling)
              return isNaN(d.getTime()) ? "Fecha inválida" : d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
            })()}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
