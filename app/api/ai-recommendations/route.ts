import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { analyzeWithAI, type AIAnalysisResponse } from '@/lib/openrouter'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface Subscription {
  name: string
  price: number
  billingCycle: string
  category: string
}

export async function POST(req: NextRequest) {
  try {
    console.log('🚀 [API] Iniciando análisis de suscripciones...')
    
    const { subscriptions, userId, provider: requestedProvider } = await req.json()

    console.log('📋 [API] Suscripciones recibidas:', subscriptions.length, 'items')
    console.log('📋 [API] UserID:', userId)

    if (!subscriptions || subscriptions.length === 0) {
      console.log('⚠️  [API] Sin suscripciones para analizar')
      return NextResponse.json({
        recommendations: [],
        analysis: "No tienes suscripciones activas para analizar.",
      })
    }

    // Preparar resumen de suscripciones
    const subscriptionSummary = subscriptions.map((sub: Subscription) => {
      const monthlyPrice = sub.billingCycle === "monthly" ? sub.price : sub.price / 12
      return {
        name: sub.name,
        monthlyPrice: monthlyPrice.toFixed(2),
        billingCycle: sub.billingCycle,
        category: sub.category,
      }
    })

    const totalMonthly = subscriptions.reduce((acc: number, sub: Subscription) => {
      return acc + (sub.billingCycle === "monthly" ? sub.price : sub.price / 12)
    }, 0)

    // Selección de proveedor: puede venir en el body o en env DEFAULT_AI_PROVIDER
    const provider = (requestedProvider || process.env.DEFAULT_AI_PROVIDER || 'openrouter').toLowerCase()

    console.log('🤖 [API] Proveedor de IA:', provider)
    console.log('💰 [API] Gasto mensual total:', totalMonthly)

    const systemInstructions = `Eres un experto en optimización de gastos en suscripciones digitales. Tu tarea es analizar las suscripciones del usuario y encontrar oportunidades de ahorro.

INSTRUCCIONES:
1. Detecta suscripciones REDUNDANTES o similares que el usuario podría consolidar
2. Busca alternativas MÁS BARATAS o MEJORES del mercado real (2026)
3. Las alternativas pueden ser CUALQUIER servicio que exista, no solo de una lista predefinida
4. Considera servicios de todo el mundo que estén disponibles en Europa
5. Menciona precios reales actualizados y calcula ahorros específicos

FORMATO DE RESPUESTA (JSON estricto):
{
  "analysis": "Análisis general en español (2-4 frases). Menciona gasto total, redundancias y potencial de ahorro.",
  "recommendations": [
    {
      "action": "cancel" | "replace" | "consolidate",
      "subscription": "nombre exacto de la suscripción del usuario",
      "reason": "explicación detallada con precios y ahorros específicos",
      "alternative": {
        "name": "nombre del servicio alternativo",
        "estimatedPrice": precio mensual aproximado en euros (número),
        "benefits": "beneficios específicos vs la suscripción actual"
      } o null si la acción es "cancel" o "consolidate"
    }
  ]
}

IMPORTANTE:
- Sé específico con precios y ahorros en euros
- Si detectas 2+ servicios similares, recomienda consolidar
- Busca alternativas reales del mercado, no inventes servicios
- Calcula el ahorro anual potencial total`

    const userPrompt = `Analiza estas suscripciones y encuentra oportunidades de optimización:

Suscripciones actuales:
${JSON.stringify(subscriptionSummary, null, 2)}

Gasto mensual total: €${totalMonthly.toFixed(2)}

Por favor, identifica:
1. Suscripciones redundantes que puedo consolidar
2. Alternativas más baratas o mejores del mercado actual
3. Servicios que podrían no valer su precio

Responde SOLO con el JSON especificado.`

    if (provider === 'huggingface' || provider === 'mistral') {
      const hfKey = process.env.HUGGINGFACE_API_KEY
      if (!hfKey) {
        return NextResponse.json({
          recommendations: [{
            action: 'error',
            subscription: 'Sistema',
            reason: 'No se ha configurado la API key de Hugging Face. Añade HUGGINGFACE_API_KEY a las variables de entorno.',
            alternative: null,
          }],
          analysis: 'Para obtener recomendaciones usando Mistral en Hugging Face, configura HUGGINGFACE_API_KEY.',
        })
      }

      const prompt = `${systemInstructions}\n\n${userPrompt}`

      const hfRes = await fetch('https://api-inference.huggingface.co/models/mistralai/mistral-7b-instruct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${hfKey}`,
        },
        body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 800, temperature: 0.2 } }),
      })

      if (!hfRes.ok) {
        const errText = await hfRes.text()
        console.error('Error HuggingFace:', errText)
        return NextResponse.json({ error: 'Error al llamar a Hugging Face', details: errText }, { status: 502 })
      }

      const hfBody = await hfRes.json()
      // HF puede devolver un array o un objeto con generated_text
      const text = Array.isArray(hfBody) ? hfBody[0]?.generated_text ?? JSON.stringify(hfBody) : hfBody.generated_text ?? hfBody.generated_texts?.[0] ?? JSON.stringify(hfBody)

      try {
        const aiResponse = JSON.parse(text)
        return NextResponse.json(aiResponse)
      } catch (e) {
        // Si no es JSON estricto, devolver el texto bruto para facilitar debugging
        console.error('No se pudo parsear JSON de HuggingFace:', text)
        return NextResponse.json({ error: 'Respuesta de Hugging Face no es JSON válido', raw: text }, { status: 502 })
      }
    } else if (provider === 'openrouter') {
      const openRouterKey = process.env.OPENROUTER_API_KEY
      
      if (!openRouterKey) {
        console.error('❌ [API] OPENROUTER_API_KEY no configurada')
        return NextResponse.json({
          recommendations: [{
            action: 'error',
            subscription: 'Sistema',
            reason: 'No se ha configurado la API key de OpenRouter. Añade OPENROUTER_API_KEY a las variables de entorno.',
            alternative: null,
          }],
          analysis: 'Para obtener recomendaciones usando OpenRouter, configura OPENROUTER_API_KEY.',
        })
      }

      console.log('🔐 [API] OpenRouter API Key detectada')
      console.log('📤 [API] Llamando a OpenRouter con prompt del usuario...')

      try {
        // Usar el wrapper conveniente de OpenRouter
        const response = await analyzeWithAI(userPrompt, systemInstructions)

        console.log('📥 [API] Respuesta recibida de OpenRouter, longitud:', response.length)

        // Extraer JSON de la respuesta (puede venir con texto adicional)
        const jsonMatch = response.match(/\{[\s\S]*\}/)
        const jsonContent = jsonMatch ? jsonMatch[0] : response

        console.log('🔍 [API] Intentando parsear JSON...')
        const aiResponse: AIAnalysisResponse = JSON.parse(jsonContent)
        
        console.log('✅ [API] Recomendaciones generadas exitosamente')
        console.log('📊 [API] Recomendaciones:', aiResponse.recommendations.length)
        
        return NextResponse.json(aiResponse)
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        console.error('❌ [API] Error procesando OpenRouter:', errorMsg)
        console.error('❌ [API] Stack:', error instanceof Error ? error.stack : 'N/A')
        
        return NextResponse.json({ 
          error: 'Error al generar recomendaciones con OpenRouter',
          details: errorMsg,
          recommendations: [],
          analysis: 'No se pudieron generar recomendaciones. Por favor, intenta de nuevo.'
        }, { status: 502 })
      }
    } else if (provider === 'openai') {
      const openaiKey = process.env.OPENAI_API_KEY
      if (!openaiKey) {
        return NextResponse.json({
          recommendations: [{
            action: 'error',
            subscription: 'Sistema',
            reason: 'No se ha configurado la API key de OpenAI. Añade OPENAI_API_KEY a las variables de entorno.',
            alternative: null,
          }],
          analysis: 'Para obtener recomendaciones usando OpenAI, configura OPENAI_API_KEY.',
        })
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemInstructions },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.25,
          max_tokens: 1500,
        }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Error OpenAI:', errorData)
        return NextResponse.json({ error: 'Error al llamar a OpenAI', details: errorData }, { status: 502 })
      }

      const data = await response.json()
      const content = data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? JSON.stringify(data)

      try {
        const aiResponse = JSON.parse(content)
        return NextResponse.json(aiResponse)
      } catch (e) {
        console.error('No se pudo parsear JSON de OpenAI:', content)
        return NextResponse.json({ error: 'Respuesta de OpenAI no es JSON válido', raw: content }, { status: 502 })
      }
    } else {
      return NextResponse.json({ error: `Proveedor desconocido: ${provider}` }, { status: 400 })
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('❌ [API] Error fatal en ai-recommendations:', errorMsg)
    console.error('❌ [API] Stack:', error instanceof Error ? error.stack : 'N/A')
    
    return NextResponse.json(
      { 
        error: 'Error al generar recomendaciones',
        details: errorMsg
      },
      { status: 500 }
    )
  }
}
