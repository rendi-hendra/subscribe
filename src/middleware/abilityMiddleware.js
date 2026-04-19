const { defineAbilitiesFor } = require("../config/ability");

function abilityMiddleware(req, res, next) {
  // If user is not authenticated, they might still have basic guest abilities (if defined)
  // or we just define standard guest abilities.
  // req.user is usually populated by authMiddleware.
  const user = req.user || { role: "guest" };
  req.ability = defineAbilitiesFor(user);
  next();
}

module.exports = abilityMiddleware;
