
import { createUser, getUserByEmail } from '../services/userService';
import { testConnection, query, getPool } from '../lib/db'; // Importar query y getPool

// dotenv.config() is no longer needed here, it will be preloaded by tsx -r dotenv/config

async function seedDatabase() {
  try {
    console.log('Verificando variables de entorno para la base de datos...');
    const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingEnvVars.length > 0) {
      console.error('Error: Faltan variables de entorno para la conexión a la base de datos:', missingEnvVars.join(', '));
      console.log(`Asegúrate de que ${requiredEnvVars.join(', ')} están definidas en tu archivo .env.local`);
      process.exit(1);
    }
    console.log('Variables de entorno para la base de datos parecen estar presentes.');

    console.log('Intentando conectar a la base de datos...');
    await testConnection();
    console.log('Conexión a la base de datos exitosa.');

    console.log('Creando o actualizando usuario administrador...');
    const adminCredentials = {
      nombre_completo: "Administrador Del Sistema",
      email: "admin@example.com",
      password_plaintext: "password123",
      id_rol_fk: 1, // Asegura que se asigna el ID del rol Administrador (asumiendo que es 1)
      telefono: "987654321",
    };

    const adminUserCreateData = {
        nombre_completo: adminCredentials.nombre_completo,
        email: adminCredentials.email,
        password_plaintext: adminCredentials.password_plaintext,
        id_rol_fk: adminCredentials.id_rol_fk,
        telefono: adminCredentials.telefono,
    };

    let admin;
    try {
        admin = await createUser(adminUserCreateData);
        if (admin) {
            console.log(`Usuario administrador creado exitosamente.`);
        }
    } catch (error: any) {
        if (error.message && error.message.includes('El correo electrónico ya está registrado')) {
            console.log(`El usuario '${adminCredentials.email}' ya existe. Intentando actualizar su rol...`);
            try {
                const updateUserRoleSql = 'UPDATE Usuarios SET id_rol_fk = ? WHERE email = ?';
                const updateResult = await query(updateUserRoleSql, [adminCredentials.id_rol_fk, adminCredentials.email]);
                
                if (updateResult && updateResult.affectedRows > 0) {
                    console.log(`Rol del usuario '${adminCredentials.email}' actualizado a id_rol_fk: ${adminCredentials.id_rol_fk}.`);
                } else {
                    console.log(`No se actualizó el rol del usuario '${adminCredentials.email}' (quizás ya tenía el rol correcto o no se encontró).`);
                }
                // Obtener el usuario para mostrar sus datos actualizados
                admin = await getUserByEmail(adminCredentials.email);
            } catch (updateError: any) {
                console.error(`Error al intentar actualizar el rol del usuario '${adminCredentials.email}':`, updateError.message);
                // No relanzar el error para que el script continúe si es posible
            }
        } else {
            // Si el error no es por duplicado, sí lo relanzamos
            throw error;
        }
    }
    
    if (admin) {
      console.log(`Datos del usuario administrador:`);
      console.log(`  Nombre: ${admin.nombre_completo}`);
      console.log(`  Email: ${admin.email}`);
      console.log(`  Rol Asignado (desde BD): ${admin.nombre_rol || 'No especificado'} (ID Rol FK: ${admin.id_rol_fk})`);
      console.log(`  Contraseña (para login): ${adminCredentials.password_plaintext}`);
    } else {
      console.log("El usuario administrador podría no existir o hubo un error no capturado al crearlo/actualizarlo.");
    }

  } catch (error) {
    console.error("------------------------------------------------------");
    console.error("Error durante el proceso de seeding:");
    if (error instanceof Error) {
      console.error(error.message);
      if (error.message.toLowerCase().includes('connect etimedout') || error.message.toLowerCase().includes('access denied') || error.message.toLowerCase().includes('econnrefused')) {
        console.error("Error de conexión a la base de datos. Verifica tus credenciales y la accesibilidad de la BD en .env.local.");
        console.error(`Intentando conectar a: ${process.env.DB_HOST}:${process.env.DB_PORT} con usuario ${process.env.DB_USER} a la BD ${process.env.DB_NAME}`);
      } else if (error.message.includes('Unknown database')) {
        console.error(`La base de datos '${process.env.DB_NAME}' no existe. Por favor, créala primero.`);
      }
    } else {
      console.error("Un error desconocido ocurrió:", error);
    }
    console.error("------------------------------------------------------");
    process.exit(1);
  } finally {
    console.log('Proceso de seeding finalizado.');
    // Finalizar el pool si es necesario para que el script termine completamente
    const pool = await getPool();
    if (pool) {
      await pool.end();
      console.log('Pool de MySQL cerrado.');
    }
  }
}

seedDatabase();
