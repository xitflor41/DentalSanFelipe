// scripts/fix-historia-links.js
// Script para vincular historias clínicas existentes a expedientes
// Ejecutar con: node scripts/fix-historia-links.js

import { pool } from '../src/config/db.config.js';

async function fixHistoriaLinks() {
  console.log('🔧 Iniciando vinculación de historias clínicas...\n');

  try {
    // 1. Mostrar expedientes sin historia vinculada que SÍ tienen historia
    const [orphaned] = await pool.query(`
      SELECT 
        e.id_expediente,
        e.id_paciente,
        e.id_historiaClinica AS historia_actual,
        hc.id_historiaClinica AS historia_disponible,
        p.nombre,
        p.apellido
      FROM expedientes e
      LEFT JOIN pacientes p ON e.id_paciente = p.id_paciente
      LEFT JOIN historia_clinica hc ON e.id_paciente = hc.id_paciente
      WHERE e.id_historiaClinica IS NULL 
        AND hc.id_historiaClinica IS NOT NULL
    `);

    if (orphaned.length === 0) {
      console.log('✅ No hay historias clínicas sin vincular.');
      console.log('   Todas las historias están correctamente vinculadas a sus expedientes.\n');
    } else {
      console.log(`📋 Encontradas ${orphaned.length} historias sin vincular:\n`);
      orphaned.forEach(row => {
        console.log(`   • Paciente: ${row.nombre} ${row.apellido}`);
        console.log(`     Expediente: #${row.id_expediente}`);
        console.log(`     Historia disponible: #${row.historia_disponible}\n`);
      });

      // 2. Vincular las historias
      const [result] = await pool.query(`
        UPDATE expedientes e
        INNER JOIN historia_clinica hc ON e.id_paciente = hc.id_paciente
        SET e.id_historiaClinica = hc.id_historiaClinica
        WHERE e.id_historiaClinica IS NULL
      `);

      console.log(`✅ ${result.affectedRows} expediente(s) actualizado(s).\n`);
    }

    // 3. Verificar resultado final
    const [vinculadas] = await pool.query(`
      SELECT 
        e.id_expediente,
        e.id_paciente,
        e.id_historiaClinica,
        p.nombre,
        p.apellido,
        SUBSTRING(hc.antecedentesFam, 1, 50) AS antecedentes_preview
      FROM expedientes e
      LEFT JOIN pacientes p ON e.id_paciente = p.id_paciente
      LEFT JOIN historia_clinica hc ON e.id_historiaClinica = hc.id_historiaClinica
      WHERE e.id_historiaClinica IS NOT NULL
    `);

    if (vinculadas.length > 0) {
      console.log(`📊 Total de expedientes con historia clínica: ${vinculadas.length}\n`);
      vinculadas.forEach(row => {
        console.log(`   ✓ Expediente #${row.id_expediente} - ${row.nombre} ${row.apellido}`);
        console.log(`     Historia: #${row.id_historiaClinica}`);
        if (row.antecedentes_preview) {
          console.log(`     Preview: ${row.antecedentes_preview}...`);
        }
        console.log('');
      });
    }

    console.log('🎉 Proceso completado exitosamente!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

fixHistoriaLinks();
