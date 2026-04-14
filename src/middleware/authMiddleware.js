const jwt = require("jsonwebtoken");
const AppDataSource = require("../../data-source");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "secret";

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token akses tidak ditemukan" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userRepository = AppDataSource.getRepository("User");
    const user = await userRepository.findOneBy({ id: decoded.id });
    if (!user) {
      return res.status(401).json({ error: "User tidak valid" });
    }

    req.user = { id: user.id, email: user.email };
    next();
  } catch (error) {
    res
      .status(401)
      .json({ error: "Token akses tidak valid", details: error.message });
  }
}

module.exports = authMiddleware;
