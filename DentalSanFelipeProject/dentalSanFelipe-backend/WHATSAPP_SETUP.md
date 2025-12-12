# 📱 Configuración de Notificaciones WhatsApp con Twilio

## 🎯 Resumen

Este sistema envía recordatorios de citas dentales automáticamente por WhatsApp usando **Twilio WhatsApp API**. Los mensajes se programan 24 horas antes de cada cita.

---

## 📋 Requisitos Previos

1. **Cuenta de Twilio** (prueba gratuita disponible)
2. **Node.js** instalado
3. **Base de datos MySQL** configurada

---

## 🚀 Pasos para Configurar Twilio WhatsApp

### Paso 1: Crear Cuenta de Twilio

1. Ve a [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Regístrate con tu email (obtendrás $15 USD de crédito gratis)
3. Verifica tu número de teléfono
4. Completa el cuestionario inicial

### Paso 2: Obtener Credenciales

1. Una vez en el Dashboard, ve a **Account Info** en la página principal
2. Encontrarás:
   - **Account SID**: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Auth Token**: Click en "Show" para verlo

### Paso 3: Configurar WhatsApp Sandbox (Desarrollo)

Para pruebas, Twilio ofrece un **Sandbox de WhatsApp** gratuito:

1. En el dashboard de Twilio, ve a: **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Verás un código como: `join <palabra-clave>` (ej: `join solar-window`)
3. **Conecta tu WhatsApp personal:**
   - Abre WhatsApp en tu teléfono
   - Envía un mensaje al número de Twilio: `+1 415 523 8886`
   - Escribe exactamente: `join <tu-palabra-clave>`
   - Recibirás confirmación: "Sandbox connected!"
4. Copia el número del sandbox: `+14155238886`

### Paso 4: Configurar Variables de Entorno

Edita el archivo `.env` en el backend:

```env
# ==========================================
# NOTIFICACIONES WHATSAPP (TWILIO)
# ==========================================

# Credenciales de Twilio (obtén en https://console.twilio.com/)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=tu_auth_token_real_aqui

# Número de WhatsApp de Twilio
# Para desarrollo (Sandbox):
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Modo de simulación
# true = No envía mensajes reales (solo logs)
# false = Envía mensajes reales
WHATSAPP_SIMULATION_MODE=false

# Configuración del worker
NOTIFICATION_WORKER_INTERVAL=30000
NOTIFICATION_MAX_RETRIES=3
```

### Paso 5: Instalar Dependencias

Si aún no tienes el paquete de Twilio, instálalo:

```bash
cd dentalSanFelipe-backend
npm install twilio
```

### Paso 6: Iniciar el Worker de Notificaciones

```bash
cd dentalSanFelipe-backend
node src/workers/notification.worker.js
```

Verás en consola:
```
[WhatsApp Worker] 🚀 Iniciando worker de notificaciones WhatsApp...
[WhatsApp Worker] 📋 Modo: PRODUCCIÓN
[WhatsApp Worker] ⏱️  Intervalo: 30 segundos
[WhatsApp Worker] 🔄 Reintentos máximos: 3
[WhatsApp Worker] 📞 Número Twilio: whatsapp:+14155238886
```

---

## 🧪 Probar el Sistema

### 1. Crear una Cita de Prueba

1. Inicia sesión en el sistema como administrador u odontólogo
2. Ve a **Citas** → **Crear Cita**
3. Rellena los datos:
   - Selecciona un paciente (o crea uno nuevo)
   - **IMPORTANTE**: El paciente debe tener un número de teléfono registrado
   - Fecha y hora de la cita
   - Tipo de cita
4. Guarda la cita

### 2. Verificar que se Creó la Notificación

Conéctate a MySQL:

```bash
docker exec -it mysql_dentalsanfelipe mysql -uroot -proot dental_sanfelipe
```

Ejecuta:

```sql
SELECT 
  id_notificacion,
  id_cita,
  telefono,
  mensaje,
  fecha_programada,
  enviado,
  intentos
FROM notificaciones
ORDER BY created_at DESC
LIMIT 5;
```

Deberías ver una notificación con:
- `enviado = 0` (false)
- `fecha_programada` = 24 horas antes de la cita
- `telefono` del paciente

### 3. Probar Envío Inmediato (Opcional)

Para no esperar 24 horas, puedes modificar la fecha programada:

```sql
UPDATE notificaciones 
SET fecha_programada = NOW()
WHERE id_notificacion = 1;
```

El worker la detectará en el siguiente ciclo (máximo 30 segundos).

### 4. Verificar el Envío

En la consola del worker verás:

```
[WhatsApp Worker] 📱 Enviando mensaje real a +52XXXXXXXXXX
[WhatsApp Worker] ✅ Mensaje enviado. SID: SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Y en tu WhatsApp conectado al sandbox recibirás:

```
Hola Juan Pérez, te recordamos tu cita dental programada para el 11/12/2025 a las 10:00 AM. ¡Te esperamos! - Dental San Felipe
```

---

## 🏭 Pasar a Producción

El Sandbox de Twilio **solo funciona con números que se registraron manualmente**. Para producción:

### Opción 1: Solicitar Aprobación de WhatsApp Business API

1. En Twilio, ve a: **Messaging** → **Senders** → **WhatsApp senders**
2. Click en **Request Access**
3. Completa el formulario con:
   - Nombre de tu negocio
   - Página web
   - Logo
   - Descripción del caso de uso
4. Espera aprobación (2-3 días hábiles)
5. Una vez aprobado, obtendrás tu propio número de WhatsApp Business
6. Actualiza en `.env`:

```env
TWILIO_WHATSAPP_FROM=whatsapp:+52XXXXXXXXXX
```

### Opción 2: Usar Meta WhatsApp Business API Directamente

Si prefieres evitar costos de Twilio, puedes integrar directamente con Meta:

1. Crea una cuenta en [Meta for Developers](https://developers.facebook.com/)
2. Configura WhatsApp Business API
3. Obtén tu Access Token
4. Modifica el código del worker para usar la API de Meta en lugar de Twilio

---

## 💰 Costos

### Twilio WhatsApp API

| Tipo | Costo |
|------|-------|
| **Sandbox (Desarrollo)** | Gratis (limitado a números registrados) |
| **Mensajes de Notificación** | ~$0.005 USD por mensaje |
| **Mensajes de Sesión** | ~$0.01 USD por mensaje |
| **Crédito Inicial** | $15 USD gratis al registrarse |

**Ejemplo**: 1000 recordatorios de citas = ~$5 USD/mes

### Meta WhatsApp Business API

| Tipo | Costo |
|------|-------|
| **Primeros 1000 mensajes/mes** | Gratis |
| **Mensajes adicionales** | Variable según país |

---

## 🔧 Troubleshooting

### Error: "Credenciales de Twilio no configuradas"

- Verifica que `.env` tenga `TWILIO_ACCOUNT_SID` y `TWILIO_AUTH_TOKEN`
- Asegúrate de que `WHATSAPP_SIMULATION_MODE=false`

### Error: "from number is not a valid WhatsApp-enabled Twilio number"

- Verifica que `TWILIO_WHATSAPP_FROM` tenga el formato: `whatsapp:+14155238886`
- Para sandbox, usa `+14155238886`

### El mensaje no llega

1. Verifica que el destinatario haya hecho `join <palabra>` en el sandbox
2. Revisa la consola del worker para ver errores
3. Consulta los logs en Twilio Dashboard → Monitor → Logs

### Error: "Cannot find module 'twilio'"

```bash
npm install twilio
```

---

## 📊 Monitoreo

### Ver Notificaciones en Base de Datos

```sql
-- Notificaciones enviadas hoy
SELECT COUNT(*) as total_enviados
FROM notificaciones
WHERE DATE(fecha_envio) = CURDATE() AND enviado = TRUE;

-- Notificaciones fallidas
SELECT 
  id_notificacion,
  telefono,
  intentos,
  detalle_error
FROM notificaciones
WHERE enviado = FALSE AND intentos >= 3;

-- Tasa de éxito
SELECT 
  COUNT(*) as total,
  SUM(enviado) as exitosos,
  ROUND(SUM(enviado) / COUNT(*) * 100, 2) as tasa_exito
FROM notificaciones;
```

### Dashboard de Twilio

Ve a [https://console.twilio.com/monitor/logs](https://console.twilio.com/monitor/logs) para ver:
- Mensajes enviados
- Mensajes fallidos
- Razones de fallas
- Estadísticas de entrega

---

## 🔐 Seguridad

1. **Nunca subas el `.env` a Git**
   - Ya está en `.gitignore`
   - Usa `.env.example` como plantilla

2. **Rota las credenciales periódicamente**
   - En Twilio Dashboard → Account → Keys & Credentials

3. **Usa variables de entorno en producción**
   - En servicios como Heroku, Vercel, AWS, etc.
   - No hardcodees las credenciales

---

## 📚 Recursos Adicionales

- [Documentación oficial de Twilio WhatsApp](https://www.twilio.com/docs/whatsapp)
- [Precios de Twilio WhatsApp](https://www.twilio.com/whatsapp/pricing)
- [WhatsApp Business API de Meta](https://developers.facebook.com/docs/whatsapp)
- [Sandbox de WhatsApp de Twilio](https://www.twilio.com/docs/whatsapp/sandbox)

---

## ✅ Checklist de Configuración

- [ ] Cuenta de Twilio creada
- [ ] Credenciales copiadas al `.env`
- [ ] WhatsApp conectado al sandbox (enviar `join <palabra>`)
- [ ] Paquete `twilio` instalado (`npm install twilio`)
- [ ] `WHATSAPP_SIMULATION_MODE=false` en `.env`
- [ ] Worker iniciado (`node src/workers/notification.worker.js`)
- [ ] Cita de prueba creada
- [ ] Notificación recibida en WhatsApp ✅

---

¿Necesitas ayuda? Revisa los logs del worker o contacta al equipo de desarrollo.
