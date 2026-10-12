import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: parseInt(process.env.PORT || '5000', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bharat_chronicle_db',
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '15', 10),
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_dev_secret_replace_in_production_2026',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },

  uploads: {
    directory: process.env.UPLOAD_DIR || './uploads',
    maxSizeBytes: (parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10)) * 1024 * 1024
  }
};

export default config;
