
import { createUser } from '../services/userService';
import { testConnection } from '../lib/db';

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

    console.log('Creando usuario administrador...');
    const adminCredentials = {
      nombre_completo: "Administrador Del Sistema",
      email: "admin@example.com",
      password_plaintext: "password123", 
      rol: "admin" as "admin",
      telefono: "987654321",
      avatar_seed: "AS"
    };

    const admin = await createUser(adminCredentials);
    
    if (admin) {
      console.log(`Usuario administrador creado exitosamente:`);
      console.log(`  Nombre: ${admin.nombre_completo}`);
      console.log(`  Email: ${admin.email}`);
      console.log(`  Rol: ${admin.rol}`);
      console.log(`  Contraseña (para login): ${adminCredentials.password_plaintext}`);
    } else {
      console.log("El usuario administrador podría ya existir o hubo un error no capturado al crearlo.");
    }

  } catch (error) {
    console.error("------------------------------------------------------");
    console.error("Error durante el proceso de seeding:");
    if (error instanceof Error) {
      console.error(error.message);
      if (error.message.includes('El correo electrónico ya está registrado')) {
        console.log("El usuario 'admin@example.com' ya existe en la base de datos.");
      } else if (error.message.toLowerCase().includes('connect etimedout') || error.message.toLowerCase().includes('access denied') || error.message.toLowerCase().includes('econnrefused')) {
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
    // MySQL pool in db.ts should handle connection closing gracefully.
    // If the script hangs, we might need to explicitly close the pool here.
    // For now, let Node.js exit naturally.
    // Example: if (getPool()) getPool().end(); // Would require exporting getPool and end method
  }
}

seedDatabase();
