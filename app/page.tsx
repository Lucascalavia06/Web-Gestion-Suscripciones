"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Search, Filter, Zap } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { StatsSection } from "@/components/stats-section"
import { SubscriptionCard, type Subscription } from "@/components/subscription-card"
import { AddSubscriptionModal } from "@/components/add-subscription-modal"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import { toast } from "sonner"
import { getUserSuscripciones, deleteSuscripcion, type SuscripcionUsuario } from "@/lib/actions/subscriptions"

const initialSubscriptions: Subscription[] = [
  {
    id: "1",
    name: "Netflix",
    price: 15.99,
    billingCycle: "monthly",
    category: "Streaming",
    nextBilling: "2026-02-15",
    color: "",
  },
  {
    id: "2",
    name: "Spotify",
    price: 9.99,
    billingCycle: "monthly",
    category: "Music",
    nextBilling: "2026-02-20",
    color: "",
  },
  {
    id: "3",
    name: "iCloud+",
    price: 2.99,
    billingCycle: "monthly",
    category: "Cloud",
    nextBilling: "2026-02-10",
    color: "",
  },
  {
    id: "4",
    name: "Xbox Game Pass",
    price: 14.99,
    billingCycle: "monthly",
    category: "Gaming",
    nextBilling: "2026-02-25",
    color: "",
  },
  {
    id: "5",
    name: "Duolingo Plus",
    price: 83.99,
    billingCycle: "yearly",
    category: "Education",
    nextBilling: "2026-08-01",
    color: "",
  },
  {
    id: "6",
    name: "Peloton",
    price: 12.99,
    billingCycle: "monthly",
    category: "Fitness",
    nextBilling: "2026-02-18",
    color: "",
  },
]

