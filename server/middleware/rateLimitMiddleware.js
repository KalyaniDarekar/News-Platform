// ========================================================================
// Rate Limiting Middleware (cPanel-friendly, in-memory store)
// ========================================================================

import rateLimit from 'express-rate-limit';

const isDevOrTest = process.env.NODE_ENV === 'test' || process.env.NODE_ENV !== 'production';

// Strict limiter for authentication login endpoint to block credential stuffing
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevOrTest ? 5000 : 15, // Relaxed in dev & test; 15 in production
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication attempts. Please wait 15 minutes before retrying.'
    }
  }
});

// General public and API limiter to prevent denial-of-service
export const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: isDevOrTest ? 10000 : 300, // Max 300 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP address, please try again shortly.'
    }
  }
});

export default { authRateLimiter, apiRateLimiter };
