// ========================================================================
// Centralized Error Handling Middleware
// Safely maps database errors, hides stack traces from public users
// ========================================================================

import config from '../config/environment.js';

export const errorHandler = (err, req, res, next) => {
  // Always log internal error to server console for debugging
  console.error(`[API Error] ${req.method} ${req.originalUrl}:`, err);

  // Default error format
  let statusCode = err.statusCode || 500;
  let errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'An unexpected server error occurred';
  let details = err.details || null;

  // MySQL / MariaDB Specific Error Mapping
  if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    errorCode = 'DUPLICATE_ENTRY';
    if (err.message.includes('slug')) {
      message = 'An article or category with this slug already exists. Please choose a unique title or slug.';
    } else if (err.message.includes('email')) {
      message = 'A user account with this email address already exists.';
    } else {
      message = 'A record with this unique identifier already exists.';
    }
  } else if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_NO_REFERENCED_ROW') {
    statusCode = 400;
    errorCode = 'INVALID_FOREIGN_KEY';
    message = 'Referenced entity (such as category, tag, or author) does not exist.';
  } else if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
    statusCode = 409;
    errorCode = 'RECORD_IN_USE';
    message = 'Cannot delete or alter this record because other items depend on it.';
  } else if (err.code === 'ECONNREFUSED') {
    statusCode = 503;
    errorCode = 'DATABASE_UNAVAILABLE';
    message = 'Database service is currently unreachable. Please check MySQL server connection.';
  } else if (err.name === 'ZodError' || err.issues) {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Invalid request parameters or payload';
    details = (err.issues || []).map(i => ({ field: Array.isArray(i.path) ? i.path.join('.') : String(i.path), message: i.message }));
  }

  // Response payload
  const response = {
    success: false,
    error: {
      code: errorCode,
      message
    }
  };

  if (details) {
    response.error.details = details;
  }

  // Never expose raw stack traces in production
  if (config.env === 'development' && statusCode === 500) {
    response.error.devStack = err.stack;
  }

  res.status(statusCode).json(response);
};

export default errorHandler;
