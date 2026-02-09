"use client"

import { motion } from "framer-motion"
import { Mail, Lock, User, LogIn, UserPlus, AlertCircle } from "lucide-react"
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface AuthFormProps {
  onSuccess?: () => void
}

export function AuthForm({ onSuccess }: AuthFormProps = {}) {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!email || !password) {
      setError("Por favor completa todos los campos")
      return
    }

    setIsLoading(true)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
      } else if (data.user) {
        // Login exitoso - cerrar modal y refrescar
        onSuccess?.()
        router.refresh()
      }
    } catch (error) {
      setError("Error al iniciar sesión. Intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!email || !password) {
      setError("Por favor completa todos los campos")
      return
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    setIsLoading(true)

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split("@")[0],
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
      } else if (data.user) {
        // Registro exitoso - Como desactivaste la confirmación de email,
        // el usuario puede iniciar sesión inmediatamente
        if (data.session) {
          // Login automático después del registro (confirmación desactivada)
          onSuccess?.()
          router.refresh()
        } else {
          // Si por alguna razón no hay sesión, avisar al usuario
          setError("¡Cuenta creada exitosamente! Ya puedes iniciar sesión.")
          setActiveTab("login")
        }
      }
    } catch (error) {
      setError("Error al crear la cuenta. Intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setName("")
    setError(null)
  }

  const handleTabChange = (tab: "login" | "signup") => {
    setActiveTab(tab)
    resetForm()
  }

  return (
    <div className="w-full max-w-md">
      <div 
        className="bg-neu-cream border-4 border-neu-black p-8"
        style={{
          boxShadow: "12px 12px 0px 0px #000",
        }}
      >
        {/* Header con Tabs */}
        <div className="mb-8">
          <div className="flex gap-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleTabChange("login")}
              className={`flex-1 py-3 px-4 font-bold uppercase text-sm tracking-wider border-[3px] border-neu-black flex items-center justify-center gap-2 transition-colors ${
                activeTab === "login"
                  ? "bg-neu-black text-neu-yellow"
                  : "bg-white text-neu-black"
              }`}
              style={{
                boxShadow: activeTab === "login" ? "4px 4px 0px 0px #FFFF00" : "4px 4px 0px 0px #000",
              }}
            >
              <LogIn className="w-4 h-4" />
              Iniciar Sesión
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleTabChange("signup")}
              className={`flex-1 py-3 px-4 font-bold uppercase text-sm tracking-wider border-[3px] border-neu-black flex items-center justify-center gap-2 transition-colors ${
                activeTab === "signup"
                  ? "bg-neu-black text-neu-lime"
                  : "bg-white text-neu-black"
              }`}
              style={{
                boxShadow: activeTab === "signup" ? "4px 4px 0px 0px #A3E635" : "4px 4px 0px 0px #000",
              }}
            >
              <UserPlus className="w-4 h-4" />
              Registrarse
            </motion.button>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold uppercase italic text-neu-black tracking-tight text-center">
            {activeTab === "login" ? "¡Bienvenido!" : "¡Únete ahora!"}
          </h2>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-100 border-[3px] border-neu-black flex items-start gap-3"
            style={{ boxShadow: "4px 4px 0px 0px #000" }}
          >
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm font-bold text-red-600">{error}</p>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={activeTab === "login" ? handleLogin : handleSignup} className="space-y-5">
          {/* Name Field - Solo en registro */}
          {activeTab === "signup" && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-neu-black mb-2">
                Nombre (opcional)
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neu-black" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-3 bg-white border-[3px] border-neu-black text-neu-black font-bold placeholder:text-neu-black/40 focus:outline-none focus:ring-4 focus:ring-neu-lime disabled:opacity-50 transition-shadow"
                  style={{ boxShadow: "4px 4px 0px 0px #000" }}
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-neu-black mb-2">
              Correo Electrónico *
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neu-black" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
                disabled={isLoading}
                className="w-full pl-12 pr-4 py-3 bg-white border-[3px] border-neu-black text-neu-black font-bold placeholder:text-neu-black/40 focus:outline-none focus:ring-4 focus:ring-neu-yellow disabled:opacity-50 transition-shadow"
                style={{ boxShadow: "4px 4px 0px 0px #000" }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-neu-black mb-2">
              Contraseña *
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neu-black" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                minLength={6}
                className="w-full pl-12 pr-4 py-3 bg-white border-[3px] border-neu-black text-neu-black font-bold placeholder:text-neu-black/40 focus:outline-none focus:ring-4 focus:ring-neu-yellow disabled:opacity-50 transition-shadow"
                style={{ boxShadow: "4px 4px 0px 0px #000" }}
              />
            </div>
            {activeTab === "signup" && (
              <p className="mt-2 text-xs text-neu-black/60 font-semibold uppercase">
                Mínimo 6 caracteres
              </p>
            )}
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98, y: 4 }}
            className={`w-full py-4 font-bold uppercase text-lg tracking-wider border-[3px] border-neu-black flex items-center justify-center gap-3 disabled:opacity-50 transition-all ${
              activeTab === "login"
                ? "bg-neu-black text-neu-yellow"
                : "bg-neu-lime text-neu-black"
            }`}
            style={{
              boxShadow: activeTab === "login" ? "6px 6px 0px 0px #FFFF00" : "6px 6px 0px 0px #000",
            }}
          >
            {activeTab === "login" ? (
              <>
                <LogIn className="w-6 h-6" />
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </>
            ) : (
              <>
                <UserPlus className="w-6 h-6" />
                {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
              </>
            )}
          </motion.button>
        </form>

        {/* Footer Info */}
        <div className="mt-6 pt-6 border-t-[3px] border-neu-black border-dashed">
          <p className="text-xs text-center font-bold text-neu-black/60 uppercase tracking-wide">
            {activeTab === "login" 
              ? "¿No tienes cuenta? Usa la pestaña de Registrarse"
              : "¿Ya tienes cuenta? Usa la pestaña de Iniciar Sesión"
            }
          </p>
        </div>
      </div>
    </div>
  )
}
