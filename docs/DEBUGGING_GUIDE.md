# 🔍 Guía de Debugging - OpenRouter API

Si estás viendo: **"No se pudieron obtener recomendaciones. Intenta de nuevo."**

Sigue estos pasos para identificar el problema:

---

## 1️⃣ Verifica los Logs del Frontend

### En el navegador (F12 → Console):

Cuando hagas clic en "Analizar Ahora":

```
📤 Enviando suscripciones al API: [...]
📥 Respuesta recibida. Status: 200
✅ Datos recibidos: {...}
```

**Si ves esto:** ✅ El API funciona perfectamente

**Si ves errores:**
- `Status: 500` → Error en el servidor
- `Status: 502` → Error en OpenRouter
- `Status: 400` → Datos inválidos

---

## 2️⃣ Verifica los Logs del Backend

### En la terminal donde corre `npm run dev`:

Deberías ver:

```
🚀 [API] Iniciando análisis de suscripciones...
📋 [API] Suscripciones recibidas: 3 items
🤖 [API] Proveedor de IA: openrouter
💰 [API] Gasto mensual total: 81.97
🔐 [API] OpenRouter API Key detectada
📤 [API] Llamando a OpenRouter con prompt del usuario...
📥 [API] Respuesta recibida de OpenRouter, longitud: 1250
✅ [API] Recomendaciones generadas exitosamente
```

### Posibles errores en los logs:

**❌ Error: `OPENROUTER_API_KEY no configurada`**
```env
# Verifica en .env.local:
OPENROUTER_API_KEY=sk-or-v1-xxxxx
```

**❌ Error: `Error al procesar respuesta: JSON.parse error`**
- La IA devolvió algo que no es JSON válido
- Intenta de nuevo (puede ser rate limit de OpenRouter)

**❌ Error: `Error HTTP 429` o `Rate limit exceeded`**
- Los modelos gratuitos tienen límites de velocidad
- Espera 60 segundos e intenta de nuevo
- Considera cambiar de modelo en `.env.local`

---

## 3️⃣ Test Directo del API

### Opción A: Desde el Browser Console

1. Abre F12 → Console
2. Ejecuta:

```javascript
// Test del API
const response = await fetch('/api/ai-recommendations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subscriptions: [
      { name: 'Netflix', price: 15.99, billingCycle: 'monthly', category: 'Entertainment' }
    ],
    userId: 'test'
  })
})

const data = await response.json()
console.log('Status:', response.status)
console.log('Response:', data)
```

### Opción B: Desde PowerShell

```powershell
$body = @{
    subscriptions = @(
        @{
            name = "Netflix"
            price = 15.99
            billingCycle = "monthly"
            category = "Entertainment"
        }
    )
    userId = "test"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/ai-recommendations" `
    -Method POST `
    -Headers @{ "Content-Type" = "application/json" } `
    -Body $body | Select-Object -Expand Content | ConvertFrom-Json
```

---

## 4️⃣ Checklist de Verificación

- [ ] ¿`npm run dev` está ejecutándose?
  ```bash
  npm run dev
  ```

- [ ] ¿`.env.local` tiene la API key?
  ```env
  OPENROUTER_API_KEY=sk-or-v1-xxxxx
  DEFAULT_AI_PROVIDER=openrouter
  OPENROUTER_MODEL=meta-llama/llama-3.2-3b-instruct:free
  ```

- [ ] ¿La API key es válida?
  - Ve a https://openrouter.ai/activity
  - Verifica que hayas iniciado sesión
  - Comprueba que no está expirada

- [ ] ¿Tienes suscripciones en el dashboard?
  - Debe haber al menos 1 suscripción
  - Los campos no deben estar vacíos

- [ ] ¿Hay errores de red?
  - Abre DevTools (F12)
  - Tab "Network"
  - Haz clic en "Analizar Ahora"
  - Busca la petición `/api/ai-recommendations`
  - Verifica el Status y Response

---

## 5️⃣ Errores Comunes y Soluciones

### "HTTP 502 Bad Gateway"
```
Problema: Error en OpenRouter
Solución:
1. Espera 30 segundos e intenta de nuevo
2. Comprueba en https://openrouter.ai que el servicio esté activo
3. Intenta con otro modelo gratuito en .env.local
```

### "HTTP 500 Internal Server Error"
```
Problema: Error en tu aplicación
Solución:
1. Revisa los logs en console (npm run dev)
2. Verifica que sea válido JSON
3. Comprueba las variables de entorno
```

### "HTTP 401 Unauthorized"
```
Problema: API key inválida o expirada
Solución:
1. Ve a https://openrouter.ai/keys
2. Copia la nueva API key
3. Actualiza en .env.local
4. Reinicia: npm run dev
```

### "Data appears truncated or malformed"
```
Problema: JSON incompleto de la IA
Solución:
1. Intenta de nuevo
2. Reduce el tamaño de suscripciones
3. Cambia de modelo (modelos más grandes suelen funcionar mejor)
```

---

## 6️⃣ Cambiar de Modelo Gratuito

Si tienes rate limits, prueba otros modelos en `.env.local`:

```env
# Más rápido pero menos preciso
OPENROUTER_MODEL=meta-llama/llama-3.2-1b-instruct:free

# Balance perfecto (ACTUAL)
OPENROUTER_MODEL=meta-llama/llama-3.2-3b-instruct:free

# Más potente (más lento)
OPENROUTER_MODEL=google/gemma-2-9b-it:free

# Máxima calidad (más lento)
OPENROUTER_MODEL=nvidia/llama-3.1-nemotron-70b-instruct:free
```

Luego reinicia: `npm run dev`

---

## 7️⃣ Ver Todo el Tráfico

En la consola del navegador (F12) antes de hacer el request:

```javascript
// Activa logs detallados
localStorage.setItem('debug', '*')

// Luego haz clic en "Analizar Ahora"
// Verás mucho más detalle
```

---

## 🆘 Sigue Sin Funcionar?

Crédito de diagnóstico:
1. ✅ Verifica que `npm run dev` está corriendo
2. ✅ Abre DevTools (F12) → Console
3. ✅ Scroll hasta arriba para ver los primeros errores
4. ✅ Copia todo lo que veas rojo
5. ✅ Revisa los logs en la terminal de npm run dev
6. ✅ Busca la línea que empieza con `❌`

**Comparta esos logs para más ayuda.**
