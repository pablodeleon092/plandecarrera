-- =============================================================================
-- SCRIPT DE INSERCIÓN: Licenciatura en Sistemas - Docentes y Materias
-- Base de datos: PostgreSQL (Laravel)
-- Generado: Diciembre 2025
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. INSERTAR INSTITUTO (IDEI y EDI)
-- =============================================================================
INSERT INTO public.institutos (id, nombre, siglas, created_at, updated_at)
VALUES 
    (1, 'Instituto de Desarrollo Económico e Innovación', 'IDEI', NOW(), NOW()),
    (2, 'Escuela de Desarrollo e Innovación', 'EDI', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Resetear secuencia
SELECT setval('public.institutos_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM public.institutos), false);

-- =============================================================================
-- 2. INSERTAR DEDICACIONES
-- =============================================================================
INSERT INTO public.dedicaciones (id, nombre, horas_frente_aula_min, horas_frente_aula_max, nro_materias_max, created_at, updated_at)
VALUES 
    (1, 'Simple', 4, 10, 3, NOW(), NOW()),
    (2, 'SemiExclusiva(DP)', 8, 16, 4, NOW(), NOW()),
    (3, 'SemiExclusiva(DI)', 8, 16, 4, NOW(), NOW()),
    (4, 'Exclusiva', 12, 20, 5, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

SELECT setval('public.dedicaciones_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM public.dedicaciones), false);

-- =============================================================================
-- 3. INSERTAR FUNCIONES ÁULICAS
-- =============================================================================
INSERT INTO public.funciones_aulicas (id, nombre, created_at, updated_at)
VALUES 
    (1, 'Responsable de Cátedra', NOW(), NOW()),
    (2, 'Auxiliar de Cátedra', NOW(), NOW()),
    (3, 'Teórico', NOW(), NOW()),
    (4, 'Práctico', NOW(), NOW()),
    (5, 'Teórico-Práctico', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

SELECT setval('public.funciones_aulicas_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM public.funciones_aulicas), false);

-- =============================================================================
-- 4. INSERTAR MATERIAS
-- =============================================================================
INSERT INTO public.materias (id, codigo, nombre, estado, regimen, cuatrimestre, horas_semanales, horas_totales, created_at, updated_at)
VALUES
    (1, 'IF001', 'Elementos de Informática', true, 'cuatrimestral', 1, 7, 105, NOW(), NOW()),
    (2, 'IF002', 'Expresión de Problemas y Algoritmos', true, 'cuatrimestral', 1, 6, 90, NOW(), NOW()),
    (3, 'MA045', 'Algebra', true, 'cuatrimestral', 1, 9, 135, NOW(), NOW()),
    (4, 'IF003', 'Algorítmica y Programación I', true, 'cuatrimestral', 2, 8, 120, NOW(), NOW()),
    (5, 'MA008', 'Elementos de Lógica y Matemática Discreta', true, 'cuatrimestral', 2, 8, 120, NOW(), NOW()),
    (6, 'MA046', 'Análisis Matemático', true, 'cuatrimestral', 2, 11, 165, NOW(), NOW()),
    (7, 'IF004', 'Sistemas y Organizaciones', true, 'cuatrimestral', 1, 6, 90, NOW(), NOW()),
    (8, 'IF005', 'Arquitectura de Computadoras', true, 'cuatrimestral', 1, 8, 120, NOW(), NOW()),
    (9, 'IF006', 'Algorítmica y Programación II', true, 'cuatrimestral', 1, 8, 120, NOW(), NOW()),
    (10, 'MA006', 'Estadística', true, 'cuatrimestral', 1, 6, 90, NOW(), NOW()),
    (11, 'IF007', 'Bases de Datos I', true, 'cuatrimestral', 2, 9, 135, NOW(), NOW()),
    (12, 'IF030', 'Programación y Diseño Orientado a Objetos', true, 'cuatrimestral', 2, 8, 120, NOW(), NOW()),
    (13, 'IF031', 'Ingeniería de Software I', true, 'cuatrimestral', 2, 10, 150, NOW(), NOW()),
    (14, 'IF009', 'Laboratorio de Programación y Lenguajes', true, 'cuatrimestral', 1, 6, 90, NOW(), NOW()),
    (15, 'IF013', 'Fundamentos Teóricos de Informática', true, 'cuatrimestral', 1, 8, 120, NOW(), NOW()),
    (16, 'IF033', 'Ingeniería de Software II', true, 'cuatrimestral', 1, 8, 120, NOW(), NOW()),
    (17, 'IF038', 'Introducción a la Concurrencia', true, 'cuatrimestral', 1, 4, 60, NOW(), NOW()),
    (18, 'IF044', 'Bases de Datos II', true, 'cuatrimestral', 2, 8, 120, NOW(), NOW()),
    (19, 'IF037', 'Sistemas Operativos', true, 'cuatrimestral', 2, 8, 120, NOW(), NOW()),
    (20, 'IF055', 'Laboratorio de Software', true, 'cuatrimestral', 2, 7, 105, NOW(), NOW()),
    (21, 'IF056', 'Seminario de Aspectos Legales y Profesionales I', true, 'cuatrimestral', 2, 4, 60, NOW(), NOW()),
    (22, 'IF019', 'Redes y Transmisión de Datos', true, 'cuatrimestral', 1, 9, 135, NOW(), NOW()),
    (23, 'IF020', 'Paradigmas y Lenguajes de Programación', true, 'cuatrimestral', 1, 8, 120, NOW(), NOW()),
    (24, 'IF017', 'Taller de nuevas Tecnologías', true, 'cuatrimestral', 1, 6, 90, NOW(), NOW()),
    (25, 'IF022', 'Sistemas Distribuidos', true, 'cuatrimestral', 2, 8, 120, NOW(), NOW()),
    (26, 'IF035', 'Ingeniería de Software III', true, 'cuatrimestral', 2, 8, 120, NOW(), NOW()),
    (27, 'IF057', 'Seminario de Aspectos Legales y Profesionales II', true, 'cuatrimestral', 2, 4, 60, NOW(), NOW()),
    (28, 'IF059', 'Sistemas Inteligentes', true, 'cuatrimestral', 2, 6, 90, NOW(), NOW()),
    (29, 'IF060', 'Sistemas de Tiempo Real', true, 'cuatrimestral', 1, 7, 105, NOW(), NOW()),
    (30, 'IF061', 'Sistemas Paralelos', true, 'cuatrimestral', 1, 6, 90, NOW(), NOW()),
    (31, 'IF062', 'Bases de Datos Distribuidas', true, 'cuatrimestral', 1, 6, 90, NOW(), NOW()),
    (32, 'IF063', 'Seminario de Seguridad', true, 'cuatrimestral', 1, 4, 60, NOW(), NOW()),
    (33, 'IF027', 'Modelos y Simulación', true, 'cuatrimestral', 2, 6, 90, NOW(), NOW()),
    (34, 'IF042', 'Proyecto de Software', true, 'cuatrimestral', 2, 8, 120, NOW(), NOW()),
    (35, 'FA007', 'Acreditación de Idioma Inglés', true, 'cuatrimestral', 1, 0, 0, NOW(), NOW()),
    (36, 'IF026', 'Tesina', true, 'anual', 1, 0, 200, NOW(), NOW())
ON CONFLICT (codigo) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    horas_semanales = EXCLUDED.horas_semanales,
    horas_totales = EXCLUDED.horas_totales,
    updated_at = NOW();

SELECT setval('public.materias_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM public.materias), false);

-- =============================================================================
-- 5. INSERTAR DOCENTES (únicos por legajo)
-- Nota: Algunos docentes tienen múltiples registros con distintos cargos
-- =============================================================================
INSERT INTO public.docentes (id, legajo, nombre, apellido, "modalidad_desempeño", carga_horaria, es_activo, created_at, updated_at)
VALUES
    (1, 761, 'Luis Miguel', 'Rojas Flores', 'Investigador', 10, true, NOW(), NOW()),
    (2, 199, 'Lucila', 'Chiarvetto', 'Desarrollo', 14, true, NOW(), NOW()),
    (3, 359, 'Antonio Luis', 'Retamar', 'Investigador', 8, true, NOW(), NOW()),
    (4, 9017, 'Cristian Alejandro', 'Alvarez C.', 'Desarrollo', 8, true, NOW(), NOW()),
    (5, 9002, 'Samanta', 'Dodino', 'Desarrollo', 3, true, NOW(), NOW()),
    (6, 9021, 'Ivan', 'D''Uva', 'Desarrollo', 11, true, NOW(), NOW()),
    (7, 1059, 'Natalia Yudit', 'Bravo', 'Investigador', 11, true, NOW(), NOW()),
    (8, 9999, 'Fabiola', 'Horas Stevenson', 'Desarrollo', 9, true, NOW(), NOW()),
    (9, 9020, 'Alejandro', 'Carhuas', 'Desarrollo', 5, true, NOW(), NOW()),
    (10, 481, 'Antonio Héctor', 'Dell''Osa', 'Investigador', 10, true, NOW(), NOW()),
    (11, 83, 'Jorge Ezequiel', 'Moyano', 'Investigador', 13, true, NOW(), NOW()),
    (12, 129, 'Daniel', 'Aguil Mallea', 'Investigador', 16, true, NOW(), NOW()),
    (13, 50, 'Fernando', 'Aras', 'Desarrollo', 5, true, NOW(), NOW()),
    (14, 104, 'Matías', 'Gel', 'Investigador', 7, true, NOW(), NOW()),
    (15, 406, 'Federico Eduardo', 'Gonzalez', 'Investigador', 9, true, NOW(), NOW()),
    (16, 80, 'Ariel', 'Parson', 'Desarrollo', 8, true, NOW(), NOW()),
    (17, 89, 'Horacio', 'Pendenti', 'Investigador', 10, true, NOW(), NOW()),
    (18, 125, 'Guillermo', 'Prisching', 'Investigador', 8, true, NOW(), NOW()),
    (19, 453, 'Nadia Patricia', 'Ramos', 'Investigador', 14, true, NOW(), NOW()),
    (20, 172, 'Leonel', 'Viera', 'Investigador', 10, true, NOW(), NOW()),
    (21, 124, 'Martín', 'Villarreal', 'Desarrollo', 12, true, NOW(), NOW()),
    (22, 9022, 'Fernando', 'Temari', 'Desarrollo', 7, true, NOW(), NOW()),
    (23, 902, 'Cintia Alejandra', 'Aguado', 'Desarrollo', 7, true, NOW(), NOW()),
    (24, 9010, 'Silvina', 'Calomino', 'Desarrollo', 0, true, NOW(), NOW()),
    (25, 271, 'Emilio', 'Izarra', 'Investigador', 7, true, NOW(), NOW()),
    (26, 652, 'Sebastián', 'Juncos', 'Investigador', 0, true, NOW(), NOW()),
    (27, 734, 'Erica', 'Schlaps', 'Desarrollo', 3, true, NOW(), NOW()),
    (28, 929, 'Norma Graciela', 'Vecchi', 'Investigador', 6, true, NOW(), NOW()),
    (29, 9000, 'Silvina', 'Romano', 'Investigador', 2, true, NOW(), NOW()),
    (30, 9024, 'Agnela', 'Siles', 'Desarrollo', 7, true, NOW(), NOW()),
    (31, 9025, 'Juan', 'Borchert', 'Desarrollo', 6, true, NOW(), NOW()),
    (32, 9026, 'Nicolas', 'Sartori', 'Desarrollo', 4, true, NOW(), NOW()),
    (33, 9023, 'Nicolas', 'Acevedo', 'Desarrollo', 9, true, NOW(), NOW()),
    (34, 9030, 'Eric', 'Gassman', 'Desarrollo', 4, true, NOW(), NOW()),
    (35, 9031, 'Alejandro', 'Alvarez A.', 'Desarrollo', 8, true, NOW(), NOW()),
    (36, 9032, 'Pablo Matias', 'Jusim', 'Desarrollo', 5, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    apellido = EXCLUDED.apellido,
    carga_horaria = EXCLUDED.carga_horaria,
    updated_at = NOW();

SELECT setval('public.docentes_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM public.docentes), false);

-- =============================================================================
-- 6. INSERTAR CARGOS
-- Mapeo de categorías:
--   Doc. Inv. Prof. Asoc. → Asociado
--   Doc. Inv. Prof. Adj. → Adjunto
--   Doc. Inv. Asist. Pcipal → Jefe de Trabajos Practicos
--   Doc. Inv. Asist. 1era → Ayudante de Primera
-- =============================================================================
INSERT INTO public.cargos (id, nombre, dedicacion_id, nro_materias_asig, sum_horas_frente_aula, docente_id, created_at, updated_at)
VALUES
    -- Luis Miguel Rojas Flores (761) - Asist. Pcipal, Semiexclusiva
    (1, 'Jefe de Trabajos Practicos', 2, 3, 10, 1, NOW(), NOW()),
    -- Lucila Chiarvetto (199) - Asist. 1era, Simple
    (2, 'Ayudante de Primera', 1, 2, 8, 2, NOW(), NOW()),
    -- Antonio Luis Retamar (359) - Asist. 1era, Simple
    (3, 'Ayudante de Primera', 1, 2, 8, 3, NOW(), NOW()),
    -- Cristian Alejandro Alvarez C. (9017) - Asist. 1era, Simple
    (4, 'Ayudante de Primera', 1, 2, 8, 4, NOW(), NOW()),
    -- Samanta Dodino (9002) - Asist. 1era, Simple
    (5, 'Ayudante de Primera', 1, 1, 3, 5, NOW(), NOW()),
    -- Ivan D'Uva (9021) - Asist. Pcipal, Semiexclusiva
    (6, 'Jefe de Trabajos Practicos', 2, 2, 11, 6, NOW(), NOW()),
    -- Natalia Yudit Bravo (1059) - Prof. Adj., Semiexclusiva
    (7, 'Adjunto', 2, 2, 11, 7, NOW(), NOW()),
    -- Fabiola Horas Stevenson (9999) - Asist. Pcipal, Simple
    (8, 'Jefe de Trabajos Practicos', 1, 2, 9, 8, NOW(), NOW()),
    -- Alejandro Carhuas (9020) - Asist. Pcipal, Semiexclusiva
    (9, 'Jefe de Trabajos Practicos', 2, 2, 5, 9, NOW(), NOW()),
    -- Antonio Héctor Dell'Osa (481) - Prof. Adj., Exclusiva
    (10, 'Adjunto', 4, 1, 10, 10, NOW(), NOW()),
    -- Jorge Ezequiel Moyano (83) - Prof. Asoc., Exclusiva
    (11, 'Asociado', 4, 3, 13, 11, NOW(), NOW()),
    -- Daniel Aguil Mallea (129) - Prof. Asoc., Exclusiva
    (12, 'Asociado', 4, 3, 16, 12, NOW(), NOW()),
    -- Fernando Aras (50) - Prof. Adj., Semiexclusiva
    (13, 'Adjunto', 2, 1, 5, 13, NOW(), NOW()),
    -- Matías Gel (104) - Prof. Adj., Semiexclusiva
    (14, 'Adjunto', 2, 2, 7, 14, NOW(), NOW()),
    -- Federico Eduardo Gonzalez (406) - Prof. Adj., Semiexclusiva
    (15, 'Adjunto', 2, 2, 9, 15, NOW(), NOW()),
    -- Ariel Parson (80) - Prof. Asoc., Exclusiva
    (16, 'Asociado', 4, 3, 8, 16, NOW(), NOW()),
    -- Horacio Pendenti (89) - Prof. Asoc., Semiexclusiva
    (17, 'Asociado', 2, 3, 10, 17, NOW(), NOW()),
    -- Guillermo Prisching (125) - Prof. Adj., Semiexclusiva
    (18, 'Adjunto', 2, 2, 8, 18, NOW(), NOW()),
    -- Nadia Patricia Ramos (453) - Prof. Adj., Semiexclusiva
    (19, 'Adjunto', 2, 3, 14, 19, NOW(), NOW()),
    -- Leonel Viera (172) - Prof. Adj., Semiexclusiva
    (20, 'Adjunto', 2, 2, 10, 20, NOW(), NOW()),
    -- Martín Villarreal (124) - Prof. Adj., Semiexclusiva
    (21, 'Adjunto', 2, 3, 12, 21, NOW(), NOW()),
    -- Fernando Temari (9022) - Prof. Adj., Semiexclusiva
    (22, 'Adjunto', 2, 2, 7, 22, NOW(), NOW()),
    -- Cintia Alejandra Aguado (902) - Prof. Adj., Simple
    (23, 'Adjunto', 1, 2, 7, 23, NOW(), NOW()),
    -- Silvina Calomino (9010) - Prof. Adj., Simple
    (24, 'Adjunto', 1, 1, 0, 24, NOW(), NOW()),
    -- Emilio Izarra (271) - Prof. Adj., Simple
    (25, 'Adjunto', 1, 3, 7, 25, NOW(), NOW()),
    -- Sebastián Juncos (652) - Prof. Adj., Simple
    (26, 'Adjunto', 1, 1, 0, 26, NOW(), NOW()),
    -- Erica Schlaps (734) - Prof. Adj., Simple
    (27, 'Adjunto', 1, 1, 3, 27, NOW(), NOW()),
    -- Norma Graciela Vecchi (929) - Prof. Adj., Simple
    (28, 'Adjunto', 1, 2, 6, 28, NOW(), NOW()),
    -- Silvina Romano (9000) - Prof. Adj., Exclusiva
    (29, 'Adjunto', 4, 1, 2, 29, NOW(), NOW()),
    -- Agnela Siles (9024) - Asist. 1era, Simple
    (30, 'Ayudante de Primera', 1, 2, 7, 30, NOW(), NOW()),
    -- Juan Borchert (9025) - Asist. Pcipal, Simple
    (31, 'Jefe de Trabajos Practicos', 1, 2, 6, 31, NOW(), NOW()),
    -- Nicolas Sartori (9026) - Asist. Pcipal, Simple
    (32, 'Jefe de Trabajos Practicos', 1, 2, 4, 32, NOW(), NOW()),
    -- Nicolas Acevedo (9023) - Asist. Pcipal, Simple
    (33, 'Jefe de Trabajos Practicos', 1, 2, 9, 33, NOW(), NOW()),
    -- Eric Gassman (9030) - Asist. Pcipal, Simple
    (34, 'Jefe de Trabajos Practicos', 1, 2, 4, 34, NOW(), NOW()),
    -- Alejandro Alvarez A. (9031) - Asist. 1era, Simple
    (35, 'Ayudante de Primera', 1, 2, 8, 35, NOW(), NOW()),
    -- Pablo Matias Jusim (9032) - Asist. Pcipal, Simple
    (36, 'Jefe de Trabajos Practicos', 1, 1, 5, 36, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    dedicacion_id = EXCLUDED.dedicacion_id,
    updated_at = NOW();

SELECT setval('public.cargos_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM public.cargos), false);

-- =============================================================================
-- 7. INSERTAR COMISIONES
-- Todas las materias tienen comisión "Tarde" según el CSV
-- =============================================================================
INSERT INTO public.comisiones (id, codigo, nombre, turno, modalidad, sede, anio, horas_teoricas, horas_practicas, horas_totales, estado, id_materia, cuatrimestre, created_at, updated_at)
VALUES
    -- Año 1, Cuatrimestre 1
    (1, 'IF001-T-2025', 'Elementos de Informática - Tarde', 'Tarde', 'presencial', 'Ushuaia', 2026, 3, 4, 7, true, 1, '1ro', NOW(), NOW()),
    (2, 'IF002-T-2025', 'Expresión de Problemas y Algoritmos - Tarde', 'Tarde', 'presencial', 'Ushuaia', 2026, 3, 3, 6, true, 2, '1ro', NOW(), NOW()),
    (3, 'MA045-T-2025', 'Algebra - Tarde', 'Tarde', 'presencial', 'Ushuaia', 2026, 4, 5, 9, true, 3, '1ro', NOW(), NOW()),
    (4, 'FA007-T-2025', 'Acreditación de Idioma Inglés - Tarde', 'Tarde', 'presencial', 'Ushuaia', 2026, 0, 0, 0, true, 35, '1ro', NOW(), NOW()),
    
    -- Año 1, Cuatrimestre 2
    (5, 'IF003-T-2025', 'Algorítmica y Programación I - Tarde', 'Tarde', 'presencial', 'Ushuaia', 2026, 4, 4, 8, true, 4, '2do', NOW(), NOW()),
    (6, 'MA008-T-2025', 'Elementos de Lógica y Matemática Discreta - Tarde', 'Tarde', 'presencial', 'Ushuaia', 2026, 4, 4, 8, true, 5, '2do', NOW(), NOW()),
    (7, 'MA046-T-2025', 'Análisis Matemático - Tarde', 'Tarde', 'presencial', 'Ushuaia', 2026, 5, 6, 11, true, 6, '2do', NOW(), NOW()),
    
    -- Año 2, Cuatrimestre 1
    (8, 'IF004-T-2025', 'Sistemas y Organizaciones - Tarde', 'Tarde', 'presencial', 'Ushuaia', 2026, 3, 3, 6, true, 7, '1ro', NOW(), NOW()),
    (9, 'IF005-T-2025', 'Arquitectura de Computadoras - Tarde', 'Tarde', 'presencial', 'Ushuaia', 2026, 4, 4, 8, true, 8, '1ro', NOW(), NOW()),
    (10, 'IF006-T-2025', 'Algorítmica y Programación II - Tarde', 'Tarde', 'presencial', 'Ushuaia', 2026, 4, 4, 8, true, 9, '1ro', NOW(), NOW()),
    (11, 'MA006-T-2025', 'Estadística - Tarde', 'Tarde', 'presencial', 'Ushuaia', 2026, 3, 3, 6, true, 10, '1ro', NOW(), NOW()),
    
    -- Año 2, Cuatrimestre 2
    (12, 'IF007-T-2025', 'Bases de Datos I - Tarde', 'Tarde', 'presencial', 'Ushuaia', 2026, 4, 5, 9, true, 11, '2do', NOW(), NOW()),
    (13, 'IF030-T-2025', 'Programación y Diseño Orientado a Objetos - Tarde', 'Tarde', 'presencial', 'Ushuaia', 2026, 4, 4, 8, true, 12, '2do', NOW(), NOW()),
    (14, 'IF031-T-2025', 'Ingeniería de Software I - Tarde', 'Tarde', 'presencial', 'Ushuaia', 2026, 5, 5, 10, true, 13, '2do', NOW(), NOW()),
    
    -- Año 3, Cuatrimestre 1
    (15, 'IF009-T-2025', 'Laboratorio de Programación y Lenguajes - Tarde', 'Tarde', 'presencial', 'Ushuaia', 2026, 3, 3, 6, true, 14, '1ro', NOW(), NOW()),
    (16, 'IF013-T-2025', 'Fundamentos Teóricos de Informática - Tarde', 'Tarde', 'presencial', 'Ushuaia', 2026, 4, 4, 8, true, 15, '1ro', NOW(), NOW()),
    (17, 'IF033-T-2025', 'Ingeniería de Software II - Tarde', 'Tarde', 'presencial', 'Ushuaia', 2026, 4, 4, 8, true, 16, '1ro', NOW(), NOW()),
    (18, 'IF038-T-2025', 'Introducción a la Concurrencia - Tarde', 'Tarde', 'presencial', 'Ushuaia', 2026, 2, 2, 4, true, 17, '1ro', NOW(), NOW()),
    
    -- Año 3, Cuatrimestre 2
    (19, 'IF044-T-2025', 'Bases de Datos II - Tarde', 'Tarde', 'presencial', 'Ushuaia', 2026, 4, 4, 8, true, 18, '2do', NOW(), NOW()),
    (20, 'IF037-T-2025', 'Sistemas Operativos - Tarde', 'Tarde', 'presencial', 'Ushuaia', 2026, 4, 4, 8, true, 19, '2do', NOW(), NOW()),
    (21, 'IF055-T-2025', 'Laboratorio de Software - Tarde', 'Tarde', 'presencial', 'Ushuaia', 2026, 3, 4, 7, true, 20, '2do', NOW(), NOW()),
    (22, 'IF056-T-2025', 'Seminario de Aspectos Legales y Profesionales I - Tarde', 'Tarde', 'presencial', 'Ushuaia', 2026, 2, 2, 4, true, 21, '2do', NOW(), NOW()),
    
    -- Año 4, Cuatrimestre 1
    (23, 'IF019-T-2025', 'Redes y Transmisión de Datos - Tarde', 'Tarde', 'presencial', 'Ushuaia', 2026, 4, 5, 9, true, 22, '1ro', NOW(), NOW()),
    (24, 'IF020-T-2025', 'Paradigmas y Lenguajes de Programación - Tarde', 'Tarde', 'presencial', 'Ushuaia', 2026, 4, 4, 8, true, 23, '1ro', NOW(), NOW()),
    (25, 'IF017-T-2025', 'Taller de nuevas Tecnologías - Tarde', 'Tarde', 'presencial', 'Ushuaia', 2026, 3, 3, 6, true, 24, '1ro', NOW(), NOW()),
    
    -- Año 4, Cuatrimestre 2
    (26, 'IF022-T-2025', 'Sistemas Distribuidos - Tarde', 'Tarde', 'presencial', 'Ushuaia', 2026, 4, 4, 8, true, 25, '2do', NOW(), NOW()),
    (27, 'IF035-T-2025', 'Ingeniería de Software III - Tarde', 'Tarde', 'presencial', 'Ushuaia', 2026, 4, 4, 8, true, 26, '2do', NOW(), NOW()),
    (28, 'IF057-T-2025', 'Seminario de Aspectos Legales y Profesionales II - Tarde', 'Tarde', 'presencial', 'Ushuaia', 2026, 2, 2, 4, true, 27, '2do', NOW(), NOW()),
    (29, 'IF059-T-2025', 'Sistemas Inteligentes - Tarde', 'Tarde', 'presencial', 'Ushuaia', 2026, 3, 3, 6, true, 28, '2do', NOW(), NOW()),
    
    -- Año 5, Cuatrimestre 1
    (30, 'IF060-T-2025', 'Sistemas de Tiempo Real - Tarde', 'Tarde', 'presencial', 'Ushuaia', 2026, 4, 3, 7, true, 29, '1ro', NOW(), NOW()),
    (31, 'IF061-T-2025', 'Sistemas Paralelos - Tarde', 'Tarde', 'presencial', 'Ushuaia', 2026, 3, 3, 6, true, 30, '1ro', NOW(), NOW()),
    (32, 'IF062-T-2025', 'Bases de Datos Distribuidas - Tarde', 'Tarde', 'presencial', 'Ushuaia', 2026, 3, 3, 6, true, 31, '1ro', NOW(), NOW()),
    (33, 'IF063-T-2025', 'Seminario de Seguridad - Tarde', 'Tarde', 'presencial', 'Ushuaia', 2026, 2, 2, 4, true, 32, '1ro', NOW(), NOW()),
    (34, 'IF026-T-2025', 'Tesina - Tarde', 'Tarde', 'presencial', 'Ushuaia', 2026, 0, 0, 0, true, 36, '1ro', NOW(), NOW()),
    
    -- Año 5, Cuatrimestre 2
    (35, 'IF027-T-2025', 'Modelos y Simulación - Tarde', 'Tarde', 'presencial', 'Ushuaia', 2026, 3, 3, 6, true, 33, '2do', NOW(), NOW()),
    (36, 'IF042-T-2025', 'Proyecto de Software - Tarde', 'Tarde', 'presencial', 'Ushuaia', 2026, 4, 4, 8, true, 34, '2do', NOW(), NOW())
ON CONFLICT (codigo) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    updated_at = NOW();

SELECT setval('public.comisiones_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM public.comisiones), false);

-- =============================================================================
-- 8. INSERTAR DICTAS (Asignaciones docente-comisión)
-- Mapeo de función áulica:
--   Responsable + T → 1 (Responsable de Cátedra) + función 3 (Teórico)
--   Responsable + P → 1 (Responsable de Cátedra) + función 4 (Práctico)
--   Responsable + T+P → 1 (Responsable de Cátedra) + función 5 (Teórico-Práctico)
--   Asistente + cualquiera → 2 (Auxiliar de Cátedra)
-- =============================================================================
INSERT INTO public.dictas (id, docente_id, cargo_id, comision_id, ano_inicio, "año_fin", funcion_aulica_id, modalidad_presencia, horas_frente_aula, created_at, updated_at)
VALUES
    -- Ariel Parson (80) - IF030 (Programación OO) - Asistente P
    (1, 16, 16, 13, '2026-03-01', NULL, 2, 'presencial', 4, NOW(), NOW()),
    -- Jorge Ezequiel Moyano (83) - IF033 (Ing. Software II) - Responsable T
    (2, 11, 11, 17, '2026-03-01', NULL, 1, 'presencial', 4, NOW(), NOW()),
    -- Jorge Ezequiel Moyano (83) - IF042 (Proyecto de Software) - Responsable T
    (3, 11, 11, 36, '2026-03-01', NULL, 1, 'presencial', 4, NOW(), NOW()),
    -- Jorge Ezequiel Moyano (83) - IF031 (Ing. Software I) - Responsable T
    (4, 11, 11, 14, '2026-03-01', NULL, 1, 'presencial', 5, NOW(), NOW()),
    -- Horacio Pendenti (89) - IF035 (Ing. Software III) - Responsable T
    (5, 17, 17, 27, '2026-03-01', NULL, 1, 'presencial', 4, NOW(), NOW()),
    -- Horacio Pendenti (89) - IF038 (Intro Concurrencia) - Responsable T
    (6, 17, 17, 18, '2026-03-01', NULL, 1, 'presencial', 2, NOW(), NOW()),
    -- Horacio Pendenti (89) - IF037 (Sistemas Operativos) - Responsable T
    (7, 17, 17, 20, '2026-03-01', NULL, 1, 'presencial', 4, NOW(), NOW()),
    -- Matías Gel (104) - IF009 (Lab. Programación) - Responsable T
    (8, 14, 14, 15, '2026-03-01', NULL, 1, 'presencial', 3, NOW(), NOW()),
    -- Matías Gel (104) - IF020 (Paradigmas) - Responsable T
    (9, 14, 14, 24, '2026-03-01', NULL, 1, 'presencial', 4, NOW(), NOW()),
    -- Martín Villarreal (124) - IF013 (Fund. Teóricos) - Responsable T
    (10, 21, 21, 16, '2026-03-01', NULL, 1, 'presencial', 4, NOW(), NOW()),
    -- Martín Villarreal (124) - IF020 (Paradigmas) - Asistente P
    (11, 21, 21, 24, '2026-03-01', NULL, 2, 'presencial', 4, NOW(), NOW()),
    -- Martín Villarreal (124) - IF030 (Prog. OO) - Responsable T
    (12, 21, 21, 13, '2026-03-01', NULL, 1, 'presencial', 4, NOW(), NOW()),
    -- Guillermo Prisching (125) - IF019 (Redes) - Responsable T
    (13, 18, 18, 23, '2026-03-01', NULL, 1, 'presencial', 4, NOW(), NOW()),
    -- Guillermo Prisching (125) - IF005 (Arquitectura) - Responsable T
    (14, 18, 18, 9, '2026-03-01', NULL, 1, 'presencial', 4, NOW(), NOW()),
    -- Daniel Aguil Mallea (129) - IF022 (Sist. Distribuidos) - Responsable T+P
    (15, 12, 12, 26, '2026-03-01', NULL, 1, 'presencial', 8, NOW(), NOW()),
    -- Daniel Aguil Mallea (129) - IF003 (Algorítmica I) - Responsable T
    (16, 12, 12, 5, '2026-03-01', NULL, 1, 'presencial', 4, NOW(), NOW()),
    -- Daniel Aguil Mallea (129) - IF006 (Algorítmica II) - Responsable T
    (17, 12, 12, 10, '2026-03-01', NULL, 1, 'presencial', 4, NOW(), NOW()),
    -- Leonel Viera (172) - IF017 (Taller Nuevas Tec.) - Responsable T+P
    (18, 20, 20, 25, '2026-03-01', NULL, 1, 'presencial', 6, NOW(), NOW()),
    -- Leonel Viera (172) - IF060 (Sist. Tiempo Real) - Responsable T+P
    (19, 20, 20, 30, '2026-03-01', NULL, 1, 'presencial', 4, NOW(), NOW()),
    -- Lucila Chiarvetto (199) - IF001 (Elementos Inf.) - Asistente P
    (20, 2, 2, 1, '2026-03-01', NULL, 2, 'presencial', 4, NOW(), NOW()),
    -- Lucila Chiarvetto (199) - IF055 (Lab. Software) - Asistente P
    (21, 2, 2, 21, '2026-03-01', NULL, 2, 'presencial', 4, NOW(), NOW()),
    -- Lucila Chiarvetto (199) - IF059 (Sist. Inteligentes) - Responsable T+P
    (22, 2, 2, 29, '2026-03-01', NULL, 1, 'presencial', 6, NOW(), NOW()),
    -- Emilio Izarra (271) - IF063 (Sem. Seguridad) - Responsable T+P
    (23, 25, 25, 33, '2026-03-01', NULL, 1, 'presencial', 4, NOW(), NOW()),
    -- Antonio Luis Retamar (359) - IF003 (Algorítmica I) - Asistente P
    (24, 3, 3, 5, '2026-03-01', NULL, 2, 'presencial', 4, NOW(), NOW()),
    -- Antonio Luis Retamar (359) - IF006 (Algorítmica II) - Asistente P
    (25, 3, 3, 10, '2026-03-01', NULL, 2, 'presencial', 4, NOW(), NOW()),
    -- Federico Eduardo Gonzalez (406) - IF061 (Sist. Paralelos) - Responsable T+P
    (26, 15, 15, 31, '2026-03-01', NULL, 1, 'presencial', 6, NOW(), NOW()),
    -- Federico Eduardo Gonzalez (406) - IF055 (Lab. Software) - Responsable T
    (27, 15, 15, 21, '2026-03-01', NULL, 1, 'presencial', 3, NOW(), NOW()),
    -- Ariel Parson (80) - IF044 (Bases de Datos II) - Responsable T
    (28, 16, 16, 19, '2026-03-01', NULL, 1, 'presencial', 4, NOW(), NOW()),
    -- Nadia Patricia Ramos (453) - IF013 (Fund. Teóricos) - Asistente P
    (29, 19, 19, 16, '2026-03-01', NULL, 2, 'presencial', 4, NOW(), NOW()),
    -- Nadia Patricia Ramos (453) - IF007 (Bases Datos I) - Asistente T
    (30, 19, 19, 12, '2026-03-01', NULL, 2, 'presencial', 4, NOW(), NOW()),
    -- Erica Schlaps (734) - MA006 (Estadística) - Responsable T
    (31, 27, 27, 11, '2026-03-01', NULL, 1, 'presencial', 3, NOW(), NOW()),
    -- Luis Miguel Rojas Flores (761) - IF037 (Sist. Operativos) - Asistente P
    (32, 1, 1, 20, '2026-03-01', NULL, 2, 'presencial', 4, NOW(), NOW()),
    -- Luis Miguel Rojas Flores (761) - IF038 (Intro Concurrencia) - Asistente P
    (33, 1, 1, 18, '2026-03-01', NULL, 2, 'presencial', 2, NOW(), NOW()),
    -- Cintia Alejandra Aguado (902) - IF035 (Ing. Software III) - Asistente P
    (34, 23, 23, 27, '2026-03-01', NULL, 2, 'presencial', 4, NOW(), NOW()),
    -- Cintia Alejandra Aguado (902) - IF004 (Sist. y Org.) - Asistente P
    (35, 23, 23, 8, '2026-03-01', NULL, 2, 'presencial', 3, NOW(), NOW()),
    -- Norma Graciela Vecchi (929) - IF057 (Sem. Legales II) - Responsable T+P
    (36, 28, 28, 28, '2026-03-01', NULL, 1, 'presencial', 4, NOW(), NOW()),
    -- Silvina Romano (9000) - IF056 (Sem. Legales I) - Responsable T
    (37, 29, 29, 22, '2026-03-01', NULL, 1, 'presencial', 2, NOW(), NOW()),
    -- Norma Graciela Vecchi (929) - IF056 (Sem. Legales I) - Responsable P
    (38, 28, 28, 22, '2026-03-01', NULL, 1, 'presencial', 2, NOW(), NOW()),
    -- Silvina Calomino (9010) - FA007 (Inglés) - Responsable T+P
    (39, 24, 24, 4, '2026-03-01', NULL, 1, 'presencial', 0, NOW(), NOW()),
    -- Natalia Yudit Bravo (1059) - MA045 (Algebra) - Asistente P
    (40, 7, 7, 3, '2026-03-01', NULL, 2, 'presencial', 5, NOW(), NOW()),
    -- Natalia Yudit Bravo (1059) - MA046 (Análisis Mat.) - Asistente P
    (41, 7, 7, 7, '2026-03-01', NULL, 2, 'presencial', 6, NOW(), NOW()),
    -- Cristian Alejandro Alvarez C. (9017) - IF001 (Elementos Inf.) - Asistente P
    (42, 4, 4, 1, '2026-03-01', NULL, 2, 'presencial', 4, NOW(), NOW()),
    -- Cristian Alejandro Alvarez C. (9017) - MA008 (Lógica y Discreta) - Asistente P
    (43, 4, 4, 6, '2026-03-01', NULL, 2, 'presencial', 4, NOW(), NOW()),
    -- Nadia Patricia Ramos (453) - IF062 (BD Distribuidas) - Asistente T+P
    (44, 19, 19, 32, '2026-03-01', NULL, 2, 'presencial', 6, NOW(), NOW()),
    -- Luis Miguel Rojas Flores (761) - IF044 (BD II) - Asistente P
    (45, 1, 1, 19, '2026-03-01', NULL, 2, 'presencial', 4, NOW(), NOW()),
    -- Fernando Aras (50) - MA046 (Análisis Mat.) - Responsable T
    (46, 13, 13, 7, '2026-03-01', NULL, 1, 'presencial', 5, NOW(), NOW()),
    -- Antonio Héctor Dell'Osa (481) - MA045 (Algebra) - Responsable T
    (47, 10, 10, 3, '2026-03-01', NULL, 1, 'presencial', 4, NOW(), NOW()),
    -- Emilio Izarra (271) - IF001 (Elementos Inf.) - Responsable T
    (48, 25, 25, 1, '2026-03-01', NULL, 1, 'presencial', 3, NOW(), NOW()),
    -- Samanta Dodino (9002) - MA006 (Estadística) - Asistente P
    (49, 5, 5, 11, '2026-03-01', NULL, 2, 'presencial', 3, NOW(), NOW()),
    -- Antonio Héctor Dell'Osa (481) - IF027 (Modelos y Sim.) - Asistente T+P
    (50, 10, 10, 35, '2026-03-01', NULL, 2, 'presencial', 6, NOW(), NOW()),
    -- Fabiola Horas Stevenson (9999) - IF033 (Ing. Software II) - Asistente P
    (51, 8, 8, 17, '2026-03-01', NULL, 2, 'presencial', 4, NOW(), NOW()),
    -- Fabiola Horas Stevenson (9999) - IF007 (BD I) - Asistente P
    (52, 8, 8, 12, '2026-03-01', NULL, 2, 'presencial', 5, NOW(), NOW()),
    -- Alejandro Carhuas (9020) - MA045 (Algebra) - Asistente P
    (53, 9, 9, 3, '2026-03-01', NULL, 2, 'presencial', 5, NOW(), NOW()),
    -- Ivan D'Uva (9021) - IF031 (Ing. Software I) - Asistente P
    (54, 6, 6, 14, '2026-03-01', NULL, 2, 'presencial', 5, NOW(), NOW()),
    -- Ivan D'Uva (9021) - IF009 (Lab. Programación) - Asistente P
    (55, 6, 6, 15, '2026-03-01', NULL, 2, 'presencial', 3, NOW(), NOW()),
    -- Ivan D'Uva (9021) - IF004 (Sist. y Org.) - Asistente P
    (56, 6, 6, 8, '2026-03-01', NULL, 2, 'presencial', 3, NOW(), NOW()),
    -- Fernando Temari (9022) - IF002 (Expresión Prob.) - Responsable T
    (57, 22, 22, 2, '2026-03-01', NULL, 1, 'presencial', 3, NOW(), NOW()),
    -- Fernando Temari (9022) - MA008 (Lógica y Discreta) - Responsable T
    (58, 22, 22, 6, '2026-03-01', NULL, 1, 'presencial', 4, NOW(), NOW()),
    -- Nicolas Acevedo (9023) - IF005 (Arquitectura) - Asistente P
    (59, 33, 33, 9, '2026-03-01', NULL, 2, 'presencial', 4, NOW(), NOW()),
    -- Nicolas Acevedo (9023) - IF019 (Redes) - Asistente P
    (60, 33, 33, 23, '2026-03-01', NULL, 2, 'presencial', 5, NOW(), NOW()),
    -- Agnela Siles (9024) - IF002 (Expresión Prob.) - Asistente P
    (61, 30, 30, 2, '2026-03-01', NULL, 2, 'presencial', 3, NOW(), NOW()),
    -- Agnela Siles (9024) - MA008 (Lógica y Discreta) - Asistente P
    (62, 30, 30, 6, '2026-03-01', NULL, 2, 'presencial', 4, NOW(), NOW()),
    -- Juan Borchert (9025) - MA046 (Análisis Mat.) - Asistente P
    (63, 31, 31, 7, '2026-03-01', NULL, 2, 'presencial', 6, NOW(), NOW()),
    -- Nicolas Sartori (9026) - IF003 (Algorítmica I) - Asistente P
    (64, 32, 32, 5, '2026-03-01', NULL, 2, 'presencial', 4, NOW(), NOW()),
    -- Eric Gassman (9030) - IF002 (Expresión Prob.) - Asistente P
    (65, 34, 34, 2, '2026-03-01', NULL, 2, 'presencial', 4, NOW(), NOW()),
    -- Alejandro Alvarez A. (9031) - IF001 (Elementos Inf.) - Asistente P
    (66, 35, 35, 1, '2026-03-01', NULL, 2, 'presencial', 4, NOW(), NOW()),
    -- Alejandro Alvarez A. (9031) - IF007 (BD I) - Asistente P
    (67, 35, 35, 12, '2026-03-01', NULL, 2, 'presencial', 4, NOW(), NOW()),
    -- Pablo Matias Jusim (9032) - MA046 (Análisis Mat.) - Asistente P
    (68, 36, 36, 7, '2026-03-01', NULL, 2, 'presencial', 5, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    horas_frente_aula = EXCLUDED.horas_frente_aula,
    updated_at = NOW();

SELECT setval('public.dictas_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM public.dictas), false);

-- =============================================================================
-- 9. CREAR CARRERA Y PLAN (opcional, para completar estructura)
-- =============================================================================
INSERT INTO public.carreras (id, nombre, instituto_id, modalidad, sede, estado, created_at, updated_at)
VALUES (1, 'Licenciatura en Sistemas', 1, 'presencial', 'Ushuaia', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

SELECT setval('public.carreras_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM public.carreras), false);

INSERT INTO public.planes (id, carrera_id, anio_comienzo, anio_fin, created_at, updated_at)
VALUES (1, 1, '2025-01-01', NULL, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

SELECT setval('public.planes_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM public.planes), false);

-- Asociar todas las materias al plan
INSERT INTO public.plan_materia (plan_id, materia_id)
SELECT 1, id FROM public.materias
ON CONFLICT (plan_id, materia_id) DO NOTHING;

COMMIT;

-- =============================================================================
-- RESUMEN DE DATOS INSERTADOS:
-- - 2 Institutos (IDEI, EDI)
-- - 4 Dedicaciones
-- - 5 Funciones Áulicas
-- - 36 Materias
-- - 36 Docentes
-- - 36 Cargos
-- - 36 Comisiones
-- - 68 Asignaciones Docente-Comisión (dictas)
-- - 1 Carrera (Licenciatura en Sistemas)
-- - 1 Plan de estudios
-- =============================================================================
