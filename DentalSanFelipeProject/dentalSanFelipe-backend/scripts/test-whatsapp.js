// scripts/test-whatsapp.js
// Script para probar el envío de mensajes de WhatsApp

import { sendAppointmentConfirmation } from '../src/services/whatsapp.service.js';

// Configuración de prueba
const testData = {
  nombrePaciente: 'Juan Pérez',
  telefono: '5512345678', // Cambia esto por tu número de prueba
  fechaCita: new Date('2025-12-15T14:30:00'),
  nombreDoctor: 'María González',
  motivo: 'Limpieza dental'
};

console.log('🧪 Iniciando prueba de WhatsApp...\n');
console.log('Datos de prueba:');
console.log(JSON.stringify(testData, null, 2));
console.log('\n');

sendAppointmentConfirmation(testData)
  .then((result) => {
    console.log('✅ Mensaje enviado exitosamente!');
    console.log('Resultado:', result);
  })
  .catch((error) => {
    console.error('❌ Error al enviar mensaje:');
    console.error(error.message);
    if (error.response) {
      console.error('Respuesta de la API:', error.response.data);
    }
  });
