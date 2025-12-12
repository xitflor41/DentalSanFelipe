// src/services/whatsapp.service.js
import axios from 'axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Servicio para enviar mensajes de WhatsApp
 * Usa la API de WhatsApp Business (Meta/Facebook)
 * 
 * Para usar este servicio necesitas:
 * 1. Cuenta de WhatsApp Business API
 * 2. Token de acceso
 * 3. Phone Number ID
 * 
 * Variables de entorno requeridas:
 * - WHATSAPP_API_URL (default: https://graph.facebook.com/v18.0)
 * - WHATSAPP_PHONE_ID
 * - WHATSAPP_TOKEN
 */

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0';
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_ENABLED = process.env.WHATSAPP_ENABLED === 'true';

/**
 * Formatea número de teléfono a formato internacional
 * @param {string} telefono - Número de teléfono (puede incluir espacios, guiones, etc)
 * @returns {string} - Número en formato internacional (ej: 5215512345678)
 */
function formatPhoneNumber(telefono) {
  // Remover espacios, guiones, paréntesis
  let phone = telefono.replace(/[\s\-\(\)]/g, '');
  
  // Si empieza con +, quitarlo
  if (phone.startsWith('+')) {
    phone = phone.substring(1);
  }
  
  // Si es número de México (10 dígitos) agregar código de país
  if (phone.length === 10) {
    phone = '521' + phone; // 52 = México, 1 = celular
  }
  
  return phone;
}

/**
 * Envía un mensaje de WhatsApp
 * @param {string} telefono - Número de teléfono del destinatario
 * @param {string} mensaje - Mensaje a enviar
 * @returns {Promise<Object>} - Respuesta de la API
 */
export async function sendWhatsAppMessage(telefono, mensaje) {
  // Si WhatsApp está deshabilitado, solo loguear
  if (!WHATSAPP_ENABLED) {
    console.log('[WhatsApp DISABLED] Mensaje no enviado a:', telefono);
    console.log('[WhatsApp DISABLED] Mensaje:', mensaje);
    return { success: true, simulated: true, message: 'WhatsApp deshabilitado' };
  }

  // Validar configuración
  if (!WHATSAPP_PHONE_ID || !WHATSAPP_TOKEN) {
    console.error('[WhatsApp] Configuración incompleta. Verifica WHATSAPP_PHONE_ID y WHATSAPP_TOKEN');
    throw new Error('WhatsApp no configurado correctamente');
  }

  try {
    const phoneNumber = formatPhoneNumber(telefono);
    const url = `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_ID}/messages`;

    const response = await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: {
          body: mensaje
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('[WhatsApp] Mensaje enviado exitosamente a:', phoneNumber);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('[WhatsApp] Error al enviar mensaje:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Envía confirmación de cita por WhatsApp
 * @param {Object} params - Parámetros de la cita
 * @param {string} params.nombrePaciente - Nombre completo del paciente
 * @param {string} params.telefono - Teléfono del paciente
 * @param {string} params.fechaCita - Fecha y hora de la cita (ISO string)
 * @param {string} params.nombreDoctor - Nombre del dentista
 * @param {string} params.motivo - Motivo de la cita (opcional)
 * @returns {Promise<Object>}
 */
export async function sendAppointmentConfirmation({ nombrePaciente, telefono, fechaCita, nombreDoctor, motivo }) {
  const fecha = new Date(fechaCita);
  
  // Formatear fecha: "viernes, 15 de diciembre de 2025"
  const fechaFormateada = format(fecha, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  
  // Formatear hora: "14:30"
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

/**
 * Envía recordatorio de cita por WhatsApp
 * @param {Object} params - Similar a sendAppointmentConfirmation
 * @returns {Promise<Object>}
 */
export async function sendAppointmentReminder({ nombrePaciente, telefono, fechaCita, nombreDoctor, motivo }) {
  const fecha = new Date(fechaCita);
  const fechaFormateada = format(fecha, "EEEE, d 'de' MMMM", { locale: es });
  const horaFormateada = format(fecha, 'HH:mm', { locale: es });

  const mensaje = `🦷 *Recordatorio - Dental San Felipe*

Hola *${nombrePaciente}*,

⏰ Te recordamos tu cita dental:

📅 *Mañana* ${fechaFormateada}
🕐 *Hora:* ${horaFormateada}
👨‍⚕️ *Dentista:* Dr(a). ${nombreDoctor}${motivo ? `\n📋 *Motivo:* ${motivo}` : ''}

No olvides llegar 10 minutos antes.

¡Nos vemos pronto! 😊`;

  return await sendWhatsAppMessage(telefono, mensaje);
}
