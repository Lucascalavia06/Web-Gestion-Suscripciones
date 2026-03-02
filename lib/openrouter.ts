/**
 * OpenRouter SDK Configuration
 * 
 * Cliente configurado para usar OpenRouter via API REST
 * con modelos gratuitos de alta calidad.
 * 
 * Documentación: https://openrouter.ai/docs
 */

if (!process.env.OPENROUTER_API_KEY) {
  console.warn('⚠️  OPENROUTER_API_KEY no está configurada en las variables de entorno')
}

/**
 * Headers personalizados para las peticiones
 */
export const OPENROUTER_HEADERS = {
  'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://v0-neubrutalist-dashboard-design.vercel.app',
  'X-Title': 'Gestor de Suscripciones - Neubrutalist Dashboard',
}

/**
 * Modelos gratuitos disponibles en OpenRouter
 * Todos estos modelos tienen el sufijo :free y son completamente gratuitos
 */
export const FREE_MODELS = {
  // Meta Llama - Recomendado para uso general
  llama32_3b: 'meta-llama/llama-3.2-3b-instruct:free',
  llama32_1b: 'meta-llama/llama-3.2-1b-instruct:free',
  
  // Google Gemma - Excelente para tareas específicas
  gemma2_9b: 'google/gemma-2-9b-it:free',
  
  // Microsoft Phi - Ligero y rápido
  phi3_mini: 'microsoft/phi-3-mini-128k-instruct:free',
  
  // Nvidia Llama - Optimizado por Nvidia
  llama31_nemotron: 'nvidia/llama-3.1-nemotron-70b-instruct:free',
} as const

/**
 * Modelo por defecto - Llama 3.2 3B es el mejor balance entre
 * calidad y velocidad para recomendaciones de suscripciones
 */
export const DEFAULT_FREE_MODEL = FREE_MODELS.llama32_3b

/**
 * Configuración de parámetros de generación optimizados
 * para análisis de suscripciones
 */
export const AI_CONFIG = {
  temperature: 0.3, // Más determinístico para análisis financiero
  max_tokens: 2000,  // Suficiente para análisis detallados
  top_p: 0.9,
} as const

/**
 * Tipo para las respuestas de recomendaciones
 */
export interface AIRecommendation {
  action: 'cancel' | 'replace' | 'consolidate' | 'keep'
  subscription: string
  reason: string
  alternative: {
    name: string
    estimatedPrice: number
    benefits: string
  } | null
}

export interface AIAnalysisResponse {
  analysis: string
  recommendations: AIRecommendation[]
  totalSavings?: number
}

/**
 * Llamada a OpenRouter con mensajes
 * @param messages - Array de mensajes con roles (system, user, assistant)
 * @param model - Modelo a usar (opcional)
 * @returns La respuesta del modelo
 */
export async function callOpenRouter(
  messages: Array<{ role: string; content: string }>,
  model?: string
) {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        ...OPENROUTER_HEADERS,
      },
      body: JSON.stringify({
        model: model || process.env.OPENROUTER_MODEL || DEFAULT_FREE_MODEL,
        messages: messages,
        temperature: AI_CONFIG.temperature,
        max_tokens: AI_CONFIG.max_tokens,
        top_p: AI_CONFIG.top_p,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('❌ Error OpenRouter:', errorData)
      throw new Error(`OpenRouter API Error: ${response.status} - ${errorData}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    
    if (!content) {
      throw new Error('No content in response from OpenRouter')
    }

    return content
  } catch (error) {
    console.error('❌ Error al llamar a OpenRouter:', error)
    throw error
  }
}

/**
 * Versión con streaming para respuestas en tiempo real
 * @param messages - Array de mensajes
 * @param onChunk - Callback que recibe cada fragmento de texto
 * @param model - Modelo a usar (opcional)
 * @returns La respuesta completa del modelo
 */
export async function callOpenRouterStream(
  messages: Array<{ role: string; content: string }>,
  onChunk?: (chunk: string) => void,
  model?: string
) {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        ...OPENROUTER_HEADERS,
      },
      body: JSON.stringify({
        model: model || process.env.OPENROUTER_MODEL || DEFAULT_FREE_MODEL,
        messages: messages,
        temperature: AI_CONFIG.temperature,
        max_tokens: AI_CONFIG.max_tokens,
        top_p: AI_CONFIG.top_p,
        stream: true,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`OpenRouter API Error: ${response.status} - ${errorData}`)
    }

    if (!response.body) {
      throw new Error('Response body is null')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullResponse = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content
              if (content) {
                fullResponse += content
                onChunk?.(content)
              }
            } catch (e) {
              // Ignore JSON parse errors for keep-alive messages
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }

    return fullResponse
  } catch (error) {
    console.error('❌ Error en streaming de OpenRouter:', error)
    throw error
  }
}

/**
 * Wrapper conveniente para análisis de suscripciones
 * Combina system prompt y user prompt automáticamente
 * @param userPrompt - Mensaje del usuario
 * @param systemPrompt - Instrucciones del sistema
 * @param model - Modelo a usar (opcional)
 */
export async function analyzeWithAI(
  userPrompt: string,
  systemPrompt: string,
  model?: string
) {
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]

  return callOpenRouter(messages, model)
}
