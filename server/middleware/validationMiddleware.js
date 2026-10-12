// ========================================================================
// Request Validation Middleware (Zod-based)
// Validates req.body, req.query, or req.params with clear JSON errors
// ========================================================================

export const validateRequest = (schemas = {}) => {
  return (req, res, next) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      next();
    } catch (error) {
      const issues = error.issues || error.errors;
      if (issues) {
        const formattedErrors = issues.map(err => ({
          field: Array.isArray(err.path) ? err.path.join('.') : String(err.path),
          message: err.message,
          rule: err.code
        }));

        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data provided',
            details: formattedErrors
          }
        });
      }
      next(error);
    }
  };
};

export default validateRequest;
