
-- Base de Datos para Brigade Manager
-- Schema SQL

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET foreign_key_checks = 0; -- Desactivar temporalmente para evitar problemas de orden de creación
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

--
-- Tabla: Roles
--
DROP TABLE IF EXISTS `Roles`;
CREATE TABLE `Roles` (
  `id_rol` INT NOT NULL AUTO_INCREMENT,
  `nombre_rol` VARCHAR(100) NOT NULL,
  `descripcion_rol` TEXT NULL,
  `es_rol_sistema` BOOLEAN NOT NULL DEFAULT FALSE, -- True si es un rol esencial del sistema (ej. Admin, Usuario)
  `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `nombre_rol_unique` (`nombre_rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar roles base
INSERT INTO `Roles` (`nombre_rol`, `descripcion_rol`, `es_rol_sistema`) VALUES
('Administrador', 'Rol con acceso total al sistema.', TRUE),
('Usuario', 'Rol estándar con acceso limitado a funcionalidades específicas.', TRUE);

--
-- Tabla: Permisos
--
DROP TABLE IF EXISTS `Permisos`;
CREATE TABLE `Permisos` (
  `id_permiso` INT NOT NULL AUTO_INCREMENT,
  `clave_permiso` VARCHAR(100) NOT NULL, -- Ej: "vehiculos:crear", "usuarios:ver"
  `nombre_amigable_permiso` VARCHAR(255) NOT NULL,
  `descripcion_permiso` TEXT NULL,
  `modulo_permiso` VARCHAR(100) NOT NULL, -- Ej: "Vehiculos", "Usuarios", "Inventario"
  `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_permiso`),
  UNIQUE KEY `clave_permiso_unique` (`clave_permiso`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar permisos base (Ejemplos, expandir según sea necesario)
INSERT INTO `Permisos` (`clave_permiso`, `nombre_amigable_permiso`, `descripcion_permiso`, `modulo_permiso`) VALUES
('dashboard:ver', 'Ver Panel Principal', 'Permite el acceso y visualización del panel principal.', 'Dashboard'),
('vehiculos:listar', 'Listar Vehículos', 'Permite ver la lista de vehículos.', 'Vehiculos'),
('vehiculos:ver', 'Ver Detalles de Vehículo', 'Permite ver los detalles de un vehículo específico.', 'Vehiculos'),
('vehiculos:crear', 'Crear Vehículo', 'Permite agregar nuevos vehículos al sistema.', 'Vehiculos'),
('vehiculos:editar', 'Editar Vehículo', 'Permite modificar la información de vehículos existentes.', 'Vehiculos'),
('vehiculos:eliminar', 'Eliminar Vehículo', 'Permite eliminar vehículos del sistema.', 'Vehiculos'),
('equipos:listar', 'Listar Equipos (ERA)', 'Permite ver la lista de equipos ERA.', 'Equipos'),
('equipos:crear', 'Crear Equipo (ERA)', 'Permite agregar nuevos equipos ERA.', 'Equipos'),
('equipos:editar', 'Editar Equipo (ERA)', 'Permite modificar equipos ERA.', 'Equipos'),
('equipos:eliminar', 'Eliminar Equipo (ERA)', 'Permite eliminar equipos ERA.', 'Equipos'),
('equipos:asignar', 'Asignar Equipo (ERA)', 'Permite asignar y desasignar equipos ERA a usuarios o vehículos.', 'Equipos'),
('mantenciones:listar', 'Listar Mantenciones', 'Permite ver la lista de tareas de mantención.', 'Mantenciones'),
('mantenciones:crear', 'Crear Mantención', 'Permite programar nuevas tareas de mantención.', 'Mantenciones'),
('mantenciones:editar', 'Editar Mantención', 'Permite modificar y completar tareas de mantención.', 'Mantenciones'),
('mantenciones:eliminar', 'Eliminar Mantención', 'Permite eliminar tareas de mantención.', 'Mantenciones'),
('inventario:listar', 'Listar Inventario', 'Permite ver el inventario general.', 'Inventario'),
('inventario:crear', 'Crear Ítem de Inventario', 'Permite agregar nuevos ítems al inventario.', 'Inventario'),
('inventario:editar', 'Editar Ítem de Inventario', 'Permite modificar ítems del inventario.', 'Inventario'),
('inventario:eliminar', 'Eliminar Ítem de Inventario', 'Permite eliminar ítems del inventario.', 'Inventario'),
('inventario:asignar_epp', 'Asignar EPP', 'Permite asignar Equipos de Protección Personal a usuarios.', 'Inventario'),
('inventario:ver_historial', 'Ver Historial de Movimientos', 'Permite ver el historial de movimientos de un ítem.', 'Inventario'),
('tareas:listar', 'Listar Tareas', 'Permite ver la lista de tareas.', 'Tareas'),
('tareas:crear', 'Crear Tarea', 'Permite crear nuevas tareas.', 'Tareas'),
('tareas:editar', 'Editar Tarea', 'Permite modificar tareas existentes.', 'Tareas'),
('tareas:eliminar', 'Eliminar Tarea', 'Permite eliminar tareas.', 'Tareas'),
('personal:listar', 'Listar Personal', 'Permite ver el directorio de personal.', 'Personal'),
('personal:crear', 'Crear Usuario', 'Permite agregar nuevos usuarios/personal.', 'Personal'),
('personal:editar', 'Editar Usuario', 'Permite modificar datos de usuarios/personal.', 'Personal'),
('personal:eliminar', 'Eliminar Usuario', 'Permite eliminar usuarios/personal.', 'Personal'),
('configuracion:ver', 'Ver Configuración', 'Permite acceder a la página de configuración.', 'Configuracion'),
('configuracion:cambiar_password_propia', 'Cambiar Contraseña Propia', 'Permite al usuario cambiar su propia contraseña.', 'Configuracion'),
('configuracion:admin:gestionar_usuarios', 'Gestionar Todos los Usuarios (Admin)', 'Permite administrar todos los usuarios (parte de Personal).', 'Configuracion Admin'),
('configuracion:admin:gestionar_roles', 'Gestionar Roles y Permisos (Admin)', 'Permite administrar roles y sus permisos.', 'Configuracion Admin'),
('configuracion:admin:gestionar_bodegas', 'Gestionar Bodegas (Admin)', 'Permite administrar bodegas de inventario.', 'Configuracion Admin'),
('configuracion:admin:respaldo_sistema', 'Realizar Respaldo del Sistema (Admin)', 'Permite iniciar un respaldo de datos del sistema.', 'Configuracion Admin'),
('tracking:ver', 'Ver Seguimiento GPS', 'Permite ver la página de seguimiento de vehículos.', 'Tracking');


--
-- Tabla: Usuarios
--
DROP TABLE IF EXISTS `Usuarios`;
CREATE TABLE `Usuarios` (
  `id_usuario` INT NOT NULL AUTO_INCREMENT,
  `nombre_completo` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `id_rol_fk` INT NULL, -- Permitir NULL por si se desasigna un rol temporalmente
  `telefono` VARCHAR(20) NULL,
  `avatar_seed` VARCHAR(10) NULL,
  `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `email_unique` (`email`),
  FOREIGN KEY (`id_rol_fk`) REFERENCES `Roles`(`id_rol`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Tabla: Roles_Permisos (Junction Table)
--
DROP TABLE IF EXISTS `Roles_Permisos`;
CREATE TABLE `Roles_Permisos` (
  `id_rol_permiso` INT NOT NULL AUTO_INCREMENT,
  `id_rol_fk` INT NOT NULL,
  `id_permiso_fk` INT NOT NULL,
  `fecha_asignacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_rol_permiso`),
  UNIQUE KEY `rol_permiso_unique` (`id_rol_fk`, `id_permiso_fk`),
  FOREIGN KEY (`id_rol_fk`) REFERENCES `Roles`(`id_rol`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`id_permiso_fk`) REFERENCES `Permisos`(`id_permiso`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Asignar todos los permisos al rol Administrador
INSERT INTO `Roles_Permisos` (`id_rol_fk`, `id_permiso_fk`)
SELECT (SELECT id_rol FROM Roles WHERE nombre_rol = 'Administrador'), id_permiso FROM Permisos;

-- Asignar permisos básicos al rol Usuario
INSERT INTO `Roles_Permisos` (`id_rol_fk`, `id_permiso_fk`)
SELECT (SELECT id_rol FROM Roles WHERE nombre_rol = 'Usuario'), id_permiso FROM Permisos
WHERE clave_permiso IN (
  'dashboard:ver',
  'vehiculos:listar', 'vehiculos:ver',
  'equipos:listar',
  'mantenciones:listar',
  'inventario:listar', 'inventario:ver_historial',
  'tareas:listar',
  'personal:listar',
  'configuracion:ver', 'configuracion:cambiar_password_propia',
  'tracking:ver'
);


--
-- Tabla: Bodegas
--
DROP TABLE IF EXISTS `Bodegas`;
CREATE TABLE `Bodegas` (
  `id_bodega` INT NOT NULL AUTO_INCREMENT,
  `nombre_bodega` VARCHAR(255) NOT NULL,
  `direccion_bodega` VARCHAR(255) NOT NULL,
  `descripcion_bodega` TEXT NULL,
  `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_bodega`),
  UNIQUE KEY `nombre_bodega_unique` (`nombre_bodega`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tabla: Inventario_Items
--
DROP TABLE IF EXISTS `Inventario_Items`;
CREATE TABLE `Inventario_Items` (
  `id_item` INT NOT NULL AUTO_INCREMENT,
  `codigo_item` VARCHAR(50) NOT NULL,
  `nombre_item` VARCHAR(255) NOT NULL,
  `descripcion_item` TEXT NULL,
  `categoria_item` VARCHAR(100) NOT NULL,
  `id_bodega` INT NULL, -- FK a Bodegas
  `sub_ubicacion` VARCHAR(255) NULL, -- Detalle dentro de la bodega
  `cantidad_actual` INT NOT NULL DEFAULT 0,
  `unidad_medida` VARCHAR(50) NOT NULL DEFAULT 'unidad',
  `stock_minimo` INT NULL,
  `es_epp` BOOLEAN NOT NULL DEFAULT FALSE,
  `fecha_vencimiento_item` DATE NULL,
  `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_item`),
  UNIQUE KEY `codigo_item_unique` (`codigo_item`),
  FOREIGN KEY (`id_bodega`) REFERENCES `Bodegas`(`id_bodega`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tabla: EPP_Asignaciones_Actuales
--
DROP TABLE IF EXISTS `EPP_Asignaciones_Actuales`;
CREATE TABLE `EPP_Asignaciones_Actuales` (
  `id_asignacion_epp` INT NOT NULL AUTO_INCREMENT,
  `id_usuario` INT NOT NULL,
  `id_item_epp` INT NOT NULL,
  `fecha_asignacion` DATE NOT NULL,
  `cantidad_asignada` INT NOT NULL,
  `estado_asignacion` ENUM('Asignado', 'Devuelto Parcialmente', 'Devuelto Totalmente', 'Perdido', 'Dañado') NOT NULL DEFAULT 'Asignado',
  `notas` TEXT NULL,
  `id_usuario_responsable` INT NULL, -- Quien realizó la asignación
  `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_asignacion_epp`),
  FOREIGN KEY (`id_usuario`) REFERENCES `Usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`id_item_epp`) REFERENCES `Inventario_Items`(`id_item`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`id_usuario_responsable`) REFERENCES `Usuarios`(`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  UNIQUE KEY `usuario_item_epp_asignado_unique` (`id_usuario`, `id_item_epp`, `estado_asignacion`) -- Para asegurar una sola asignación activa de un EPP a un usuario
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tabla: Inventario_Movimientos
--
DROP TABLE IF EXISTS `Inventario_Movimientos`;
CREATE TABLE `Inventario_Movimientos` (
  `id_movimiento` INT NOT NULL AUTO_INCREMENT,
  `id_item` INT NOT NULL,
  `tipo_movimiento` VARCHAR(50) NOT NULL, -- ENTRADA_COMPRA, SALIDA_USO, AJUSTE_POSITIVO, AJUSTE_NEGATIVO, ASIGNACION_EPP, DEVOLUCION_EPP, ASIGNACION_VEHICULO, DESASIGNACION_VEHICULO
  `cantidad_movimiento` INT NOT NULL, -- Positivo para entradas, negativo para salidas
  `cantidad_movida` INT NOT NULL, -- Valor absoluto de cantidad_movimiento
  `fecha_movimiento` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `id_usuario_responsable` INT NULL,
  `id_asignacion_epp` INT NULL,
  `id_vehiculo_asociado` INT NULL, -- Para asociar movimientos a vehículos
  `notas_movimiento` TEXT NULL,
  PRIMARY KEY (`id_movimiento`),
  FOREIGN KEY (`id_item`) REFERENCES `Inventario_Items`(`id_item`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`id_usuario_responsable`) REFERENCES `Usuarios`(`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`id_asignacion_epp`) REFERENCES `EPP_Asignaciones_Actuales`(`id_asignacion_epp`) ON DELETE SET NULL ON UPDATE CASCADE
  -- No añadir FK para id_vehiculo_asociado aquí para evitar dependencia circular directa, gestionar por aplicación.
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Tabla: Vehiculos
--
DROP TABLE IF EXISTS `Vehiculos`;
CREATE TABLE `Vehiculos` (
  `id_vehiculo` INT NOT NULL AUTO_INCREMENT,
  `identificador_interno` VARCHAR(50) NULL,
  `marca` VARCHAR(100) NOT NULL,
  `modelo` VARCHAR(100) NOT NULL,
  `patente` VARCHAR(20) NULL,
  `tipo_vehiculo` ENUM('Bomba', 'Escala', 'Rescate', 'Ambulancia', 'HazMat', 'Forestal', 'Utilitario', 'Transporte Personal', 'Otro') NULL,
  `estado_vehiculo` ENUM('Operativo', 'En Mantención', 'Fuera de Servicio') NOT NULL DEFAULT 'Operativo',
  `ano_fabricacion` INT NULL,
  `fecha_adquisicion` DATE NULL,
  `proxima_mantencion_programada` DATE NULL,
  `vencimiento_documentacion` DATE NULL,
  `url_imagen` VARCHAR(255) NULL,
  `ai_hint_imagen` VARCHAR(100) NULL,
  `notas` TEXT NULL,
  `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_vehiculo`),
  UNIQUE KEY `identificador_interno_unique` (`identificador_interno`),
  UNIQUE KEY `patente_unique` (`patente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tabla: ERA_Equipos
--
DROP TABLE IF EXISTS `ERA_Equipos`;
CREATE TABLE `ERA_Equipos` (
  `id_era` INT NOT NULL AUTO_INCREMENT,
  `codigo_era` VARCHAR(50) NOT NULL,
  `descripcion` TEXT NULL,
  `marca` VARCHAR(100) NULL,
  `modelo` VARCHAR(100) NULL,
  `numero_serie` VARCHAR(100) NULL,
  `fecha_fabricacion` DATE NULL,
  `fecha_adquisicion` DATE NULL,
  `fecha_ultima_mantencion` DATE NULL,
  `fecha_proxima_inspeccion` DATE NULL,
  `estado_era` ENUM('Disponible', 'Operativo', 'En Mantención', 'Requiere Inspección', 'Fuera de Servicio') NOT NULL DEFAULT 'Disponible',
  `id_usuario_asignado` INT NULL,
  `id_vehiculo_asignado` INT NULL, -- Para asignar ERA a un vehículo específico
  `notas` TEXT NULL,
  `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_era`),
  UNIQUE KEY `codigo_era_unique` (`codigo_era`),
  FOREIGN KEY (`id_usuario_asignado`) REFERENCES `Usuarios`(`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`id_vehiculo_asignado`) REFERENCES `Vehiculos`(`id_vehiculo`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tabla: Mantenciones
--
DROP TABLE IF EXISTS `Mantenciones`;
CREATE TABLE `Mantenciones` (
  `id_mantencion` INT NOT NULL AUTO_INCREMENT,
  `nombre_item_mantenimiento` VARCHAR(255) NOT NULL, -- Puede ser ID de ERA, ID de Vehículo, o nombre de otro equipo
  `tipo_item` ENUM('ERA', 'Extintor', 'Vehículo', 'Monitor Médico', 'Equipo Diverso', 'Infraestructura', 'Otro') NOT NULL,
  `descripcion_mantencion` TEXT NULL,
  `fecha_programada` DATE NULL,
  `id_usuario_responsable` INT NULL,
  `estado_mantencion` ENUM('Programada', 'Pendiente', 'En Progreso', 'Completada', 'Cancelada', 'Atrasada') NOT NULL,
  `fecha_ultima_realizada` DATE NULL,
  `fecha_completada` DATE NULL,
  `notas_mantencion` TEXT NULL,
  `id_usuario_creador` INT NOT NULL,
  `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_mantencion`),
  FOREIGN KEY (`id_usuario_responsable`) REFERENCES `Usuarios`(`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`id_usuario_creador`) REFERENCES `Usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tabla: Tareas
--
DROP TABLE IF EXISTS `Tareas`;
CREATE TABLE `Tareas` (
  `id_tarea` INT NOT NULL AUTO_INCREMENT,
  `descripcion_tarea` TEXT NOT NULL,
  `id_usuario_asignado` INT NULL,
  `fecha_vencimiento` DATE NULL,
  `estado_tarea` ENUM('Pendiente', 'En Proceso', 'Completada', 'Atrasada', 'Programada') NOT NULL,
  `id_usuario_creador` INT NOT NULL,
  `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_tarea`),
  FOREIGN KEY (`id_usuario_asignado`) REFERENCES `Usuarios`(`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`id_usuario_creador`) REFERENCES `Usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Tabla de Unión: Vehiculos_ERA (Muchos-a-Muchos entre Vehiculos y ERA_Equipos)
--
DROP TABLE IF EXISTS `Vehiculos_ERA`;
CREATE TABLE `Vehiculos_ERA` (
  `id_vehiculo_era` INT NOT NULL AUTO_INCREMENT,
  `id_vehiculo_fk` INT NOT NULL,
  `id_era_fk` INT NOT NULL,
  `fecha_asignacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_vehiculo_era`),
  UNIQUE KEY `vehiculo_era_unique` (`id_vehiculo_fk`, `id_era_fk`),
  FOREIGN KEY (`id_vehiculo_fk`) REFERENCES `Vehiculos`(`id_vehiculo`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`id_era_fk`) REFERENCES `ERA_Equipos`(`id_era`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tabla de Unión: Vehiculos_Inventario_Items (Muchos-a-Muchos entre Vehiculos e Inventario_Items)
--
DROP TABLE IF EXISTS `Vehiculos_Inventario_Items`;
CREATE TABLE `Vehiculos_Inventario_Items` (
  `id_vehiculo_inventario_item` INT NOT NULL AUTO_INCREMENT,
  `id_vehiculo_fk` INT NOT NULL,
  `id_item_fk` INT NOT NULL,
  `cantidad_asignada` INT NOT NULL DEFAULT 1,
  `fecha_asignacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_vehiculo_inventario_item`),
  UNIQUE KEY `vehiculo_item_inventario_unique` (`id_vehiculo_fk`, `id_item_fk`),
  FOREIGN KEY (`id_vehiculo_fk`) REFERENCES `Vehiculos`(`id_vehiculo`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`id_item_fk`) REFERENCES `Inventario_Items`(`id_item`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reactivar la revisión de claves foráneas
SET foreign_key_checks = 1;

-- Agregar un trigger para actualizar el estado de ERA_Equipos cuando se asigna/desasigna a un vehículo
-- o a un usuario. Y viceversa.
-- Esto es más complejo y depende de la lógica de negocio exacta.
-- Por ejemplo, si un ERA se asigna a un vehículo, su `id_usuario_asignado` debería ser NULL
-- y su `estado_era` podría cambiar a 'Operativo en Vehículo' (si tuviéramos ese estado).
-- Si se desasigna, su `estado_era` podría volver a 'Disponible'.

-- Ejemplo conceptual de trigger (requiere ajustar lógica):
/*
DELIMITER //
CREATE TRIGGER after_vehiculos_era_insert
AFTER INSERT ON Vehiculos_ERA
FOR EACH ROW
BEGIN
    UPDATE ERA_Equipos
    SET estado_era = 'Operativo', id_vehiculo_asignado = NEW.id_vehiculo_fk, id_usuario_asignado = NULL
    WHERE id_era = NEW.id_era_fk;
END;
//
DELIMITER ;

DELIMITER //
CREATE TRIGGER after_vehiculos_era_delete
AFTER DELETE ON Vehiculos_ERA
FOR EACH ROW
BEGIN
    UPDATE ERA_Equipos
    SET estado_era = 'Disponible', id_vehiculo_asignado = NULL
    WHERE id_era = OLD.id_era_fk;
END;
//
DELIMITER ;
*/

-- Actualización de `Inventario_Movimientos` para incluir `id_vehiculo_asociado`
-- Si la tabla ya existe sin esta columna, usar ALTER TABLE:
-- ALTER TABLE `Inventario_Movimientos` ADD COLUMN `id_vehiculo_asociado` INT NULL AFTER `id_asignacion_epp`;
-- ALTER TABLE `Inventario_Movimientos` ADD CONSTRAINT `fk_movimiento_vehiculo` FOREIGN KEY (`id_vehiculo_asociado`) REFERENCES `Vehiculos`(`id_vehiculo`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Verificar que la columna `id_rol_fk` en `Usuarios` exista. Si no:
-- ALTER TABLE `Usuarios` ADD COLUMN `id_rol_fk` INT NULL AFTER `password_hash`;
-- ALTER TABLE `Usuarios` ADD CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`id_rol_fk`) REFERENCES `Roles`(`id_rol`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Verificar que la columna `id_bodega` en `Inventario_Items` exista. Si no:
-- ALTER TABLE `Inventario_Items` ADD COLUMN `id_bodega` INT NULL AFTER `categoria_item`;
-- ALTER TABLE `Inventario_Items` ADD CONSTRAINT `fk_item_bodega` FOREIGN KEY (`id_bodega`) REFERENCES `Bodegas`(`id_bodega`) ON DELETE SET NULL ON UPDATE CASCADE;
-- ALTER TABLE `Inventario_Items` ADD COLUMN `sub_ubicacion` VARCHAR(255) NULL AFTER `id_bodega`;

-- Verificar la columna `id_asignacion_epp` en `Inventario_Movimientos`
-- ALTER TABLE Inventario_Movimientos ADD COLUMN id_asignacion_epp INT NULL AFTER id_usuario_responsable;
-- ALTER TABLE Inventario_Movimientos ADD CONSTRAINT fk_mov_asig_epp FOREIGN KEY (id_asignacion_epp) REFERENCES EPP_Asignaciones_Actuales(id_asignacion_epp) ON DELETE SET NULL;


-- Notas finales:
-- 1. Los tipos ENUM se han utilizado directamente para MySQL. Si se usa otra BD, podrían necesitar
--    ser reemplazados por VARCHAR con CHECK constraints.
-- 2. Las acciones ON DELETE y ON UPDATE para las claves foráneas se han establecido
--    generalmente a SET NULL para FKs opcionales o RESTRICT/CASCADE donde sea más apropiado.
--    Ajusta según las necesidades específicas de integridad de datos.
-- 3. Se han añadido datos iniciales para Roles y Permisos, incluyendo la asignación
--    de todos los permisos al rol de Administrador y un conjunto básico al rol de Usuario.
--    Esto facilita el inicio rápido.
-- 4. Las tablas de unión Vehiculos_ERA y Vehiculos_Inventario_Items se han añadido para
--    manejar las relaciones muchos-a-muchos. La lógica de la aplicación deberá
--    actualizar estas tablas cuando se asignen/desasignen ítems a los vehículos.

