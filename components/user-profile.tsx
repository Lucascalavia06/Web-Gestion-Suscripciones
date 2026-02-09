"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { LogOut, User } from "lucide-react"

interface UserSession {
  email: string
  name?: string
}

export function UserProfile() {
  const [user, setUser] = useState<UserSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Obtener sesión actual
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setUser({
          email: session.user.email || "",
          name: session.user.user_metadata?.name,
        })
      } else {
        // Si no hay sesión, redirigir a auth
        router.push("/auth")
      }
      
      setIsLoading(false)
    }

    getSession()

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser({
            email: session.user.email || "",
            name: session.user.user_metadata?.name,
          })
        } else {
          setUser(null)
          router.push("/auth")
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth")
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-neu-yellow/50 border-[3px] border-neu-black animate-pulse" />
        <div className="h-4 w-32 bg-neu-yellow/50 border-[3px] border-neu-black animate-pulse" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex items-center gap-3">
      {/* User Info */}
      <div 
        className="flex items-center gap-3 bg-white border-[3px] border-neu-black px-4 py-2"
        style={{ boxShadow: "4px 4px 0px 0px #000" }}
      >
        <div className="bg-neu-yellow border-[3px] border-neu-black p-1.5">
          <User className="w-4 h-4 text-neu-black" />
        </div>
        <div>
          <p className="font-bold text-sm uppercase text-neu-black">
            {user.name || "Usuario"}
          </p>
          <p className="text-xs text-neu-black/60 font-semibold">
            {user.email}
          </p>
        </div>
      </div>

      {/* Logout Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleLogout}
        className="bg-neu-pink border-[3px] border-neu-black p-2 flex items-center justify-center"
        style={{ boxShadow: "4px 4px 0px 0px #000" }}
        title="Cerrar sesión"
      >
        <LogOut className="w-5 h-5 text-neu-black" />
      </motion.button>
    </div>
  )
}
