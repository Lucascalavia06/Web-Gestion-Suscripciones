/**
 * 🚀 EJEMPLO DE COMPONENTE CON STREAMING DE OPENROUTER
 * 
 * Este es un componente de ejemplo que muestra cómo implementar
 * streaming en tiempo real con OpenRouter para una mejor experiencia de usuario.
 * 
 * Para usarlo:
 * 1. Copia este archivo a components/
 * 2. Renómbralo como ai-chat-streaming.tsx
 * 3. Importa en cualquier página: import { AIChat } from '@/components/ai-chat-streaming'
 * 
 * NOTA: Este es OPCIONAL. Tu aplicación actual ya funciona sin streaming.
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Loader2 } from 'lucide-react'
import { callOpenRouterStream } from '@/lib/openrouter'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const SYSTEM_PROMPT = 'Eres un asistente financiero experto. Ayudas a las personas a optimizar sus gastos en suscripciones digitales. Sé conciso y práctico en tus respuestas.'

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [currentResponse, setCurrentResponse] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsStreaming(true)
    setCurrentResponse('')

    try {
      // Construir el array de mensajes con system prompt
      const messagesForAPI = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: input },
      ]

      // Llamar a OpenRouter con streaming
      const response = await callOpenRouterStream(
        messagesForAPI,
        (chunk: string) => {
          // Cada fragmento se agrega en tiempo real
          setCurrentResponse(prev => prev + chunk)
        }
      )

      // Una vez completo, agregar a mensajes
      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])
      setCurrentResponse('')
    } catch (error) {
      console.error('Error en streaming:', error)
      
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Lo siento, ocurrió un error al procesar tu mensaje. Por favor, intenta de nuevo.',
        timestamp: new Date(),
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsStreaming(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isStreaming) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto h-150 flex flex-col border-4 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
      {/* Header */}
      <div className="bg-neu-purple border-b-4 border-black p-4">
        <h2 className="text-2xl font-black text-black flex items-center gap-2">
          <Bot className="w-6 h-6" />
          Chat con IA (Streaming)
        </h2>
        <p className="text-sm text-black/70 mt-1">
          Powered by OpenRouter • Modelo gratuito
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex gap-3 ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`shrink-0 w-10 h-10 rounded-lg border-2 border-black flex items-center justify-center ${
                  message.role === 'user' ? 'bg-neu-cyan' : 'bg-neu-lime'
                }`}
              >
                {message.role === 'user' ? (
                  <User className="w-5 h-5" />
                ) : (
                  <Bot className="w-5 h-5" />
                )}
              </div>

              {/* Message */}
              <div
                className={`max-w-[70%] p-4 border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                  message.role === 'user'
                    ? 'bg-neu-cyan'
                    : 'bg-white'
                }`}
              >
                <p className="text-black whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs text-black/50 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Streaming Response */}
        {currentResponse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="shrink-0 w-10 h-10 rounded-lg border-2 border-black bg-neu-lime flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div className="max-w-[70%] p-4 border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
              <p className="text-black whitespace-pre-wrap">
                {currentResponse}
                <span className="inline-block w-2 h-5 bg-black ml-1 animate-pulse"></span>
              </p>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {messages.length === 0 && !currentResponse && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Bot className="w-16 h-16 mx-auto mb-4 text-black/20" />
              <h3 className="text-xl font-bold text-black/40">
                Inicia una conversación
              </h3>
              <p className="text-sm text-black/30 mt-2">
                Pregúntame sobre tus suscripciones
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t-4 border-black p-4 bg-gray-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu mensaje..."
            disabled={isStreaming}
            className="flex-1 px-4 py-3 border-2 border-black rounded-lg font-medium text-black placeholder-black/40 focus:outline-none focus:ring-4 focus:ring-neu-yellow disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={isStreaming || !input.trim()}
            className="px-6 py-3 bg-neu-purple border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-black flex items-center gap-2"
          >
            {isStreaming ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Enviar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * EJEMPLO DE USO EN UNA PÁGINA:
 * 
 * import { AIChat } from '@/components/ai-chat-streaming'
 * 
 * export default function ChatPage() {
 *   return (
 *     <div className="min-h-screen bg-neu-bg p-8">
 *       <AIChat />
 *     </div>
 *   )
 * }
 */
