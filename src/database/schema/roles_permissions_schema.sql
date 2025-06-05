
-- Deshabilitar temporalmente las verificaciones de claves foráneas para evitar errores durante la creación
SET FOREIGN_KEY_CHECKS=0;

-- Eliminar tablas si existen para una nueva creación limpia
DROP TABLE IF EXISTS Roles_Permisos;
DROP TABLE IF EXISTS Permisos;
DROP TABLE IF EXISTS Roles;
-- Nota: La tabla Usuarios se modifica más abajo, no se elimina aquí si ya existe desde DB.sql

-- Tabla Roles
CREATE TABLE IF NOT EXISTS Roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE,
    descripcion_rol TEXT NULL,
    es_rol_sistema BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla Permisos
CREATE TABLE IF NOT EXISTS Permisos (
    id_permiso INT AUTO_INCREMENT PRIMARY KEY,
    clave_permiso VARCHAR(100) NOT NULL UNIQUE,
    nombre_amigable_permiso VARCHAR(255) NOT NULL,
    descripcion_permiso TEXT NULL,
    modulo_permiso VARCHAR(50) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Unión Roles_Permisos
CREATE TABLE IF NOT EXISTS Roles_Permisos (
    id_rol_permiso INT AUTO_INCREMENT PRIMARY KEY,
    id_rol_fk INT NOT NULL,
    id_permiso_fk INT NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rol FOREIGN KEY (id_rol_fk) REFERENCES Roles(id_rol) ON DELETE CASCADE,
    CONSTRAINT fk_permiso FOREIGN KEY (id_permiso_fk) REFERENCES Permisos(id_permiso) ON DELETE CASCADE,
    UNIQUE KEY uq_rol_permiso (id_rol_fk, id_permiso_fk) -- Asegura que un permiso no se asigne múltiples veces al mismo rol
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Modificar la tabla Usuarios para usar id_rol_fk
-- ESTA ES UNA GUÍA. Si la tabla Usuarios se crea en DB.sql, esta modificación debe hacerse allí
-- o aplicar este ALTER TABLE después de que DB.sql se haya ejecutado.
-- Primero, intentamos agregar la columna si no existe.
ALTER TABLE Usuarios
    ADD COLUMN IF NOT EXISTS id_rol_fk INT NULL,
    DROP COLUMN IF EXISTS rol, -- Elimina la antigua columna 'rol' ENUM si existe
    ADD CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol_fk) REFERENCES Roles(id_rol) ON DELETE SET NULL;

-- Si prefieres modificar la creación de la tabla Usuarios (si este script la maneja):
-- DROP TABLE IF EXISTS Usuarios; -- Solo si este script es el responsable único de Usuarios
-- CREATE TABLE IF NOT EXISTS Usuarios (
--     id_usuario INT AUTO_INCREMENT PRIMARY KEY,
--     nombre_completo VARCHAR(255) NOT NULL,
--     email VARCHAR(255) NOT NULL UNIQUE,
--     password_hash VARCHAR(255) NOT NULL,
--     id_rol_fk INT NULL, -- Nueva columna para FK a Roles
--     telefono VARCHAR(20) NULL,
--     avatar_seed VARCHAR(10) NULL,
--     fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--     CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol_fk) REFERENCES Roles(id_rol) ON DELETE SET NULL
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Insertar Permisos (claves concisas, nombres amigables)
-- Módulo: General / Dashboard
INSERT INTO Permisos (clave_permiso, nombre_amigable_permiso, modulo_permiso, descripcion_permiso) VALUES
('dashboard:view', 'Ver Panel Principal', 'Dashboard', 'Permite ver la página principal del dashboard.'),
-- Módulo: Vehículos
('vehicles:view', 'Ver Vehículos', 'Vehículos', 'Permite ver la lista y detalles de vehículos.'),
('vehicles:create', 'Crear Vehículos', 'Vehículos', 'Permite agregar nuevos vehículos.'),
('vehicles:edit', 'Editar Vehículos', 'Vehículos', 'Permite modificar la información de vehículos existentes.'),
('vehicles:delete', 'Eliminar Vehículos', 'Vehículos', 'Permite eliminar vehículos.'),
('vehicles:assign_era', 'Asignar/Desasignar ERA a Vehículos', 'Vehículos', 'Permite gestionar los ERA asignados a un vehículo.'),
('vehicles:assign_inventory', 'Asignar/Desasignar Inventario a Vehículos', 'Vehículos', 'Permite gestionar el inventario asignado a un vehículo.'),
-- Módulo: Equipos ERA
('equipment:view', 'Ver Equipos ERA', 'Equipos ERA', 'Permite ver la lista y detalles de equipos ERA.'),
('equipment:create', 'Crear Equipos ERA', 'Equipos ERA', 'Permite agregar nuevos equipos ERA.'),
('equipment:edit', 'Editar Equipos ERA', 'Equipos ERA', 'Permite modificar equipos ERA existentes.'),
('equipment:delete', 'Eliminar Equipos ERA', 'Equipos ERA', 'Permite eliminar equipos ERA.'),
('equipment:assign_user', 'Asignar/Desasignar ERA a Usuarios', 'Equipos ERA', 'Permite asignar ERA a personal.'),
-- Módulo: Mantenciones
('maintenance:view', 'Ver Mantenciones', 'Mantenciones', 'Permite ver la lista y detalles de tareas de mantención.'),
('maintenance:create', 'Crear Mantenciones', 'Mantenciones', 'Permite programar nuevas tareas de mantención.'),
('maintenance:edit', 'Editar Mantenciones', 'Mantenciones', 'Permite modificar y completar tareas de mantención.'),
('maintenance:delete', 'Eliminar Mantenciones', 'Mantenciones', 'Permite eliminar tareas de mantención.'),
-- Módulo: Inventario
('inventory:view', 'Ver Inventario', 'Inventario', 'Permite ver la lista y detalles de ítems de inventario.'),
('inventory:create', 'Crear Ítems de Inventario', 'Inventario', 'Permite agregar nuevos ítems al inventario.'),
('inventory:edit', 'Editar Ítems de Inventario', 'Inventario', 'Permite modificar ítems de inventario existentes.'),
('inventory:delete', 'Eliminar Ítems de Inventario', 'Inventario', 'Permite eliminar ítems del inventario.'),
('inventory:assign_epp', 'Asignar EPP a Usuarios', 'Inventario', 'Permite asignar ítems de EPP a personal.'),
('inventory:view_history', 'Ver Historial de Movimientos de Ítem', 'Inventario', 'Permite ver el historial de un ítem.'),
-- Módulo: Tareas
('tasks:view', 'Ver Tareas', 'Tareas', 'Permite ver la lista y detalles de tareas.'),
('tasks:create', 'Crear Tareas', 'Tareas', 'Permite crear nuevas tareas.'),
('tasks:edit', 'Editar Tareas', 'Tareas', 'Permite modificar tareas existentes y cambiar su estado.'),
('tasks:delete', 'Eliminar Tareas', 'Tareas', 'Permite eliminar tareas.'),
('tasks:assign_user', 'Asignar Tareas a Usuarios', 'Tareas', 'Permite asignar tareas a personal.'),
-- Módulo: Personal
('personnel:view', 'Ver Personal', 'Personal', 'Permite ver el directorio de personal.'),
('personnel:create', 'Crear Usuarios (Personal)', 'Personal', 'Permite agregar nuevos usuarios al sistema.'),
('personnel:edit', 'Editar Usuarios (Personal)', 'Personal', 'Permite modificar la información de usuarios existentes.'),
('personnel:delete', 'Eliminar Usuarios (Personal)', 'Personal', 'Permite eliminar usuarios del sistema.'),
-- Módulo: Configuración
('settings:view', 'Ver Configuración', 'Configuración', 'Permite acceder a la página de configuración general.'),
('settings:change_password', 'Cambiar Propia Contraseña', 'Configuración', 'Permite al usuario cambiar su propia contraseña.'),
('settings:manage_users', 'Gestionar Todos los Usuarios (desde Configuración)', 'Configuración', 'Permite la gestión completa de usuarios (roles, etc.) desde la sección de configuración. Ya cubierto por personnel:create/edit/delete pero específico para el acceso desde Settings.'),
('settings:manage_roles', 'Gestionar Roles y Permisos', 'Configuración', 'Permite crear, editar y eliminar roles y asignarles permisos.'),
('settings:manage_warehouses', 'Gestionar Bodegas', 'Configuración', 'Permite crear, editar y eliminar bodegas.'),
('settings:system_backup', 'Realizar Respaldo del Sistema', 'Configuración', 'Permite generar un respaldo de la base de datos.');

-- Insertar Roles de Sistema
INSERT INTO Roles (nombre_rol, descripcion_rol, es_rol_sistema) VALUES
('Administrador', 'Acceso completo a todas las funcionalidades del sistema.', TRUE),
('Usuario Estándar', 'Acceso a funcionalidades operativas básicas y visualización.', TRUE);

-- Asignar todos los permisos al rol Administrador
INSERT INTO Roles_Permisos (id_rol_fk, id_permiso_fk)
SELECT
    (SELECT id_rol FROM Roles WHERE nombre_rol = 'Administrador'),
    id_permiso
FROM Permisos;

-- Asignar permisos básicos al rol Usuario Estándar
INSERT INTO Roles_Permisos (id_rol_fk, id_permiso_fk)
SELECT
    (SELECT id_rol FROM Roles WHERE nombre_rol = 'Usuario Estándar'),
    id_permiso
FROM Permisos
WHERE clave_permiso IN (
    'dashboard:view',
    'vehicles:view',
    'equipment:view',
    'equipment:assign_user', -- Para solicitar/desasignar su propio ERA
    'maintenance:view',
    'maintenance:edit', -- Para completar sus propias mantenciones asignadas
    'inventory:view',
    'inventory:assign_epp', -- Para ver sus EPP o solicitar
    'tasks:view',
    'tasks:edit', -- Para completar sus propias tareas asignadas
    'personnel:view', -- Ver directorio
    'settings:view', -- Ver su propia config
    'settings:change_password' -- Cambiar su propia contraseña
);

-- Habilitar las verificaciones de claves foráneas nuevamente
SET FOREIGN_KEY_CHECKS=1;

SELECT 'Script de roles y permisos ejecutado.' AS Estado;

SELECT * FROM Permisos ORDER BY modulo_permiso, nombre_amigable_permiso;
SELECT r.nombre_rol, p.nombre_amigable_permiso, p.modulo_permiso
FROM Roles r
JOIN Roles_Permisos rp ON r.id_rol = rp.id_rol_fk
JOIN Permisos p ON rp.id_permiso_fk = p.id_permiso
ORDER BY r.nombre_rol, p.modulo_permiso, p.nombre_amigable_permiso;

-- Verificar la nueva columna en Usuarios y si el rol antiguo fue eliminado
-- DESCRIBE Usuarios;
-- SELECT id_usuario, nombre_completo, email, id_rol_fk FROM Usuarios LIMIT 5;
    