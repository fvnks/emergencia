
import { createUser } from '../services/userService';
import { testConnection } from '../lib/db';
import dotenv from 'dotenv';

// Cargar variables de entorno desde .env.local para el script
dotenv.config({ path: '.env.local' });

async function seedDatabase() {
  try {
    console.log('Intentando conectar a la base de datos...');
    // Asegúrate de que las variables de entorno de la BD están cargadas
    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
        console.error('Error: Faltan variables de entorno para la conexión a la base de datos.');
        console.log('Asegúrate de que DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT están definidas en tu archivo .env.local');
        process.exit(1);
    }
    await testConnection();
    console.log('Conexión a la base de datos exitosa.');

    console.log('Creando usuario administrador...');
    const adminCredentials = {
      nombre_completo: "Administrador Del Sistema",
      email: "admin@example.com",
      password_plaintext: "password123", // Recuerda cambiar esto si es necesario
      rol: "admin" as "admin", // Asegurar el tipo para 'rol'
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
      // createUser lanza error si ya existe o falla, esta parte no debería alcanzarse si lanza error.
      // Pero si devuelve null (como en la firma original que podría haberse interpretado), esto lo cubriría.
      console.log("El usuario administrador podría ya existir o hubo un error no capturado al crearlo.");
    }

  } catch (error) {
    console.error("------------------------------------------------------");
    console.error("Error durante el proceso de seeding:");
    if (error instanceof Error) {
      console.error(error.message);
      if (error.message.includes('El correo electrónico ya está registrado')) {
        console.log("El usuario 'admin@example.com' ya existe en la base de datos.");
      } else if (error.message.toLowerCase().includes('connect etimedout') || error.message.toLowerCase().includes('access denied')) {
        console.error("Error de conexión a la base de datos. Verifica tus credenciales y la accesibilidad de la BD en .env.local.");
      } else if (error.message.includes('Unknown database')) {
        console.error(`La base de datos '${process.env.DB_NAME}' no existe. Por favor, créala primero.`);
      }
    } else {
      console.error("Un error desconocido ocurrió:", error);
    }
    console.error("------------------------------------------------------");
    process.exit(1); // Termina el script con un código de error
  } finally {
    console.log('Proceso de seeding finalizado.');
    // No es estrictamente necesario llamar a process.exit(0) aquí si todo va bien,
    // Node.js debería terminar automáticamente cuando no hay más operaciones pendientes.
    // Si el script se queda "colgado", podría ser por el pool de MySQL.
    // En ese caso, se podría necesitar una forma de cerrar el pool desde db.ts
    // o usar process.exit(0) aquí. Por ahora, lo dejamos así.
  }
}

seedDatabase();
