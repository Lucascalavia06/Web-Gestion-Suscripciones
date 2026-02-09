"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Zap, Bell, User, Menu, LogIn, LogOut, X } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { AuthForm } from "./auth-form"
import { toast } from "sonner"

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [userName, setUserName] = useState<string>("")

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        setUserName(session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuario')
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        setUserName(session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuario')
      } else {
        setUserName('')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error("Error al cerrar sesión")
    } else {
      toast.success("Sesión cerrada correctamente")
    }
  }

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="fixed top-4 left-4 right-4 z-50 bg-neu-yellow border-[3px] border-neu-black"
      style={{
        boxShadow: "6px 6px 0px 0px #000, 10px 10px 0px 0px #000",
      }}
    >
      <div className="flex items-center justify-between px-6 py-4">
        <motion.div 
          className="flex items-center gap-3"
          whileHover={{ scale: 1.02 }}
        >
          <div className="bg-neu-black p-2 border-[3px] border-neu-black">
            <Zap className="w-6 h-6 text-neu-yellow" fill="currentColor" />
          </div>
          <span className="text-2xl font-bold uppercase italic tracking-tight text-neu-black">
            SUBTRACKR
          </span>
        </motion.div>

          <div className="hidden md:flex items-center gap-6">
            <motion.a
              href="/"
              whileHover={{ scale: 1.05, rotate: -1 }}
              whileTap={{ scale: 0.95 }}
              className="text-neu-black font-bold uppercase text-sm tracking-wide hover:underline underline-offset-4 decoration-[3px]"
            >
              Home
            </motion.a>
            <motion.a
              href="/catalogo"
              whileHover={{ scale: 1.05, rotate: -1 }}
              whileTap={{ scale: 0.95 }}
              className="text-neu-black font-bold uppercase text-sm tracking-wide hover:underline underline-offset-4 decoration-[3px]"
            >
              Catálogo
            </motion.a>
            {["Analíticas", "Ajustes"].map((item) => (
            <motion.button
              key={item}
              whileHover={{ scale: 1.05, rotate: -1 }}
              whileTap={{ scale: 0.95 }}
              className="text-neu-black font-bold uppercase text-sm tracking-wide hover:underline underline-offset-4 decoration-[3px]"
            >
              {item}
            </motion.button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="relative bg-neu-black p-2 border-[3px] border-neu-black"
          >
            <Bell className="w-5 h-5 text-neu-yellow" />
            <span className="absolute -top-2 -right-2 bg-neu-pink text-neu-black text-xs font-bold w-5 h-5 flex items-center justify-center border-2 border-neu-black">
              3
            </span>
          </motion.button>
          
          {user ? (
            <>
              <div 
                className="hidden md:flex items-center gap-2 bg-neu-pink border-[3px] border-neu-black px-4 py-2"
                style={{ boxShadow: "4px 4px 0px 0px #000" }}
              >
                <User className="w-4 h-4 text-neu-black" />
                <span className="font-bold uppercase text-xs text-neu-black">{userName}</span>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="bg-neu-black text-neu-yellow px-4 py-2 font-bold uppercase text-xs tracking-wider border-[3px] border-neu-black flex items-center gap-2"
                style={{ boxShadow: "4px 4px 0px 0px #000" }}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Salir</span>
              </motion.button>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAuthModalOpen(true)}
              className="bg-neu-black text-neu-yellow px-4 py-2 font-bold uppercase text-xs tracking-wider border-[3px] border-neu-black flex items-center gap-2"
              style={{ boxShadow: "4px 4px 0px 0px #000" }}
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden md:inline">Iniciar Sesión</span>
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden bg-neu-black p-2 border-[3px] border-neu-black"
          >
            <Menu className="w-5 h-5 text-neu-yellow" />
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="md:hidden border-t-[3px] border-neu-black bg-neu-yellow"
        >
            <motion.a
              href="/"
              whileTap={{ scale: 0.95 }}
              className="block w-full text-left px-6 py-3 text-neu-black font-bold uppercase text-sm tracking-wide hover:bg-neu-black hover:text-neu-yellow border-b-2 border-neu-black"
            >
              Home
            </motion.a>
            <motion.a
              href="/catalogo"
              whileTap={{ scale: 0.95 }}
              className="block w-full text-left px-6 py-3 text-neu-black font-bold uppercase text-sm tracking-wide hover:bg-neu-black hover:text-neu-yellow border-b-2 border-neu-black"
            >
              Catálogo
            </motion.a>
            {["Analíticas", "Ajustes"].map((item) => (
            <motion.button
              key={item}
              whileTap={{ scale: 0.95 }}
              className="block w-full text-left px-6 py-3 text-neu-black font-bold uppercase text-sm tracking-wide hover:bg-neu-black hover:text-neu-yellow border-b-2 border-neu-black last:border-b-0"
            >
              {item}
            </motion.button>
          ))}
          
          {user ? (
            <>
              <div className="flex items-center gap-2 px-6 py-3 border-b-2 border-neu-black">
                <User className="w-4 h-4 text-neu-black" />
                <span className="font-bold uppercase text-sm text-neu-black">{userName}</span>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center gap-2 w-full text-left px-6 py-3 text-neu-black font-bold uppercase text-sm tracking-wide hover:bg-neu-black hover:text-neu-yellow border-b-2 border-neu-black"
              >
                <LogOut className="w-4 h-4" />
                Salir
              </motion.button>
            </>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-2 w-full text-left px-6 py-3 text-neu-black font-bold uppercase text-sm tracking-wide hover:bg-neu-black hover:text-neu-yellow border-b-2 border-neu-black"
            >
              <LogIn className="w-4 h-4" />
              Iniciar Sesión
            </motion.button>
          )}
        </motion.div>
      )}
      
      {/* Auth Modal */}
      <AnimatePresence>
        {authModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAuthModalOpen(false)}
              className="fixed inset-0 bg-neu-black/60 z-50 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 100, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 100, rotate: 10 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md z-50"
            >
              <div 
                className="bg-neu-cream border-4 border-neu-black p-2 relative max-h-[90vh] overflow-y-auto"
                style={{
                  boxShadow: "12px 12px 0px 0px #000",
                }}
              >
                {/* Close Button */}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setAuthModalOpen(false)}
                  className="absolute top-4 right-4 bg-neu-pink p-2 border-[3px] border-neu-black z-10"
                  style={{ boxShadow: "4px 4px 0px 0px #000" }}
                >
                  <X className="w-5 h-5 text-neu-black" />
                </motion.button>

                {/* Auth Form */}
                <div className="pt-2">
                  <AuthForm onSuccess={() => setAuthModalOpen(false)} />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
