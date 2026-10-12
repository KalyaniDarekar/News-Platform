// Database Connection Pool Manager (MySQL2 Promise API)
// Compatible with standard cPanel MySQL / MariaDB environments

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bharat_chronicle_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
};

let pool = null;

export const getDbPool = () => {
  if (!pool) {
    try {
      pool = mysql.createPool(dbConfig);
    } catch (err) {
      console.warn('MySQL pool initialization notice:', err.message);
    }
  }
  return pool;
};

// Healthcheck helper that tests DB connection
export const checkDbConnection = async () => {
  try {
    const currentPool = getDbPool();
    if (!currentPool) return { connected: false, message: 'Pool not configured' };
    const connection = await currentPool.getConnection();
    connection.release();
    return { connected: true, message: 'Database connection verified' };
  } catch (error) {
    return {
      connected: false,
      message: error.code === 'ECONNREFUSED' 
        ? 'MySQL server is not running on configured host/port' 
        : error.message
    };
  }
};

export default getDbPool();
