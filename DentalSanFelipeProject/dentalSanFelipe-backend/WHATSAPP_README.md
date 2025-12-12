# 📱 Notificaciones de WhatsApp - Guía Rápida

## ✅ Funcionalidad Implementada

Cuando se crea una cita nueva, el sistema **automáticamente**:
1. Guarda la cita en la base de datos
2. Envía un mensaje de WhatsApp al paciente con:
   - Fecha y hora de la cita
   - Nombre del dentista
   - Motivo de la consulta
   - Instrucciones

## 🚀 Cómo Activar

### Para Desarrollo/Pruebas (SIN envío real)

Deja la configuración por defecto en `.env`:
```env
WHATSAPP_ENABLED=false
```

Los mensajes se mostrarán en la consola del servidor pero **no se enviarán**.

### Para Producción (Envío REAL)

1. **Obtén credenciales de WhatsApp Business API:**
   - Ve a https://developers.facebook.com/
   - Crea una app de WhatsApp Business
   - Obtén tu **Phone Number ID** y **Access Token**

2. **Actualiza `.env`:**
   ```env
   WHATSAPP_ENABLED=true
   WHATSAPP_PHONE_ID=tu_phone_number_id_real
   WHATSAPP_TOKEN=tu_token_real
   ```

3. **Reinicia el servidor:**
   ```bash
   npm start
   ```

## 🧪 Probar WhatsApp

Para probar el envío sin crear una cita:

```bash
npm run test:whatsapp
```

Edita `scripts/test-whatsapp.js` y cambia el número de teléfono por el tuyo.

## 📋 Ejemplo de Mensaje

El paciente recibirá:

```
🦷 *Dental San Felipe*

Hola *Juan Pérez*,

✅ Tu cita ha sido confirmada:

📅 *Fecha:* viernes, 15 de diciembre de 2025
🕐 *Hora:* 14:30
👨‍⚕️ *Dentista:* Dr(a). María González
📋 *Motivo:* Limpieza dental

Por favor, llega 10 minutos antes de tu cita.

Si necesitas cancelar o reagendar, contáctanos con anticipación.

¡Te esperamos! 😊
```

## ⚙️ Configuración Avanzada

Ver archivo completo: [WHATSAPP_CONFIG.md](./WHATSAPP_CONFIG.md)

## ❓ Troubleshooting

**Problema:** No se envían mensajes
- ✅ Verifica `WHATSAPP_ENABLED=true`
- ✅ Revisa las credenciales en `.env`
- ✅ Mira los logs en la terminal del backend

**Problema:** Error de autenticación
- ✅ Regenera el token en Meta Developers
- ✅ Verifica que el Phone Number ID sea correcto

**Problema:** Número inválido
- ✅ Asegúrate de que tenga 10 dígitos
- ✅ Verifica que esté en la base de datos

## 📚 Más Información

- [Configuración Completa](./WHATSAPP_CONFIG.md)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
