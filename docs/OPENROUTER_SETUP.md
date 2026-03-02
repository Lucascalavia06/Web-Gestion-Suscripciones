# 🤖 Configuración de OpenRouter - Documentación

## ✅ Configuración Completa

Tu aplicación ya está configurada con OpenRouter usando el **SDK oficial** y **modelos 100% gratuitos**.

### 📁 Archivos Configurados

1. **`lib/openrouter.ts`** - Cliente y configuración principal
2. **`app/api/ai-recommendations/route.ts`** - API actualizada con SDK
3. **`.env.local`** - Variables de entorno

---

## 🎯 Características Implementadas

### ✨ SDK Oficial de OpenRouter
- ✅ Cliente configurado con headers personalizados
- ✅ Manejo automático de errores
- ✅ Soporte para múltiples modelos
- ✅ TypeScript completo

### 💰 Modelo Gratuito
```typescript
// Modelo por defecto: Llama 3.2 3B Instruct (GRATIS)
OPENROUTER_MODEL=meta-llama/llama-3.2-3b-instruct:free
```

**Modelos gratuitos disponibles:**
- `meta-llama/llama-3.2-3b-instruct:free` - ⭐ Recomendado (balance perfecto)
- `meta-llama/llama-3.2-1b-instruct:free` - Más rápido
- `google/gemma-2-9b-it:free` - Mayor capacidad
- `microsoft/phi-3-mini-128k-instruct:free` - Contexto largo
- `nvidia/llama-3.1-nemotron-70b-instruct:free` - Máxima calidad

### 🔧 Configuración Personalizada

#### Variables de Entorno (`.env.local`)
```env
OPENROUTER_API_KEY=tu-api-key-aqui
DEFAULT_AI_PROVIDER=openrouter
OPENROUTER_MODEL=meta-llama/llama-3.2-3b-instruct:free
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

---

## 📚 Uso del Cliente OpenRouter

### Ejemplo Básico
```typescript
import { callOpenRouter } from '@/lib/openrouter'

const response = await callOpenRouter(
  'Analiza estas suscripciones...',
  'Eres un experto en finanzas...'
)
```

### Ejemplo con Streaming
```typescript
import { callOpenRouterStream } from '@/lib/openrouter'

const response = await callOpenRouterStream(
  'Tu pregunta aquí',
  'Instrucciones del sistema',
  (chunk) => {
    // Cada fragmento de texto en tiempo real
    console.log('Nuevo fragmento:', chunk)
  }
)
```

### Usar Cliente Directamente
```typescript
import { openrouter } from '@/lib/openrouter'

const result = await openrouter.callModel({
  model: 'meta-llama/llama-3.2-3b-instruct:free',
  input: 'Tu prompt aquí',
  temperature: 0.3,
})

const text = await result.getText()
```

---

## 🚀 Ejemplo Completo: Componente de Chat

```typescript
'use client'

import { useState } from 'react'
import { callOpenRouterStream } from '@/lib/openrouter'

export function ChatComponent() {
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([])
  const [input, setInput] = useState('')
  const [currentResponse, setCurrentResponse] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return
    
    setIsStreaming(true)
    setMessages(prev => [...prev, { role: 'user', content: input }])
    setCurrentResponse('')

    try {
      const response = await callOpenRouterStream(
        input,
        'Eres un asistente útil.',
        (chunk) => {
          // Actualizar respuesta en tiempo real
          setCurrentResponse(prev => prev + chunk)
        }
      )

      // Agregar respuesta completa
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
      setCurrentResponse('')
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsStreaming(false)
      setInput('')
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, i) => (
          <div key={i} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-3 rounded-lg ${
              msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        
        {/* Respuesta en streaming */}
        {currentResponse && (
          <div className="mb-4 text-left">
            <div className="inline-block p-3 rounded-lg bg-gray-200">
              {currentResponse}
              <span className="animate-pulse">|</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isStreaming && sendMessage()}
            placeholder="Escribe tu mensaje..."
            disabled={isStreaming}
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <button
            onClick={sendMessage}
            disabled={isStreaming}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
          >
            {isStreaming ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

## 🎨 Cambiar de Modelo

Para probar diferentes modelos, actualiza `.env.local`:

```env
# Más rápido pero menos preciso
OPENROUTER_MODEL=meta-llama/llama-3.2-1b-instruct:free

# Balance perfecto (recomendado)
OPENROUTER_MODEL=meta-llama/llama-3.2-3b-instruct:free

# Mayor capacidad
OPENROUTER_MODEL=google/gemma-2-9b-it:free

# Máxima calidad (más lento)
OPENROUTER_MODEL=nvidia/llama-3.1-nemotron-70b-instruct:free
```

---

## 📊 Monitoreo y Límites

### Ver Uso de API
1. Visita: https://openrouter.ai/activity
2. Inicia sesión con tu cuenta
3. Ve tu consumo en tiempo real

### Límites de Modelos Gratuitos
- ✅ Sin costo por token
- ⏱️ Pueden tener límites de velocidad (rate limits)
- 🔄 Recuperación automática de límites cada minuto

---

## 🐛 Solución de Problemas

### Error: "API key not configured"
```bash
# Verifica que .env.local tiene:
OPENROUTER_API_KEY=sk-or-v1-xxxxx
```

### Error: "Model not found"
```bash
# Asegúrate de incluir :free al final
OPENROUTER_MODEL=meta-llama/llama-3.2-3b-instruct:free
```

### Error: "Rate limit exceeded"
- Los modelos gratuitos tienen límites por minuto
- Espera 60 segundos y reintenta
- Considera cambiar a otro modelo gratuito

---

## 🔗 Recursos Adicionales

- **Documentación OpenRouter**: https://openrouter.ai/docs
- **Modelos Disponibles**: https://openrouter.ai/models
- **SDK en GitHub**: https://github.com/OpenRouterTeam/openrouter-sdk
- **Dashboard de Uso**: https://openrouter.ai/activity

---

## 💡 Tips de Optimización

1. **Usa temperatura baja (0.2-0.4)** para análisis financiero
2. **Ajusta maxTokens** según necesidad (menos tokens = más rápido)
3. **Implementa caché** para respuestas similares
4. **Usa streaming** para mejor UX en respuestas largas

---

## ✅ Estado Actual

Tu aplicación está lista para:
- ✅ Generar recomendaciones de IA
- ✅ Usar modelos 100% gratuitos
- ✅ Escalar sin costos de API
- ✅ Implementar streaming cuando lo necesites

¡Todo configurado correctamente! 🎉
