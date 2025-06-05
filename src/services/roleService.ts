
'use server';

import { query, getPool } from '@/lib/db';
import type { ResultSetHeader, RowDataPacket, PoolConnection } from 'mysql2/promise';

export interface Permission {
  id_permiso: number;
  clave_permiso: string;
  nombre_amigable_permiso: string;
  descripcion_permiso?: string | null;
  modulo_permiso: string;
  fecha_creacion: string;
}

export interface Role {
  id_rol: number;
  nombre_rol: string;
  descripcion_rol?: string | null;
  es_rol_sistema: boolean; // 0 o 1 desde la BD
  fecha_creacion: string;
  fecha_actualizacion: string;
  // Campos adicionales que podríamos querer unir:
  permission_count?: number;
  user_count?: number;
  permissions?: Permission[]; // Para cuando obtenemos un rol con sus permisos
}

export interface RoleCreateInput {
  nombre_rol: string;
  descripcion_rol?: string;
  permission_ids: number[];
}

export interface RoleUpdateInput {
  nombre_rol?: string;
  descripcion_rol?: string;
  permission_ids?: number[];
}


export async function getAllPermissions(): Promise<Permission[]> {
  const sql = 'SELECT * FROM Permisos ORDER BY modulo_permiso, nombre_amigable_permiso ASC';
  try {
    const rows = await query(sql) as Permission[];
    return rows;
  } catch (error) {
    console.error('Error fetching all permissions:', error);
    throw error;
  }
}

export async function getPermissionsForRole(roleId: number): Promise<Permission[]> {
  const sql = `
    SELECT p.*
    FROM Permisos p
    JOIN Roles_Permisos rp ON p.id_permiso = rp.id_permiso_fk
    WHERE rp.id_rol_fk = ?
    ORDER BY p.modulo_permiso, p.nombre_amigable_permiso ASC
  `;
  try {
    const rows = await query(sql, [roleId]) as Permission[];
    return rows;
  } catch (error) {
    console.error(`Error fetching permissions for role ${roleId}:`, error);
    throw error;
  }
}

export async function getAllRoles(): Promise<Role[]> {
  // Nota: La columna Usuarios.id_rol_fk debe existir para que user_count funcione correctamente.
  // Asumimos que el schema de DB.sql o roles_permissions_schema.sql la ha creado/modificado.
  const sql = `
    SELECT 
      r.*,
      CAST(r.es_rol_sistema AS UNSIGNED) as es_rol_sistema_numeric,
      (SELECT COUNT(*) FROM Roles_Permisos rp WHERE rp.id_rol_fk = r.id_rol) as permission_count,
      (SELECT COUNT(*) FROM Usuarios u WHERE u.id_rol_fk = r.id_rol) as user_count
    FROM Roles r
    ORDER BY r.es_rol_sistema DESC, r.nombre_rol ASC
  `;
  try {
    const rows = await query(sql) as (Role & { es_rol_sistema_numeric: number })[];
    return rows.map(role => ({
      ...role,
      es_rol_sistema: Boolean(role.es_rol_sistema_numeric)
    }));
  } catch (error) {
    console.error('Error fetching all roles:', error);
    throw error;
  }
}

