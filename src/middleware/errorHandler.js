const { ZodError } = require("zod");

function errorHandler(err, req, res, next) {
  if (err instanceof ZodError || err?.name === "ZodError") {
    const issuesSource = Array.isArray(err.errors)
      ? err.errors
      : Array.isArray(err.issues)
        ? err.issues
        : [];

    const issues = issuesSource.map((issue) => ({
      path: Array.isArray(issue.path) ? issue.path.join(".") : "(root)",
      message: issue.message || "Invalid request",
      code: issue.code || "invalid",
    }));

    return res.status(400).json({
      error: "Request validation failed",
      issues,
    });
  }

  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || err.statusCode || 500;
  const response = {
    error: err.message || "Internal server error",
  };

  if (err.details) {
    response.details = err.details;
  }

  return res.status(status).json(response);
}

module.exports = errorHandler;
