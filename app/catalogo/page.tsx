"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Zap } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { CatalogSection } from "@/components/catalog-section"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import { toast } from "sonner"

export default function CatalogoPage() {
  const [user, setUser] = useState<User | null>(null)

  // Fetch user session
  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user ?? null
      if (!mounted) return
      setUser(currentUser)
    })()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const handleSubscriptionAdded = async () => {
    // Mostrar mensaje de éxito
    toast.success("Suscripción añadida correctamente")
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neu-cream pt-40 pb-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-4">
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
                className="bg-neu-cyan p-4 border-[3px] border-neu-black rotate-6"
                style={{ boxShadow: "6px 6px 0px 0px #000" }}
              >
                <Zap className="w-8 h-8 text-neu-black" fill="currentColor" />
              </motion.div>
              <h1 className="text-4xl md:text-6xl font-bold uppercase italic text-neu-black tracking-tighter">
                Catálogo
              </h1>
            </div>
            <p className="text-xl md:text-2xl font-bold text-neu-black uppercase tracking-wide leading-relaxed">
              <span className="inline-block bg-neu-yellow px-3 py-1 border-2 border-neu-black mr-2" style={{ boxShadow: "3px 3px 0px 0px #000" }}>Explora</span>
              <span className="inline-block bg-neu-lime px-3 py-1 border-2 border-neu-black mr-2" style={{ boxShadow: "3px 3px 0px 0px #000" }}>Descubre</span>
              <span className="inline-block bg-neu-pink px-3 py-1 border-2 border-neu-black" style={{ boxShadow: "3px 3px 0px 0px #000" }}>Suscríbete</span>
            </p>
          </motion.div>

          {/* Catalog Section */}
          <CatalogSection 
            user={user}
            onSubscriptionAdded={handleSubscriptionAdded}
          />
        </div>
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
    </>
  )
}
