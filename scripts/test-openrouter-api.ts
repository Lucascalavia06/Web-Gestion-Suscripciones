/**
 * Test Script para OpenRouter API
 * 
 * Úsalo así:
 * npx ts-node scripts/test-openrouter.ts
 * 
 * O en el browser console cuando tu dev server esté corriendo
 */

const API_URL = 'http://localhost:3000/api/ai-recommendations'

// Datos de test
const testSubscriptions = [
  {
    name: 'Netflix',
    price: 15.99,
    billingCycle: 'monthly',
    category: 'Entertainment',
  },
  {
    name: 'Spotify',
    price: 10.99,
    billingCycle: 'monthly',
    category: 'Music',
  },
  {
    name: 'Adobe Creative Cloud',
    price: 54.99,
    billingCycle: 'monthly',
    category: 'Software',
  },
]

async function testAPI() {
  console.log('🚀 Iniciando test del API OpenRouter...')
  console.log('📍 URL:', API_URL)
  console.log('📋 Enviando', testSubscriptions.length, 'suscripciones...\n')

  try {
    console.log('📤 POST /api/ai-recommendations')
    console.log('Body:', JSON.stringify({ subscriptions: testSubscriptions, userId: 'test-user' }, null, 2))
    console.log('---\n')

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptions: testSubscriptions,
        userId: 'test-user',
      }),
    })

    console.log('📥 Status:', response.status, response.statusText)
    console.log('Headers:', {
      'content-type': response.headers.get('content-type'),
    })
    console.log('---\n')

    const data = await response.json()

    if (response.ok) {
      console.log('✅ SUCCESS!\n')
      console.log('Analysis:', data.analysis)
      console.log('\nRecommendations:', data.recommendations.length)
      data.recommendations.forEach((rec: any, i: number) => {
        console.log(`\n  ${i + 1}. ${rec.action.toUpperCase()} - ${rec.subscription}`)
        console.log(`     Razón: ${rec.reason}`)
        if (rec.alternative) {
          console.log(`     Alternativa: ${rec.alternative.name} (~€${rec.alternative.estimatedPrice}/mes)`)
        }
      })
    } else {
      console.error('❌ ERROR!')
      console.log('Error:', data.error)
      console.log('Details:', data.details)
    }
  } catch (error) {
    console.error('❌ Network Error:', error)
    console.log('\n💡 Tips:')
    console.log('1. ¿Está corriendo el dev server? (npm run dev)')
    console.log('2. ¿Está configurada la API key? (verifica .env.local)')
    console.log('3. Abre la consola del navegador (F12) mientras corres el test')
  }
}

// Para Node.js
if (typeof window === 'undefined') {
  testAPI()
} else {
  // Para Browser Console
  console.log('💡 Para hacer test, copia y ejecuta esto en la consola:')
  console.log('testAPI()')
}

export { testAPI }
