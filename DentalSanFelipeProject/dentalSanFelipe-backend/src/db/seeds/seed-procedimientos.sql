-- Seed inicial de procedimientos comunes
-- Ejecutar DESPUÉS de la migración

USE dental_sanfelipe;

-- Insertar procedimientos dentales comunes
INSERT INTO procedimiento (nombre, descripcion, categoria, costo_base, duracion_estimada, activo) VALUES
('Limpieza Dental Básica', 'Profilaxis dental con ultrasonido y pulido', 'Profilaxis', 500.00, 30, TRUE),
('Limpieza Profunda (Cuadrante)', 'Raspado y alisado radicular por cuadrante', 'Periodoncia', 800.00, 60, TRUE),
('Extracción Simple', 'Extracción de diente erupcionado sin complicaciones', 'Cirugía', 600.00, 30, TRUE),
('Extracción Compleja', 'Extracción quirúrgica de diente retenido o impactado', 'Cirugía', 1500.00, 90, TRUE),
('Resina Dental', 'Restauración con resina compuesta (1 superficie)', 'Restauración', 450.00, 45, TRUE),
('Resina Dental (2+ superficies)', 'Restauración con resina compuesta múltiples superficies', 'Restauración', 700.00, 60, TRUE),
('Amalgama', 'Restauración con amalgama', 'Restauración', 400.00, 45, TRUE),
('Endodoncia Unirradicular', 'Tratamiento de conducto en diente de una raíz', 'Endodoncia', 2500.00, 90, TRUE),
('Endodoncia Multirradicular', 'Tratamiento de conducto en diente de múltiples raíces', 'Endodoncia', 3500.00, 120, TRUE),
('Corona Porcelana', 'Corona de porcelana sobre metal', 'Prótesis', 4000.00, 60, TRUE),
('Corona Zirconia', 'Corona de zirconia (estética)', 'Prótesis', 6000.00, 60, TRUE),
('Puente Fijo (3 unidades)', 'Puente dental fijo de 3 piezas', 'Prótesis', 9000.00, 90, TRUE),
('Prótesis Removible Parcial', 'Dentadura parcial removible', 'Prótesis', 5500.00, 120, TRUE),
('Prótesis Removible Total', 'Dentadura completa superior o inferior', 'Prótesis', 8000.00, 180, TRUE),
('Blanqueamiento Dental', 'Blanqueamiento dental en consultorio', 'Estética', 2000.00, 60, TRUE),
('Carilla de Porcelana', 'Carilla estética de porcelana', 'Estética', 5000.00, 90, TRUE),
('Radiografía Periapical', 'Radiografía dental individual', 'Radiología', 150.00, 10, TRUE),
('Radiografía Panorámica', 'Radiografía panorámica completa', 'Radiología', 350.00, 15, TRUE),
('Fluorización', 'Aplicación tópica de flúor', 'Prevención', 250.00, 20, TRUE),
('Sellante de Fosas', 'Sellante de fosas y fisuras (por pieza)', 'Prevención', 300.00, 20, TRUE),
('Brackets Metálicos (por arcada)', 'Ortodoncia con brackets metálicos', 'Ortodoncia', 15000.00, 120, TRUE),
('Brackets Estéticos (por arcada)', 'Ortodoncia con brackets cerámicos', 'Ortodoncia', 20000.00, 120, TRUE),
('Ajuste de Ortodoncia', 'Ajuste mensual de aparato ortodóntico', 'Ortodoncia', 500.00, 30, TRUE),
('Urgencia Dental', 'Atención de urgencia (dolor, infección)', 'Urgencias', 400.00, 30, TRUE);

SELECT 'Procedimientos comunes insertados exitosamente' AS status;
SELECT COUNT(*) AS total_procedimientos FROM procedimiento;
