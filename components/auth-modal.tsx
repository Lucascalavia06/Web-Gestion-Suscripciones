"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { AuthForm } from "./auth-form" // Esto importa tu login de password

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-neu-black/60 z-50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md z-50"
          >
            <div className="relative">
              <button 
                onClick={onClose}
                className="absolute -top-2 -right-2 bg-neu-pink p-2 border-[3px] border-neu-black z-[60]"
              >
                <X className="w-5 h-5 text-neu-black" />
              </button>
              {/* AQUÍ METEMOS EL FORMULARIO DE CONTRASEÑA */}
              <AuthForm /> 
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}