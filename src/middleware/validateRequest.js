const { ZodError } = require("zod");

function validate(schema) {
  return (req, res, next) => {
    const parseInput = {
      body: req.body,
      params: req.params,
      query: req.query,
    };

    const result = schema.safeParse(parseInput);
    if (!result.success) {
      return next(result.error);
    }

    if (result.data.body !== undefined) {
      req.body = result.data.body;
    }
    if (result.data.params !== undefined) {
      req.params = result.data.params;
    }
    if (result.data.query !== undefined) {
      req.query = result.data.query;
    }
    return next();
  };
}

function isZodError(error) {
  return error instanceof ZodError || error?.name === "ZodError";
}

module.exports = {
  validate,
  isZodError,
};
