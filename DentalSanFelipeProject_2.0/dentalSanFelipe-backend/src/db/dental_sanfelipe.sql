-- dental_sanfelipe.sql
-- Versión final ajustada según diagrama y requerimientos del proyecto
CREATE DATABASE IF NOT EXISTS dental_sanfelipe CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE dental_sanfelipe;

-- -----------------------
-- USUARIOS
-- -----------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100),
  username VARCHAR(50) UNIQUE NOT NULL,
  correo VARCHAR(150) UNIQUE NOT NULL,
  contrasenna VARCHAR(255) NOT NULL,
  rol ENUM('administrador','odontologo','auxiliar') NOT NULL DEFAULT 'odontologo',
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------
-- PACIENTES
-- -----------------------
CREATE TABLE IF NOT EXISTS pacientes (
  id_paciente INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100),
  telefono VARCHAR(30),
  sexo ENUM('M','F','Otro') DEFAULT NULL,
  fecha_nac DATE DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------
-- PROCEDIMIENTO
-- -----------------------
CREATE TABLE IF NOT EXISTS procedimiento (
  id_procedimiento INT AUTO_INCREMENT PRIMARY KEY,
  nombreProcedimiento VARCHAR(150) NOT NULL,
  descripcion TEXT,
  costo DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------
-- HISTORIA_CLINICA
-- (Relacionado a paciente; cada historia pertenece a 1 paciente)
-- -----------------------
CREATE TABLE IF NOT EXISTS historia_clinica (
  id_historiaClinica INT AUTO_INCREMENT PRIMARY KEY,
  id_paciente INT NOT NULL,
  antecedentesFam TEXT,
  antecedentesPrsnls TEXT,
  padecimientosPrevios TEXT,
  factorRiesgo TEXT,
  alergias TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_paciente) REFERENCES pacientes(id_paciente) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------
-- EXPEDIENTES
-- (UNIQUE id_paciente => 1 expediente por paciente)
-- Nota: incluimos columna id_consulta nullable *sin* FK a consulta aún para evitar dependencia circular.
-- -----------------------
CREATE TABLE IF NOT EXISTS expedientes (
  id_expediente INT AUTO_INCREMENT PRIMARY KEY,
  id_paciente INT NOT NULL,
  id_usuario INT NULL, -- odontólogo responsable
  id_historiaClinica INT NULL,
  id_consulta INT NULL, -- será FK después (consulta creada más adelante)
  numero_expediente VARCHAR(50) UNIQUE,
  odontograma JSON DEFAULT NULL,
  observaciones TEXT,
  fechaVisita DATETIME DEFAULT CURRENT_TIMESTAMP,
  creado_por INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_paciente) REFERENCES pacientes(id_paciente) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (id_historiaClinica) REFERENCES historia_clinica(id_historiaClinica) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (creado_por) REFERENCES usuarios(id_usuario) ON DELETE SET NULL ON UPDATE CASCADE,
  UNIQUE (id_paciente)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------
-- CONSULTA
-- (Se crea después de expedientes para poder FK id_expediente)
-- -----------------------
CREATE TABLE IF NOT EXISTS consulta (
  id_consulta INT AUTO_INCREMENT PRIMARY KEY,
  id_expediente INT NULL,
  exploracionFisica TEXT,
  diagnostico TEXT,
  notas TEXT,
  realizado_por INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_expediente) REFERENCES expedientes(id_expediente) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (realizado_por) REFERENCES usuarios(id_usuario) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Una vez creada 'consulta', podemos crear la FK expedientes.id_consulta → consulta(id_consulta)
-- (Se ejecuta a continuación para que la FK exista)
ALTER TABLE expedientes
  ADD CONSTRAINT fk_expedientes_consulta FOREIGN KEY (id_consulta) REFERENCES consulta(id_consulta) ON DELETE SET NULL ON UPDATE CASCADE;

-- -----------------------
-- TRATAMIENTO
-- (Un tratamiento pertenece a una consulta; referencia opcional a procedimiento)
-- -----------------------
CREATE TABLE IF NOT EXISTS tratamiento (
  id_tratamiento INT AUTO_INCREMENT PRIMARY KEY,
  id_procedimiento INT NULL,
  id_consulta INT NULL,
  medicamento VARCHAR(150),
  dosis VARCHAR(80),
  viaAdministracion VARCHAR(80),
  duracion VARCHAR(80),
  efectosAdversos TEXT,
  costo DECIMAL(10,2) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_procedimiento) REFERENCES procedimiento(id_procedimiento) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (id_consulta) REFERENCES consulta(id_consulta) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------
-- ADJUNTOS (Archivos por expediente)
-- -----------------------
CREATE TABLE IF NOT EXISTS adjuntos (
  id_adjunto INT AUTO_INCREMENT PRIMARY KEY,
  id_expediente INT NOT NULL,
  nombreArchivo VARCHAR(255) NOT NULL,
  rutaArchivo VARCHAR(512) NOT NULL,
  tipoArchivo VARCHAR(80),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  creado_por INT NULL,
  FOREIGN KEY (id_expediente) REFERENCES expedientes(id_expediente) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (creado_por) REFERENCES usuarios(id_usuario) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------
-- CITAS
-- (Asociada a paciente; opcionalmente a expediente y a odontólogo)
-- -----------------------
CREATE TABLE IF NOT EXISTS citas (
  id_cita INT AUTO_INCREMENT PRIMARY KEY,
  id_paciente INT NOT NULL,
  id_expediente INT NULL,
  id_usuario INT NULL,
  fecha_cita DATE NOT NULL,
  hora_cita DATETIME NOT NULL,
  motivo VARCHAR(255),
  estado ENUM('agendada','cancelada','completada') DEFAULT 'agendada',
  creado_por INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_paciente) REFERENCES pacientes(id_paciente) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (id_expediente) REFERENCES expedientes(id_expediente) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (creado_por) REFERENCES usuarios(id_usuario) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------
-- NOTIFICACIONES (sin campo 'canal')
-- Cada cita puede generar varias notificaciones
-- -----------------------
CREATE TABLE IF NOT EXISTS notificaciones (
  id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
  id_cita INT NOT NULL,
  mensaje VARCHAR(1024) NOT NULL,
  fecha_programada TIMESTAMP NULL,
  fecha_envio TIMESTAMP NULL,
  intentos INT DEFAULT 0,
  enviado BOOLEAN DEFAULT FALSE,
  provider_msg_id VARCHAR(255),
  detalle_error TEXT,
  creado_por INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_cita) REFERENCES citas(id_cita) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (creado_por) REFERENCES usuarios(id_usuario) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------
-- PROCEDIMIENTO_TRATAMIENTO (si en futuro se requiere N:N)
-- (no estrictamente necesario si usas id_procedimiento en tratamiento, pero lo dejamos para flexibilidad)
-- -----------------------
CREATE TABLE IF NOT EXISTS procedimiento_tratamiento (
  id_procedimiento_tratamiento INT AUTO_INCREMENT PRIMARY KEY,
  id_tratamiento INT NOT NULL,
  id_procedimiento INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_tratamiento) REFERENCES tratamiento(id_tratamiento) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (id_procedimiento) REFERENCES procedimiento(id_procedimiento) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY uniq_trat_proced (id_tratamiento, id_procedimiento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------
-- ODONTOGRAMA
-- -----------------------
CREATE TABLE IF NOT EXISTS odontograma (
  id_odontograma INT AUTO_INCREMENT PRIMARY KEY,
  id_expediente INT NOT NULL,
  creado_por INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_expediente) REFERENCES expedientes(id_expediente) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (creado_por) REFERENCES usuarios(id_usuario) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS odontograma_piezas (
  id_pieza INT AUTO_INCREMENT PRIMARY KEY,
  id_odontograma INT NOT NULL,
  tooth_number TINYINT NOT NULL, -- 1..32 (numeración universal)
  tooth_type ENUM('incisivo','canino','premolar','molar') NOT NULL,
  estado VARCHAR(100) DEFAULT NULL, -- e.g. 'cariado','obturado','extraido','endodoncia'
  procedimiento_realizado INT NULL, -- FK opcional
  id_tratamiento INT NULL, -- FK opcional
  notas TEXT,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_odontograma) REFERENCES odontograma(id_odontograma) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (procedimiento_realizado) REFERENCES procedimiento(id_procedimiento) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (id_tratamiento) REFERENCES tratamiento(id_tratamiento) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------
-- AUDIT EXPEDIENTES
-- -----------------------
CREATE TABLE IF NOT EXISTS audit_expedientes (
  id_audit INT AUTO_INCREMENT PRIMARY KEY,
  id_expediente INT NOT NULL,
  id_usuario INT NULL,
  accion ENUM('CREAR','MODIFICAR','ELIMINAR','ADJUNTO','OTRO') NOT NULL,
  detalle JSON,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_expediente) REFERENCES expedientes(id_expediente) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Índices útiles
CREATE INDEX idx_citas_paciente_fecha ON citas (id_paciente, fecha_cita, hora_cita);

-- FIN del script
