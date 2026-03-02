"use client"

import { motion } from "framer-motion"
import { Sparkles, TrendingDown, RefreshCw, ArrowRight, Loader2, AlertTriangle, Zap, Lightbulb, Target } from "lucide-react"
import type { Subscription } from "./subscription-card"
import { useState } from "react"
import { toast } from "sonner"

interface AIRecommendationsProps {
  subscriptions: Subscription[]
  userId?: string
}

interface Recommendation {
  action: "cancel" | "replace" | "upgrade"
  subscription: string
  reason: string
  alternative: {
    name: string
    estimatedPrice: number
    benefits: string
  } | null
}

interface AIResponse {
  analysis: string
  recommendations: Recommendation[]
}

export function AIRecommendations({ subscriptions, userId }: AIRecommendationsProps) {
  const [loading, setLoading] = useState(false)
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const analyzeSubscriptions = async () => {
    if (subscriptions.length === 0) {
      toast.error("No tienes suscripciones para analizar")
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('📤 Enviando suscripciones al API:', subscriptions)
      
      const response = await fetch('/api/ai-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptions,
          userId,
        }),
      })

      console.log('📥 Respuesta recibida. Status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Error HTTP', response.status, ':', errorText)
        throw new Error(`Error HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log('✅ Datos recibidos:', data)
      
      setAiResponse(data)
      toast.success("¡Análisis completado!")
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      console.error('❌ Error completo:', errorMsg)
      setError(`Error: ${errorMsg}`)
      toast.error(`Error: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "cancel":
        return <AlertTriangle className="w-5 h-5" />
      case "replace":
        return <RefreshCw className="w-5 h-5" />
      case "upgrade":
        return <TrendingDown className="w-5 h-5" />
      default:
        return <Sparkles className="w-5 h-5" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "cancel":
        return "bg-neu-pink"
      case "replace":
        return "bg-neu-yellow"
      case "upgrade":
        return "bg-neu-lime"
      default:
        return "bg-neu-cyan"
    }
  }

  const getActionText = (action: string) => {
    switch (action) {
      case "cancel":
        return "Cancelar"
      case "replace":
        return "Reemplazar"
      case "upgrade":
        return "Optimizar"
      default:
        return "Acción"
    }
  }

  if (subscriptions.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mb-8"
    >
      {/* Header con gradiente llamativo */}
      <div 
        className="bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 border-[4px] border-neu-black p-8 relative overflow-hidden"
        style={{ boxShadow: "12px 12px 0px 0px #000" }}
      >
        {/* Patrón de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(45deg, #000 0, #000 2px, transparent 0, transparent 10px)`,
          }} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-3">
              <motion.div 
                className="bg-neu-black p-3 border-[3px] border-white"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
              >
                <Sparkles className="w-8 h-8 text-neu-yellow" />
              </motion.div>
              <div>
                <h2 className="text-3xl font-black uppercase italic text-neu-black">
                  Asistente IA
                </h2>
                <p className="text-sm font-bold uppercase text-neu-black/80">
                  Optimiza tus suscripciones con inteligencia artificial
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={analyzeSubscriptions}
              disabled={loading}
              className="bg-neu-black text-neu-yellow px-6 py-3 font-black uppercase text-sm border-[3px] border-white flex items-center gap-2 disabled:opacity-50"
              style={{ boxShadow: "4px 4px 0px 0px #000" }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analizando...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  {aiResponse ? "Analizar de Nuevo" : "Analizar Ahora"}
                </>
              )}
            </motion.button>
          </div>

          {/* Descripción */}
          {!aiResponse && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/90 border-[3px] border-neu-black p-4 backdrop-blur-sm"
              style={{ boxShadow: "4px 4px 0px 0px #000" }}
            >
              <p className="font-bold text-neu-black">
                Deja que la IA analice tus suscripciones y encuentre oportunidades de ahorro. 
                Recibirás recomendaciones personalizadas sobre qué servicios cancelar, reemplazar o mejorar.
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-neu-pink border-[3px] border-neu-black p-4"
          style={{ boxShadow: "6px 6px 0px 0px #000" }}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <p className="font-bold">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Resultados del análisis */}
      {aiResponse && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 space-y-4"
        >
          {/* Análisis General */}
          <div 
            className="bg-neu-cyan border-[3px] border-neu-black p-6"
            style={{ boxShadow: "6px 6px 0px 0px #000" }}
          >
            <h3 className="font-black text-lg uppercase mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Análisis General
            </h3>
            <p className="font-bold text-neu-black">{aiResponse.analysis}</p>
          </div>

          {/* Recomendaciones mejoradas */}
          {aiResponse.recommendations.length > 0 && (
            <div>
              <motion.h3 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-black text-2xl uppercase mb-4 flex items-center gap-3 drop-shadow-md"
              >
                <motion.div animate={{ rotate: [0, 360] }} transition={{ repeat: Infinity, duration: 3 }}>
                  <Target className="w-7 h-7" />
                </motion.div>
                {aiResponse.recommendations.length} {aiResponse.recommendations.length === 1 ? "Recomendación" : "Recomendaciones"}
              </motion.h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {aiResponse.recommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: index * 0.12, duration: 0.5 }}
                    whileHover={{ y: -5, boxShadow: "10px 10px 0px 0px #000" }}
                    className={`${getActionColor(rec.action)} border-[3px] border-neu-black p-5 relative overflow-hidden group`}
                    style={{ boxShadow: "6px 6px 0px 0px #000", transition: "all 0.3s ease" }}
                  >
                    {/* Efecto de fondo sutil */}
                    <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
                      <div style={{
                        backgroundImage: `repeating-linear-gradient(45deg, #000 0, #000 2px, transparent 0, transparent 8px)`,
                      }} className="w-full h-full" />
                    </div>

                    <div className="relative z-10 flex items-start gap-4">
                      {/* Icono con badge */}
                      <motion.div 
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        className={`${
                          rec.action === "cancel" ? "bg-neu-pink" :
                          rec.action === "replace" ? "bg-neu-yellow" :
                          "bg-neu-lime"
                        } p-3 border-3 border-neu-black shrink-0`}
                        style={{ boxShadow: "4px 4px 0px 0px #000" }}
                      >
                        {getActionIcon(rec.action)}
                      </motion.div>

                      <div className="flex-1 min-w-0">
                        {/* Header con badge de acción */}
                        <div className="mb-2">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <motion.span 
                              whileHover={{ scale: 1.05 }}
                              className="bg-neu-black text-white px-2 py-1 text-xs font-black uppercase"
                              style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,0.3)" }}
                            >
                              {getActionText(rec.action)}
                            </motion.span>
                          </div>
                          <h4 className="font-black text-lg break-words">
                            {rec.subscription}
                          </h4>
                        </div>

                        {/* Razón mejorada */}
                        <p className="font-bold text-sm mb-4 text-neu-black/90 leading-snug">
                          {rec.reason}
                        </p>

                        {/* Alternativa con mejor presentación */}
                        {rec.alternative && (
                          <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.12 + 0.2 }}
                            className="bg-white/80 border-[3px] border-neu-black p-3 backdrop-blur-sm"
                            style={{ boxShadow: "3px 3px 0px 0px rgba(0,0,0,0.2)" }}
                          >
                            <div className="flex items-start gap-2 mb-2">
                              <motion.div animate={{ x: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                                <ArrowRight className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                              </motion.div>
                              <div>
                                <p className="font-black text-sm uppercase text-indigo-600">
                                  Alternativa
                                </p>
                                <p className="font-black text-neu-black">
                                  {rec.alternative.name}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-end justify-between gap-3 pt-2 border-t-2 border-neu-black/20">
                              <p className="text-xs font-bold text-neu-black/75 line-clamp-2">
                                {rec.alternative.benefits}
                              </p>
                              <motion.span 
                                whileHover={{ scale: 1.08 }}
                                className="bg-indigo-600 text-white px-3 py-1 font-black text-xs rounded-sm shrink-0"
                                style={{ boxShadow: "2px 2px 0px 0px rgba(0,0,0,0.2)" }}
                              >
                                €{rec.alternative.estimatedPrice.toFixed(2)}
                              </motion.span>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
