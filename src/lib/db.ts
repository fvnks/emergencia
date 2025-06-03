
'use server';

import mysql from 'mysql2/promise';
import type { Pool, PoolConnection } from 'mysql2/promise'; // Import PoolConnection

const poolConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, 
  queueLimit: 0,
  // Aiven y otros proveedores de DBaaS a menudo requieren SSL/TLS.
  // ssl: {
  //   rejectUnauthorized: true 
  //   // ca: fs.readFileSync('/ruta/a/tu/certificado_ca.pem') 
  // }
};

let pool: Pool | null = null;

export async function getPool(): Promise<Pool> { // Return type Promise<Pool>
  if (!pool) {
    try {
      console.log('Creating MySQL Pool with config:', {
        host: poolConfig.host,
        port: poolConfig.port,
        user: poolConfig.user,
        database: poolConfig.database,
        connectionLimit: poolConfig.connectionLimit,
      });
      
      if (!poolConfig.host || !poolConfig.port || !poolConfig.user || !poolConfig.database) {
        console.error('Error: Missing critical database configuration details.');
        console.error(`DB_HOST: ${process.env.DB_HOST}, DB_PORT: ${process.env.DB_PORT}, DB_USER: ${process.env.DB_USER}, DB_NAME: ${process.env.DB_NAME}`);
        throw new Error('Incomplete database configuration. Check .env.local and ensure all DB variables are set.');
      }
      
      pool = mysql.createPool(poolConfig);
      console.log('MySQL Pool created successfully.');

      pool.on('error', (err) => {
        console.error('MySQL Pool Error:', err);
        pool = null; 
      });

    } catch (error) {
      console.error('Failed to create MySQL Pool:', error);
      throw error; // Rethrow to indicate failure
    }
  }
  return pool;
}


export async function query(sql: string, params?: any[]): Promise<any> {
  const currentPool = await getPool(); // Now we must await getPool()
  
  let connection: PoolConnection | undefined; // Ensure connection is typed and can be undefined
  try {
    connection = await currentPool.getConnection();
    const [rows, fields] = await connection.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Error executing query or getting connection from pool:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
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
    throw new Error(`Database connection test failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

