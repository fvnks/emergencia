'use server';

import mysql from 'mysql2/promise';

const poolConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // Puedes ajustar este valor según tus necesidades
  queueLimit: 0, // Cola ilimitada
  // Aiven y otros proveedores de DBaaS a menudo requieren SSL/TLS.
  // Si tienes problemas de conexión, podrías necesitar configurar SSL aquí.
  // Ejemplo:
  // ssl: {
  //   rejectUnauthorized: true // O false para pruebas (inseguro en producción)
  //   // ca: fs.readFileSync('/ruta/a/tu/certificado_ca.pem') // Si tienes el certificado CA
  // }
  // Consulta la documentación de Aiven para la configuración SSL específica si es necesaria.
};

let pool: mysql.Pool | null = null;

function getPool() {
  if (!pool) {
    try {
      pool = mysql.createPool(poolConfig);
      console.log('MySQL Pool created successfully.');

      // Escuchar errores del pool (opcional pero recomendado)
      pool.on('error', (err) => {
        console.error('MySQL Pool Error:', err);
        // Aquí podrías intentar recrear el pool o manejar el error de otra forma.
        // Por ahora, simplemente lo registramos.
        pool = null; // Marcar el pool como nulo para que se intente recrear en la próxima llamada.
      });

    } catch (error) {
      console.error('Failed to create MySQL Pool:', error);
      // Si falla la creación del pool, relanzamos el error para que sea manejado por el llamador.
      throw error;
    }
  }
  return pool;
}


export async function query(sql: string, params?: any[]): Promise<any> {
  const currentPool = getPool();
  if (!currentPool) {
    throw new Error('MySQL Pool is not available.');
  }

  let connection;
  try {
    connection = await currentPool.getConnection();
    // console.log('Connection acquired from pool.'); // Log opcional
    const [rows, fields] = await connection.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Error executing query or getting connection from pool:', error);
    // Dependiendo del error, podrías querer invalidar la conexión o el pool.
    // Por simplicidad, aquí solo relanzamos el error.
    throw error;
  } finally {
    if (connection) {
      connection.release();
      // console.log('Connection released back to pool.'); // Log opcional
    }
  }
}

export async function testConnection(): Promise<void> {
  try {
    console.log('Attempting to test database connection...');
    const result = await query('SELECT 1 AS testValue');
    if (Array.isArray(result) && result.length > 0 && result[0].testValue === 1) {
      console.log('Database connection test successful. Result:', result);
    } else {
      console.error('Database connection test returned unexpected result:', result);
      throw new Error('Database connection test failed due to unexpected result.');
    }
  } catch (error) {
    console.error('Database connection test failed:', error);
    // Asegúrate de que el error original se propague si es necesario para depuración.
    throw new Error(`Database connection test failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
