// src/services/whatsapp-twilio.service.js
import twilio from 'twilio';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM;
const WHATSAPP_ENABLED = process.env.WHATSAPP_ENABLED === 'true';

// Validar credenciales antes de inicializar
function isValidAccountSid(sid) {
  return sid && sid.startsWith('AC') && sid.length === 34;
}

function isValidAuthToken(token) {
  return token && token.length === 32;
}

let twilioClient = null;
let twilioConfigured = false;

// Solo inicializar si las credenciales son válidas
if (isValidAccountSid(TWILIO_ACCOUNT_SID) && isValidAuthToken(TWILIO_AUTH_TOKEN)) {
  try {
    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    twilioConfigured = true;
    console.log('[WhatsApp] ✅ Cliente Twilio inicializado correctamente');
  } catch (error) {
    console.warn('[WhatsApp] ⚠️ Error al inicializar Twilio:', error.message);
  }
} else {
  console.log('[WhatsApp] ℹ️ Twilio no configurado (usando credenciales de ejemplo)');
  console.log('[WhatsApp] ℹ️ Para activar WhatsApp real, consulta ACTIVAR_WHATSAPP.md');
}

/**
 * Formatea número para WhatsApp
 */
function formatWhatsAppNumber(telefono) {
  let phone = telefono.replace(/[\s\-\(\)]/g, '');
  
  if (phone.startsWith('+')) {
    return `whatsapp:${phone}`;
  }
  
  if (phone.length === 10) {
    phone = '+521' + phone; // México
  }
  
  return `whatsapp:${phone}`;
}

/**
 * Envía mensaje por WhatsApp usando Twilio
 */
export async function sendWhatsAppMessage(telefono, mensaje) {
  // Modo simulado o Twilio no configurado
  if (!WHATSAPP_ENABLED || !twilioConfigured) {
    const reason = !WHATSAPP_ENABLED ? 'WHATSAPP_ENABLED=false' : 'Credenciales Twilio inválidas';
    console.log(`[WhatsApp] 📱 Mensaje simulado (${reason}):`);
    console.log('  Para:', telefono);
    console.log('  Mensaje:', mensaje);
    console.log('  💡 Para activar WhatsApp real, consulta ACTIVAR_WHATSAPP.md');
    return { success: true, simulated: true };
  }

  try {
    const to = formatWhatsAppNumber(telefono);
    
    const message = await twilioClient.messages.create({
      from: TWILIO_WHATSAPP_FROM,
      to: to,
      body: mensaje
    });

    console.log('[WhatsApp] ✅ Mensaje enviado:', message.sid);
    return { success: true, messageId: message.sid };
  } catch (error) {
    console.error('[WhatsApp] ❌ Error:', error.message);
    throw error;
  }
}

/**
 * Envía confirmación de cita
 */
export async function sendAppointmentConfirmation({ nombrePaciente, telefono, fechaCita, nombreDoctor, motivo }) {
  const fecha = new Date(fechaCita);
  const fechaFormateada = format(fecha, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  const horaFormateada = format(fecha, 'HH:mm', { locale: es });

  const mensaje = `🦷 *Dental San Felipe*

Hola *${nombrePaciente}*,

✅ Tu cita ha sido confirmada:

📅 *Fecha:* ${fechaFormateada}
🕐 *Hora:* ${horaFormateada}
👨‍⚕️ *Dentista:* Dr(a). ${nombreDoctor}${motivo ? `\n📋 *Motivo:* ${motivo}` : ''}

Por favor, llega 10 minutos antes de tu cita.

Si necesitas cancelar o reagendar, contáctanos con anticipación.

¡Te esperamos! 😊`;

  return await sendWhatsAppMessage(telefono, mensaje);
}
