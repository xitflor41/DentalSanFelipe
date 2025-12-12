# 🚀 GUÍA RÁPIDA: Activar WhatsApp en 5 Minutos

## Paso 1: Crear Cuenta en Twilio (GRATIS)

1. Ve a: https://www.twilio.com/try-twilio
2. Regístrate (incluye $15 USD gratis)
3. Verifica tu email y teléfono

## Paso 2: Activar WhatsApp Sandbox

1. En el dashboard de Twilio, ve a: **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Verás un código como: `join [palabra-clave]`
3. Desde tu WhatsApp personal, envía ese mensaje al número que te muestra (ej: +1 415 523 8886)
4. Recibirás confirmación: "You are all set!"

## Paso 3: Obtener Credenciales

En el dashboard de Twilio:
- **Account SID**: Copia el que empieza con "AC..."
- **Auth Token**: Click en "Show" y cópialo
- **WhatsApp From**: El número que usaste (ej: whatsapp:+14155238886)

## Paso 4: Configurar .env

Abre el archivo `.env` y actualiza:

```env
WHATSAPP_ENABLED=true
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=tu_auth_token_aqui
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

## Paso 5: Reiniciar Servidor

```bash
# Detén el servidor (Ctrl+C)
npm start
```

## 🧪 Probar Ahora

1. **En el navegador**: Crea una cita nueva
2. **Asegúrate** de que el paciente tenga un número de teléfono válido (10 dígitos)
3. **Revisa** tu WhatsApp - ¡deberías recibir el mensaje!

## ⚠️ IMPORTANTE

**Sandbox tiene limitaciones:**
- Solo puedes enviar a números que hayan hecho "join"
- Para cada número nuevo, deben enviar `join [palabra]` primero

**Para Producción (sin limitaciones):**
- Necesitas aprobar templates en Twilio
- Requiere verificación de negocio
- Documentación: https://www.twilio.com/docs/whatsapp

## 📱 Formato del Número

El número en la BD debe ser de 10 dígitos:
- ✅ `5512345678`
- ✅ `55 1234 5678`
- ❌ `555-1234` (incompleto)

## 🐛 Troubleshooting

**No llega el mensaje:**
1. Verifica que hiciste "join" en WhatsApp
2. Revisa los logs del servidor
3. Verifica las credenciales en .env

**Error 21211:**
- El número no está en el sandbox
- Debe hacer "join" primero

**Error de autenticación:**
- Verifica Account SID y Auth Token
- Asegúrate de no tener espacios

## 💡 Tips

- Puedes agregar hasta 5 números al sandbox gratuitamente
- Los mensajes en sandbox son gratis
- Cada número debe hacer "join" individualmente

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs del servidor (verás los errores)
2. Ve al console de Twilio: https://console.twilio.com/
3. Busca en "Monitor" → "Logs" → "Errors"