export async function getRoleById(roleId: number): Promise<Role | null> {
  const sql = 'SELECT *, CAST(es_rol_sistema AS UNSIGNED) as es_rol_sistema_numeric FROM Roles WHERE id_rol = ?';
  try {
    const rows = await query(sql, [roleId]) as (Role & { es_rol_sistema_numeric: number })[];
    if (rows.length > 0) {
      const role = rows[0];
      const permissions = await getPermissionsForRole(roleId);
      return { ...role, es_rol_sistema: Boolean(role.es_rol_sistema_numeric), permissions };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching role by ID ${roleId}:`, error);
    throw error;
  }
}

async function executeTransaction<T>(
  callback: (connection: PoolConnection) => Promise<T>
): Promise<T> {
  const pool = await getPool();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    console.error('Transaction failed, rolled back:', error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function createRole(data: RoleCreateInput): Promise<Role | null> {
  return executeTransaction(async (connection) => {
    const { nombre_rol, descripcion_rol, permission_ids } = data;
    
    const roleSql = 'INSERT INTO Roles (nombre_rol, descripcion_rol, es_rol_sistema) VALUES (?, ?, ?)';
    const [roleResult] = await connection.execute(roleSql, [nombre_rol, descripcion_rol || null, false]) as [ResultSetHeader, any];
    const newRoleId = roleResult.insertId;

    if (permission_ids && permission_ids.length > 0) {
      const permissionValues = permission_ids.map(permId => [newRoleId, permId]);
      const permissionSql = 'INSERT INTO Roles_Permisos (id_rol_fk, id_permiso_fk) VALUES ?';
      await connection.query(permissionSql, [permissionValues]);
    }
    
    // Fetch and return the newly created role with its details
    const [newRoleRows] = await connection.execute('SELECT *, CAST(es_rol_sistema AS UNSIGNED) as es_rol_sistema_numeric FROM Roles WHERE id_rol = ?', [newRoleId]) as [(Role & { es_rol_sistema_numeric: number })[], any];
    if (newRoleRows.length > 0) {
        const role = newRoleRows[0];
        const permissions = await getPermissionsForRole(newRoleId); // Fetch fresh permissions
        return { ...role, es_rol_sistema: Boolean(role.es_rol_sistema_numeric), permissions };
    }
    return null; // Should not happen if insert was successful
  });
}

export async function updateRole(roleId: number, data: RoleUpdateInput): Promise<Role | null> {
  return executeTransaction(async (connection) => {
    const { nombre_rol, descripcion_rol, permission_ids } = data;

    const [existingRoleRows] = await connection.execute('SELECT es_rol_sistema FROM Roles WHERE id_rol = ?', [roleId]) as [RowDataPacket[], any];
    if (existingRoleRows.length === 0) {
      throw new Error(`Rol con ID ${roleId} no encontrado.`);
    }
    if (existingRoleRows[0].es_rol_sistema) {
      throw new Error('Los roles del sistema no pueden ser modificados.');
    }

    if (nombre_rol !== undefined || descripcion_rol !== undefined) {
      const updateRoleSql = 'UPDATE Roles SET nombre_rol = COALESCE(?, nombre_rol), descripcion_rol = COALESCE(?, descripcion_rol), fecha_actualizacion = CURRENT_TIMESTAMP WHERE id_rol = ?';
      await connection.execute(updateRoleSql, [nombre_rol, descripcion_rol, roleId]);
    }

    if (permission_ids !== undefined) {
      // Clear existing permissions for this role
      await connection.execute('DELETE FROM Roles_Permisos WHERE id_rol_fk = ?', [roleId]);

      // Add new permissions if any
      if (permission_ids.length > 0) {
        const permissionValues = permission_ids.map(permId => [roleId, permId]);
        const permissionSql = 'INSERT INTO Roles_Permisos (id_rol_fk, id_permiso_fk) VALUES ?';
        await connection.query(permissionSql, [permissionValues]);
      }
    }
    
    // Fetch and return the updated role
    const [updatedRoleRows] = await connection.execute('SELECT *, CAST(es_rol_sistema AS UNSIGNED) as es_rol_sistema_numeric FROM Roles WHERE id_rol = ?', [roleId]) as [(Role & { es_rol_sistema_numeric: number })[], any];
    if (updatedRoleRows.length > 0) {
        const role = updatedRoleRows[0];
        const permissions = await getPermissionsForRole(roleId);
        return { ...role, es_rol_sistema: Boolean(role.es_rol_sistema_numeric), permissions };
    }
    return null;
  });
}

export async function deleteRole(roleId: number): Promise<boolean> {
  return executeTransaction(async (connection) => {
    const [roleRows] = await connection.execute('SELECT es_rol_sistema FROM Roles WHERE id_rol = ?', [roleId]) as [RowDataPacket[], any];
    if (roleRows.length === 0) {
      throw new Error(`Rol con ID ${roleId} no encontrado.`);
    }
    if (roleRows[0].es_rol_sistema) {
      throw new Error('Los roles del sistema no pueden ser eliminados.');
    }

    // Check if any users are assigned to this role
    const [userCountRows] = await connection.execute('SELECT COUNT(*) as count FROM Usuarios WHERE id_rol_fk = ?', [roleId]) as [RowDataPacket[], any];
    if (userCountRows[0].count > 0) {
      throw new Error('No se puede eliminar el rol porque está asignado a uno o más usuarios. Reasigne los usuarios a otro rol primero.');
    }

    // Delete from Roles_Permisos first (though CASCADE DELETE should handle this if set on FK)
    await connection.execute('DELETE FROM Roles_Permisos WHERE id_rol_fk = ?', [roleId]);
    
    // Then delete from Roles
    const [deleteResult] = await connection.execute('DELETE FROM Roles WHERE id_rol = ?', [roleId]) as [ResultSetHeader, any];
    return deleteResult.affectedRows > 0;
  });
}

    