# Configuración de WhatsApp para Notificaciones

Este documento explica cómo configurar el envío de mensajes de WhatsApp cuando se crea una cita.

## 📋 Opciones Disponibles

### Opción 1: WhatsApp Business API (Meta/Facebook) - RECOMENDADO

**Ventajas:**
- API oficial de Meta
- Sin límites de mensajes después de aprobación
- Más confiable y profesional

**Pasos para configurar:**

1. **Crear cuenta de Meta Business**
   - Ve a https://business.facebook.com/
   - Crea una cuenta de negocio

2. **Crear app de WhatsApp Business**
   - Ve a https://developers.facebook.com/
   - Click en "Mis Apps" → "Crear App"
   - Selecciona "Negocio" como tipo
   - Agrega el producto "WhatsApp"

3. **Obtener credenciales**
   - Ve a WhatsApp → Configuración
   - Copia el **Phone Number ID**
   - Genera un **Access Token** (temporal o permanente)
   - Verifica tu número de teléfono de negocio

4. **Configurar variables de entorno**
   ```env
   WHATSAPP_ENABLED=true
   WHATSAPP_API_URL=https://graph.facebook.com/v18.0
   WHATSAPP_PHONE_ID=tu_phone_number_id_aqui
   WHATSAPP_TOKEN=tu_access_token_aqui
   ```

5. **Agregar números de prueba** (Sandbox)
   - En el panel de WhatsApp, agrega números de prueba
   - Estos números deben enviar un mensaje al número de WhatsApp Business para activarse

### Opción 2: Twilio - ALTERNATIVA

**Ventajas:**
- Fácil de configurar
- Sandbox gratuito para pruebas
- Bien documentado

**Desventajas:**
- Requiere aprobación de plantillas para producción
- Costos por mensaje en producción

**Pasos para configurar:**

1. **Crear cuenta en Twilio**
   - Ve a https://www.twilio.com/try-twilio
   - Regístrate gratis (incluye $15 de crédito)

2. **Configurar WhatsApp Sandbox**
   - Ve a Console → Messaging → Try it out → Send a WhatsApp message
   - Sigue las instrucciones para conectar tu WhatsApp personal
   - Envía el código de activación desde tu WhatsApp

3. **Obtener credenciales**
   - En Console Dashboard copia:
     - Account SID
     - Auth Token
   - En WhatsApp Sandbox copia el número (ej: whatsapp:+14155238886)

4. **Configurar variables de entorno**
   ```env
   WHATSAPP_ENABLED=true
   TWILIO_ACCOUNT_SID=tu_account_sid
   TWILIO_AUTH_TOKEN=tu_auth_token
   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
   ```

5. **Actualizar el servicio** (opcional)
   - Si usas Twilio, necesitas modificar `whatsapp.service.js` para usar Twilio SDK
   - Instalar: `npm install twilio`

## 🧪 Modo de Prueba (Simulación)

Para probar sin enviar mensajes reales:

```env
WHATSAPP_ENABLED=false
```

Cuando está deshabilitado:
- Los mensajes se registran en consola
- No se hacen llamadas reales a la API
- Útil para desarrollo y pruebas

## 📱 Formato de Números de Teléfono

El sistema acepta varios formatos y los convierte automáticamente:

- `5512345678` (10 dígitos) → Se convierte a `5215512345678`
- `+5215512345678` → Se limpia y usa directamente
- `55 1234 5678` → Se eliminan espacios
- `(55) 1234-5678` → Se eliminan caracteres especiales

**Importante:** Asegúrate de que los números en la base de datos estén completos (10 dígitos para México).

## 📝 Mensaje de Confirmación

Cuando se crea una cita, se envía automáticamente:

```
🦷 *Dental San Felipe*

Hola *[Nombre del Paciente]*,

✅ Tu cita ha sido confirmada:

📅 *Fecha:* viernes, 15 de diciembre de 2025
🕐 *Hora:* 14:30
👨‍⚕️ *Dentista:* Dr(a). [Nombre del Dentista]
📋 *Motivo:* [Motivo de la cita]

Por favor, llega 10 minutos antes de tu cita.

Si necesitas cancelar o reagendar, contáctanos con anticipación.

¡Te esperamos! 😊
```

## 🔧 Troubleshooting

### Problema: Mensajes no se envían

1. Verifica que `WHATSAPP_ENABLED=true`
2. Revisa las credenciales en `.env`
3. Verifica los logs en consola del backend
4. Asegúrate de que el número de destino esté en formato correcto

### Problema: Error 401 Unauthorized

- Token expirado o inválido
- Regenera el access token en Meta/Twilio

### Problema: Error 400 Bad Request

- Número de teléfono en formato incorrecto
- Verifica el formato del número

### Problema: Error 404 Not Found

- Phone Number ID incorrecto
- Verifica que el número de negocio esté activo

## 🚀 Producción

**Antes de pasar a producción:**

1. ✅ Obtén un número de WhatsApp Business verificado
2. ✅ Genera un access token permanente (no temporal)
3. ✅ Configura webhook para recibir respuestas
4. ✅ Activa `WHATSAPP_ENABLED=true`
5. ✅ Prueba con números reales
6. ✅ Monitorea logs y errores

## 📚 Recursos Adicionales

- [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp)
- [Twilio WhatsApp Docs](https://www.twilio.com/docs/whatsapp)
- [Formato de números internacionales](https://en.wikipedia.org/wiki/E.164)

## ⚠️ Notas Importantes

- Los mensajes de WhatsApp tienen un costo en producción
- Respeta las políticas de WhatsApp Business
- No envíes spam o mensajes no solicitados
- Mantén las credenciales seguras (no las subas a Git)
