-- ============================================
-- ClinicaSoft - Esquema de Base de Datos
-- Ejecutar en el SQL Editor de Supabase
-- ============================================

-- 1. TABLA: pacientes
CREATE TABLE IF NOT EXISTS pacientes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  dni TEXT NOT NULL UNIQUE,
  nombres TEXT NOT NULL,
  apellidos TEXT NOT NULL,
  fecha_nacimiento DATE,
  edad INTEGER GENERATED ALWAYS AS (
    CASE WHEN fecha_nacimiento IS NOT NULL
      THEN DATE_PART('year', AGE(CURRENT_DATE, fecha_nacimiento))::INTEGER
      ELSE NULL
    END
  ) STORED,
  telefono TEXT,
  correo TEXT,
  direccion TEXT,
  seguro TEXT DEFAULT 'Particular',
  fecha_registro DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice único explícito para DNI (seguridad adicional)
CREATE UNIQUE INDEX IF NOT EXISTS idx_pacientes_dni ON pacientes (dni);

-- 2. TABLA: medicos
CREATE TABLE IF NOT EXISTS medicos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre TEXT NOT NULL,
  especialidad TEXT,
  cmp TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA: especialidades
CREATE TABLE IF NOT EXISTS especialidades (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  medicos INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA: citas
CREATE TABLE IF NOT EXISTS citas (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  paciente_id BIGINT REFERENCES pacientes(id) ON DELETE CASCADE,
  medico_id BIGINT REFERENCES medicos(id) ON DELETE SET NULL,
  especialidad TEXT,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  estado TEXT DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Confirmada', 'Atendida', 'Cancelada')),
  motivo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA: historias_clinicas
CREATE TABLE IF NOT EXISTS historias_clinicas (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  paciente_id BIGINT REFERENCES pacientes(id) ON DELETE CASCADE,
  especialidad_id BIGINT REFERENCES especialidades(id),
  medico TEXT,
  fecha DATE DEFAULT CURRENT_DATE,
  motivo TEXT,
  examen_fisico TEXT,
  cie10_codigo TEXT,
  cie10_descripcion TEXT,
  tratamiento TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA: recetas
CREATE TABLE IF NOT EXISTS recetas (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  historia_id BIGINT REFERENCES historias_clinicas(id) ON DELETE CASCADE,
  medicamento TEXT NOT NULL,
  dosis TEXT,
  frecuencia TEXT,
  duracion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABLA: examenes
CREATE TABLE IF NOT EXISTS examenes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  historia_id BIGINT REFERENCES historias_clinicas(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  resultado TEXT,
  fecha DATE DEFAULT CURRENT_DATE
);

-- 8. TABLA: transacciones
CREATE TABLE IF NOT EXISTS transacciones (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  paciente TEXT,
  concepto TEXT,
  monto NUMERIC(10,2),
  metodo TEXT CHECK (metodo IN ('Efectivo', 'Tarjeta', 'Yape/PLIN')),
  fecha DATE DEFAULT CURRENT_DATE,
  estado TEXT DEFAULT 'Pagado' CHECK (estado IN ('Pagado', 'Pendiente')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TABLA: archivos_clinicos
CREATE TABLE IF NOT EXISTS archivos_clinicos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  paciente_id BIGINT REFERENCES pacientes(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  tipo TEXT,
  tamano BIGINT,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. TABLA: usuarios (para auth sync)
CREATE TABLE IF NOT EXISTS usuarios (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT,
  email TEXT UNIQUE,
  rol TEXT DEFAULT 'admin' CHECK (rol IN ('admin', 'medico', 'recepcion', 'farmacia')),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha);
CREATE INDEX IF NOT EXISTS idx_citas_paciente ON citas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_citas_medico ON citas(medico_id);
CREATE INDEX IF NOT EXISTS idx_historias_paciente ON historias_clinicas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_transacciones_fecha ON transacciones(fecha);
CREATE INDEX IF NOT EXISTS idx_pacientes_dni ON pacientes(dni);

-- ============================================
-- ROW LEVEL SECURITY (opcional)
-- ============================================
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE historias_clinicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE especialidades ENABLE ROW LEVEL SECURITY;

-- Política: todos los usuarios autenticados pueden leer
CREATE POLICY "Lectura anónima" ON pacientes FOR SELECT USING (true);
CREATE POLICY "Lectura anónima" ON citas FOR SELECT USING (true);
CREATE POLICY "Lectura anónima" ON historias_clinicas FOR SELECT USING (true);
CREATE POLICY "Lectura anónima" ON transacciones FOR SELECT USING (true);
CREATE POLICY "Lectura anónima" ON especialidades FOR SELECT USING (true);

-- Política: solo admin puede insertar/actualizar/eliminar
-- (descomentar si se requiere)
-- CREATE POLICY "Insertar admin" ON pacientes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- CREATE POLICY "Actualizar admin" ON pacientes FOR UPDATE USING (auth.role() = 'authenticated');
-- CREATE POLICY "Eliminar admin" ON pacientes FOR DELETE USING (auth.role() = 'authenticated');
