#!/bin/bash

# Test Script para OpenRouter API
# Úsalo así: sh scripts/test-openrouter-api.sh

API_URL="http://localhost:3000/api/ai-recommendations"

echo "🚀 Test de OpenRouter API"
echo "📍 URL: $API_URL"
echo ""

# Check if server is running
if ! curl -s --head "$API_URL" > /dev/null 2>&1; then
  echo "❌ El servidor no está corriendo en localhost:3000"
  echo "💡 Ejecuta: npm run dev"
  exit 1
fi

echo "✅ Servidor detectado"
echo ""
echo "📤 Enviando request..."
echo ""

curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "subscriptions": [
      {
        "name": "Netflix",
        "price": 15.99,
        "billingCycle": "monthly",
        "category": "Entertainment"
      },
      {
        "name": "Spotify",
        "price": 10.99,
        "billingCycle": "monthly",
        "category": "Music"
      },
      {
        "name": "Adobe Creative Cloud",
        "price": 54.99,
        "billingCycle": "monthly",
        "category": "Software"
      }
    ],
    "userId": "test-user"
  }' \
  -w "\n\n📊 Status Code: %{http_code}\n" 

echo ""
echo "💡 Si ves errores, verifica:"
echo "  1. npm run dev está ejecutándose"
echo "  2. OPENROUTER_API_KEY está en .env.local"
echo "  3. Revisa los logs del servidor (en la terminal donde corre npm run dev)"
