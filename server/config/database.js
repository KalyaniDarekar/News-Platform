// ========================================================================
// The Bharat Chronicle — MySQL Database Connection Pool & Query Manager
// Architecture Target: cPanel MySQL / MariaDB 10.4+ / MySQL 8.0+
// Supports parameterized queries, transactions, and connection diagnostics
// ========================================================================

import mysql from 'mysql2/promise';
import config from './environment.js';

let pool = null;

export const getDbPool = () => {
  if (!pool) {
    pool = mysql.createPool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      waitForConnections: true,
      connectionLimit: config.db.connectionLimit,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
      charset: 'utf8mb4'
    });
  }
  return pool;
};

// Safe parameterized query execution helper
export const query = async (sql, params = []) => {
  const currentPool = getDbPool();
  const [results] = await currentPool.query(sql, params);
  return results;
};

// Transaction wrapper for ACID consistency across revisions and audit logs
export const withTransaction = async (callback) => {
  const currentPool = getDbPool();
  const connection = await currentPool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Healthcheck helper that tests DB connection
export const checkDbConnection = async () => {
  try {
    const currentPool = getDbPool();
    const connection = await currentPool.getConnection();
    const [rows] = await connection.query('SELECT 1 as is_alive, NOW() as server_time, VERSION() as mysql_version');
    connection.release();
    return {
      connected: true,
      message: 'MySQL database connected successfully',
      serverTime: rows[0].server_time,
      version: rows[0].mysql_version
    };
  } catch (error) {
    return {
      connected: false,
      message: error.code === 'ECONNREFUSED' 
        ? `MySQL connection refused on ${config.db.host}:${config.db.port}` 
        : error.message,
      errorCode: error.code
    };
  }
};

export default { getDbPool, query, withTransaction, checkDbConnection };
