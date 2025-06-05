
-- Asegurar que estamos usando UTF-8
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Tabla de Roles
DROP TABLE IF EXISTS `Roles_Permisos`;
DROP TABLE IF EXISTS `Permisos`;
DROP TABLE IF EXISTS `Roles`;

CREATE TABLE `Roles` (
  `id_rol` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre_rol` VARCHAR(100) NOT NULL UNIQUE,
  `descripcion_rol` TEXT NULL,
  `es_rol_sistema` BOOLEAN NOT NULL DEFAULT FALSE,
  `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Permisos
CREATE TABLE `Permisos` (
  `id_permiso` INT AUTO_INCREMENT PRIMARY KEY,
  `clave_permiso` VARCHAR(100) NOT NULL UNIQUE,
  `nombre_amigable_permiso` VARCHAR(255) NOT NULL,
  `descripcion_permiso` TEXT NULL,
  `modulo_permiso` VARCHAR(100) NULL,
  `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Unión Roles_Permisos
CREATE TABLE `Roles_Permisos` (
  `id_rol_permiso` INT AUTO_INCREMENT PRIMARY KEY,
  `id_rol_fk` INT NOT NULL,
  `id_permiso_fk` INT NOT NULL,
  `fecha_asignacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_rol_fk`) REFERENCES `Roles` (`id_rol`) ON DELETE CASCADE,
  FOREIGN KEY (`id_permiso_fk`) REFERENCES `Permisos` (`id_permiso`) ON DELETE CASCADE,
  UNIQUE KEY `rol_permiso_unico` (`id_rol_fk`, `id_permiso_fk`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserción de Permisos Predefinidos
INSERT INTO `Permisos` (`clave_permiso`, `nombre_amigable_permiso`, `descripcion_permiso`, `modulo_permiso`) VALUES
('dashboard:view', 'Ver Panel Principal', 'Permite ver el panel principal con estadísticas y actividad reciente.', 'Dashboard'),

('vehicles:view', 'Ver Vehículos', 'Permite ver la lista y detalles de vehículos.', 'Vehículos'),
('vehicles:create', 'Crear Vehículos', 'Permite agregar nuevos vehículos al sistema.', 'Vehículos'),
('vehicles:edit', 'Editar Vehículos', 'Permite modificar la información de vehículos existentes.', 'Vehículos'),
('vehicles:delete', 'Eliminar Vehículos', 'Permite eliminar vehículos del sistema.', 'Vehículos'),
('vehicles:assign_equipment', 'Asignar Equipamiento a Vehículos', 'Permite asignar/desasignar ERA e Inventario a vehículos.', 'Vehículos'),

('equipment_era:view', 'Ver Equipos ERA', 'Permite ver la lista y detalles de equipos ERA.', 'Equipos ERA'),
('equipment_era:create', 'Crear Equipos ERA', 'Permite agregar nuevos equipos ERA.', 'Equipos ERA'),
('equipment_era:edit', 'Editar Equipos ERA', 'Permite modificar la información de equipos ERA.', 'Equipos ERA'),
('equipment_era:delete', 'Eliminar Equipos ERA', 'Permite eliminar equipos ERA.', 'Equipos ERA'),
('equipment_era:assign', 'Asignar Equipos ERA a Personal', 'Permite asignar/desasignar equipos ERA a usuarios.', 'Equipos ERA'),

('maintenance:view', 'Ver Mantenciones', 'Permite ver la lista y detalles de tareas de mantención.', 'Mantenciones'),
('maintenance:create', 'Crear Mantenciones', 'Permite programar nuevas tareas de mantención.', 'Mantenciones'),
('maintenance:edit', 'Editar Mantenciones', 'Permite modificar tareas de mantención existentes.', 'Mantenciones'),
('maintenance:delete', 'Eliminar Mantenciones', 'Permite eliminar tareas de mantención.', 'Mantenciones'),
('maintenance:update_status', 'Actualizar Estado de Mantenciones', 'Permite cambiar el estado de las mantenciones (ej. Completada).', 'Mantenciones'),

('inventory:view', 'Ver Inventario', 'Permite ver la lista y detalles de ítems de inventario.', 'Inventario'),
('inventory:create', 'Crear Ítems de Inventario', 'Permite agregar nuevos ítems al inventario.', 'Inventario'),
('inventory:edit', 'Editar Ítems de Inventario', 'Permite modificar ítems de inventario.', 'Inventario'),
('inventory:delete', 'Eliminar Ítems de Inventario', 'Permite eliminar ítems de inventario.', 'Inventario'),
('inventory_epp:assign', 'Asignar EPP a Personal', 'Permite asignar ítems de EPP a usuarios.', 'Inventario'),
('inventory:view_movements', 'Ver Historial de Movimientos de Inventario', 'Permite ver el historial de entradas/salidas de un ítem.', 'Inventario'),

('tasks:view', 'Ver Tareas', 'Permite ver la lista y detalles de tareas generales.', 'Tareas'),
('tasks:create', 'Crear Tareas', 'Permite crear nuevas tareas generales.', 'Tareas'),
('tasks:edit', 'Editar Tareas', 'Permite modificar tareas generales existentes.', 'Tareas'),
('tasks:delete', 'Eliminar Tareas', 'Permite eliminar tareas generales.', 'Tareas'),
('tasks:assign', 'Asignar Tareas a Personal', 'Permite asignar/desasignar tareas a usuarios.', 'Tareas'),
('tasks:update_status', 'Actualizar Estado de Tareas', 'Permite cambiar el estado de las tareas (ej. Completada).', 'Tareas'),

('personnel:view', 'Ver Personal', 'Permite ver el directorio de personal y sus detalles.', 'Personal'),
('personnel:create', 'Crear Personal', 'Permite agregar nuevos usuarios al sistema.', 'Personal'),
('personnel:edit', 'Editar Personal', 'Permite modificar la información de usuarios existentes.', 'Personal'),
('personnel:delete', 'Eliminar Personal', 'Permite eliminar usuarios del sistema.', 'Personal'),

('settings:manage_system', 'Gestionar Configuración General del Sistema', 'Permite acceder y modificar configuraciones globales del sistema.', 'Configuración'),
('settings:manage_roles_permissions', 'Gestionar Roles y Permisos', 'Permite crear, editar y eliminar roles, y asignarles permisos.', 'Configuración'),
('settings:manage_warehouses', 'Gestionar Bodegas', 'Permite crear, editar y eliminar bodegas.', 'Configuración'),
('profile:manage_own', 'Gestionar Perfil Propio', 'Permite al usuario modificar su propia información de perfil (ej. contraseña).', 'Perfil');

-- Inserción de Roles del Sistema
INSERT INTO `Roles` (`nombre_rol`, `descripcion_rol`, `es_rol_sistema`) VALUES
('Administrador', 'Acceso completo a todas las funcionalidades del sistema.', TRUE),
('Usuario Estándar', 'Acceso a funcionalidades operativas básicas.', TRUE);

-- Asignación de Permisos al Rol Administrador (todos los permisos)
INSERT INTO `Roles_Permisos` (`id_rol_fk`, `id_permiso_fk`)
SELECT
  (SELECT id_rol FROM `Roles` WHERE nombre_rol = 'Administrador'),
  p.id_permiso
FROM `Permisos` p;

-- Asignación de Permisos al Rol Usuario Estándar
INSERT INTO `Roles_Permisos` (`id_rol_fk`, `id_permiso_fk`)
SELECT
  (SELECT id_rol FROM `Roles` WHERE nombre_rol = 'Usuario Estándar'),
  p.id_permiso
FROM `Permisos` p
WHERE p.clave_permiso IN (
  'dashboard:view',
  'vehicles:view',
  'equipment_era:view',
  -- 'equipment_era:request_assignment', -- Necesitaría un permiso específico para "solicitar"
  'maintenance:view',
  'maintenance:update_status', -- Asumiendo que solo puede actualizar las suyas, la lógica de app debe reforzar esto
  'inventory:view',
  -- 'inventory:request_items', -- Necesitaría un permiso específico para "solicitar"
  'tasks:view', -- Vería principalmente las suyas o todas según defina la app
  'tasks:update_status', -- Asumiendo que solo puede actualizar las suyas
  'personnel:view',
  'profile:manage_own'
);

-- Aquí podrías añadir más permisos específicos para Usuario Estándar si los tienes definidos.
-- Por ejemplo, si "Editar información básica de vehículos (Ej: notas)" es un permiso:
-- ('vehicles:edit_notes') -> Si lo creas en la tabla Permisos.

-- Si el permiso "request_equipment" y "request_inventory" se crean en la tabla Permisos,
-- se podrían añadir aquí también para el rol Usuario Estándar.

-- Si "complete_maintenance_assigned" y "complete_tasks_assigned" se refieren a la acción de actualizar el estado
-- de una tarea/mantención que tienen asignada, el permiso 'maintenance:update_status' y 'tasks:update_status'
-- podría cubrirlo, pero la aplicación necesitaría lógica adicional para verificar que el usuario
-- solo actualiza las que le corresponden. Alternativamente, se podrían crear permisos más específicos
-- como 'maintenance:update_own_assigned_status'.

SELECT 'Esquema de roles y permisos creado y datos iniciales insertados exitosamente.' AS `status`;
    