export default function SubscriptionDashboard() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  // Función para convertir SuscripcionUsuario a Subscription
  const mapSuscripcionToSubscription = (sus: SuscripcionUsuario): Subscription => {
    // Los nombres vienen en minúsculas desde Supabase
    const serviceName = sus.catalogo_planes?.catalogo_servicios?.nombre || "Servicio"
    const planName = sus.catalogo_planes?.nombre_plan || ""
    const categoria = sus.catalogo_planes?.catalogo_servicios?.catalogo_categorias?.nombre || "Otros"
    const frecuencia = sus.catalogo_planes?.frecuencia?.toLowerCase() || "mensual"
    
    return {
      id: String(sus.id), // Convertir integer a string
      name: sus.nombre_personalizado || `${serviceName}${planName ? ` - ${planName}` : ""}`,
      price: sus.precio_personalizado ?? sus.catalogo_planes?.precio_base ?? 0,
      billingCycle: frecuencia.includes("anual") || frecuencia.includes("año") || frecuencia.includes("year") ? "yearly" : "monthly",
      category: categoria,
      nextBilling: sus.fecha_recordatorio || "", // Campo correcto de la BD
      color: "",
    }
  }

  // Función para cargar suscripciones desde Supabase
  const loadSuscripciones = async (userId: string) => {
    setLoading(true)
    try {
      const suscripciones = await getUserSuscripciones(userId)
      const mapped = suscripciones.map(mapSuscripcionToSubscription)
      setSubscriptions(mapped)
    } catch (error) {
      console.error("Error cargando suscripciones:", error)
      toast.error("Error al cargar suscripciones")
    } finally {
      setLoading(false)
    }
  }

  const categories = useMemo(() => {
    const cats = new Set(subscriptions.map((s) => s.category))
    return ["all", ...Array.from(cats)]
  }, [subscriptions])

  const displayCategory = (cat: string) => {
    const map: Record<string, string> = {
      all: "Todas",
      Streaming: "Streaming",
      Music: "Música",
      Cloud: "Nube",
      Gaming: "Juegos",
      Education: "Educación",
      Fitness: "Fitness",
      TV: "TV",
      Shopping: "Compras",
    }
    return map[cat] ?? cat
  }

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      const matchesSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "all" || sub.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [subscriptions, searchQuery, selectedCategory])

  const stats = useMemo(() => {
    const monthlyTotal = subscriptions.reduce((acc, sub) => {
      return acc + (sub.billingCycle === "monthly" ? sub.price : sub.price / 12)
    }, 0)
    
    const sortedByDate = [...subscriptions].sort(
      (a, b) => new Date(a.nextBilling).getTime() - new Date(b.nextBilling).getTime()
    )
    const nextRenewal = sortedByDate[0]?.nextBilling || "N/A"
    const formattedDate = nextRenewal !== "N/A" 
      ? new Date(nextRenewal).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : "N/A"

    // Contar suscripciones próximas a vencer (próximos 7 días)
    const today = new Date()
    const inSevenDays = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    const proximasVencer = subscriptions.filter((sub) => {
      const date = new Date(sub.nextBilling)
      return date >= today && date <= inSevenDays
    }).length

    return {
      totalSpending: monthlyTotal,
      subscriptionCount: subscriptions.length,
      nextRenewal: formattedDate,
      averageCost: subscriptions.length > 0 ? monthlyTotal / subscriptions.length : 0,
      // Campos para el panel de proyección anual
      totalMensual: monthlyTotal,
      activas: subscriptions.length,
      proximasVencer: proximasVencer,
    }
  }, [subscriptions])

  const handleAddSubscription = async () => {
    // El modal maneja la creación, aquí solo recargamos
    if (user) {
      await loadSuscripciones(user.id)
    }
  }

  const handleUpdateSubscription = async () => {
    // El modal maneja la actualización, aquí solo recargamos
    if (user) {
      await loadSuscripciones(user.id)
    }
    setEditingSubscription(null)
  }

  const handleDeleteSubscription = async (id: string) => {
    if (!user) return
    
    try {
      const result = await deleteSuscripcion(id)
      if (result.success) {
        setSubscriptions((prev) => prev.filter((sub) => sub.id !== id))
        toast.success("Suscripción eliminada")
      } else {
        toast.error(result.error || "Error al eliminar la suscripción")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al eliminar la suscripción")
    }
  }

  const handleEditSubscription = (subscription: Subscription) => {
    setEditingSubscription(subscription)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingSubscription(null)
  }

  // Fetch user session and subscriptions
  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user ?? null
      if (!mounted) return
      setUser(currentUser)

      if (currentUser) {
        await loadSuscripciones(currentUser.id)
      } else {
        setLoading(false)
      }
    })()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        loadSuscripciones(u.id)
      } else {
        setSubscriptions([])
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-32 pb-16 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="bg-neu-yellow p-3 border-[3px] border-neu-black inline-block"
              style={{ boxShadow: "6px 6px 0px 0px #000" }}
            >
              <Zap className="w-8 h-8 text-neu-black" fill="currentColor" />
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-bold uppercase italic text-neu-black tracking-tighter">
              Tus Suscripciones
            </h1>
          </div>
          <p className="text-xl md:text-2xl font-bold text-neu-black uppercase tracking-wide leading-relaxed">
            <span className="inline-block bg-neu-yellow px-3 py-1 border-2 border-neu-black mr-2" style={{ boxShadow: "3px 3px 0px 0px #000" }}>Rastrea</span>
            <span className="inline-block bg-neu-lime px-3 py-1 border-2 border-neu-black mr-2" style={{ boxShadow: "3px 3px 0px 0px #000" }}>Administra</span>
            <span className="inline-block bg-neu-cyan px-3 py-1 border-2 border-neu-black" style={{ boxShadow: "3px 3px 0px 0px #000" }}>Ahorra dinero</span>
          </p>
        </motion.div>

        {/* Stats Section */}
        <StatsSection {...stats} />

        {/* Annual Spending Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8 p-8 bg-neu-black border-4 border-neu-black flex flex-col md:flex-row items-center justify-between gap-6"
          style={{ boxShadow: "8px 8px 0px 0px #A3E635" }}
        >
          <div className="flex-1">
            <p className="text-neu-yellow font-bold uppercase text-sm mb-2">Proyección Anual</p>
            <h3 className="text-5xl md:text-6xl font-black text-neu-yellow italic">€{((stats.totalMensual || 0) * 12).toFixed(2)}</h3>
            <p className="text-neu-yellow/80 font-bold uppercase mt-2">Gasto estimado en suscripciones</p>
          </div>
          <div className="flex gap-8 md:gap-12">
            <div className="text-center">
              <p className="text-neu-yellow/60 font-bold text-xs uppercase mb-1">Activas</p>
              <p className="text-3xl font-black text-neu-yellow">{stats.activas || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-neu-yellow/60 font-bold text-xs uppercase mb-1">Por Vencer</p>
              <p className="text-3xl font-black text-neu-yellow">{stats.proximasVencer || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-neu-yellow/60 font-bold text-xs uppercase mb-1">Mensual</p>
              <p className="text-3xl font-black text-neu-yellow">€{(stats.totalMensual || 0).toFixed(2)}</p>
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col md:flex-row gap-4 mb-8"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neu-black" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar suscripciones..."
              className="w-full pl-12 pr-4 py-4 bg-neu-cream border-[3px] border-neu-black text-neu-black font-bold placeholder:text-neu-black/40 focus:outline-none focus:ring-4 focus:ring-neu-yellow"
              style={{ boxShadow: "6px 6px 0px 0px #000" }}
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neu-black" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full md:w-48 pl-12 pr-4 py-4 bg-neu-cream border-[3px] border-neu-black text-neu-black font-bold focus:outline-none focus:ring-4 focus:ring-neu-yellow appearance-none cursor-pointer uppercase"
              style={{ boxShadow: "6px 6px 0px 0px #A3E635" }}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {displayCategory(cat)}
                </option>
              ))}
            </select>
          </div>

          {/* Add Button */}
          <motion.button
            whileHover={{ scale: 1.05, rotate: -2 }}
            whileTap={{ scale: 0.95, y: 4 }}
            onClick={() => setIsModalOpen(true)}
            className="bg-neu-black text-neu-yellow px-8 py-4 font-bold uppercase tracking-wider border-[3px] border-neu-black flex items-center justify-center gap-3"
            style={{ boxShadow: "6px 6px 0px 0px #A3E635" }}
          >
            <Plus className="w-6 h-6" />
            Agregar suscripción
          </motion.button>
        </motion.div>

        {/* Subscriptions Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredSubscriptions.map((subscription, index) => (
              <SubscriptionCard
                key={subscription.id}
                subscription={subscription}
                index={index}
                onDelete={handleDeleteSubscription}
                onEdit={handleEditSubscription}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredSubscriptions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div 
              className="inline-block bg-neu-yellow p-8 border-[3px] border-neu-black mb-6"
              style={{ boxShadow: "8px 8px 0px 0px #000" }}
            >
              <Search className="w-16 h-16 text-neu-black mx-auto" />
            </div>
            <h3 className="text-2xl font-bold uppercase italic text-neu-black mb-2">
              No se encontraron suscripciones
            </h3>
            <p className="text-neu-black/70 font-bold uppercase">
              {searchQuery ? "Prueba con otro término de búsqueda" : "¡Ve al Catálogo para agregar suscripciones!"}
            </p>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t-[3px] border-neu-black bg-neu-yellow">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-neu-black p-2 border-[3px] border-neu-black">
                <Zap className="w-5 h-5 text-neu-yellow" fill="currentColor" />
              </div>
              <span className="font-bold uppercase italic text-neu-black">
                SUBTRACKR © 2026
              </span>
            </div>
            <p className="text-sm font-bold text-neu-black/70 uppercase tracking-wide">
              Construido con Neubrutalismo
            </p>
          </div>
        </div>
      </footer>

      {/* Modal */}
      <AddSubscriptionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAdd={handleAddSubscription}
        editingSubscription={editingSubscription}
        onUpdate={handleUpdateSubscription}
        currentSubscriptions={subscriptions}
      />
    </div>
  )
}