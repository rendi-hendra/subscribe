const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AppDataSource = require("../../data-source");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

async function register(req, res) {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        error: "name, email, dan password wajib diisi",
      });
    }

    const userRepository = AppDataSource.getRepository("User");
    const existingUser = await userRepository.findOneBy({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email sudah digunakan" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = userRepository.create({
      name,
      email,
      phone,
      password: hashedPassword,
    });
    const result = await userRepository.save(user);

    delete result.password;
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({
      error: "Gagal mendaftar user",
      details: error.message,
    });
  }
}

function generateAccessToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

function generateRefreshToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email dan password wajib diisi" });
    }

    const userRepository = AppDataSource.getRepository("User");
    const user = await userRepository.findOneBy({ email });
    if (!user || !user.password) {
      return res.status(401).json({ error: "Email atau password salah" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "Email atau password salah" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const seasonRepository = AppDataSource.getRepository("Season");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const season = seasonRepository.create({
      userId: user.id,
      refreshToken,
      expiresAt,
    });
    await seasonRepository.save(season);

    res.json({ accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({
      error: "Gagal login",
      details: error.message,
    });
  }
}

async function refreshToken(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: "refreshToken wajib diisi" });
    }

    const seasonRepository = AppDataSource.getRepository("Season");
    const stored = await seasonRepository.findOneBy({ refreshToken });
    if (!stored || new Date(stored.expiresAt) <= new Date()) {
      return res
        .status(403)
        .json({ error: "Refresh token tidak valid atau sudah kadaluarsa" });
    }

    const payload = jwt.verify(refreshToken, JWT_SECRET);
    const accessToken = jwt.sign(
      { id: payload.id, email: payload.email },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
      },
    );

    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({
      error: "Refresh token tidak valid",
      details: error.message,
    });
  }
}

async function logout(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: "refreshToken wajib diisi" });
    }

    const seasonRepository = AppDataSource.getRepository("Season");
    await seasonRepository.softDelete({ refreshToken });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      error: "Gagal logout",
      details: error.message,
    });
  }
}

module.exports = {
  register,
  login,
  refreshToken,
  logout,
};
