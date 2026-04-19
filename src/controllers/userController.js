const bcrypt = require("bcrypt");
const AppDataSource = require("../../data-source");

function sanitizeUser(user) {
  const { password, ...sanitized } = user;
  return sanitized;
}

async function getUsers(req, res) {
  try {
    const userRepository = AppDataSource.getRepository("User");
    const users = await userRepository.find();
    res.json(users.map(sanitizeUser));
  } catch (error) {
    res
      .status(500)
      .json({ error: "Gagal membaca users", details: error.message });
  }
}

async function getUserById(req, res) {
  try {
    const userRepository = AppDataSource.getRepository("User");
    const user = await userRepository.findOneBy({
      id: parseInt(req.params.id, 10),
    });
    if (!user) {
      return res.status(404).json({ error: "User tidak ditemukan" });
    }
    res.json(sanitizeUser(user));
  } catch (error) {
    res
      .status(500)
      .json({ error: "Gagal membaca user", details: error.message });
  }
}

async function createUser(req, res) {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "name dan email wajib diisi" });
    }

    const userRepository = AppDataSource.getRepository("User");
    const existing = await userRepository.findOneBy({ email });
    if (existing) {
      return res.status(409).json({ error: "Email sudah digunakan" });
    }

    const userData = { name, email, phone };
    if (password) {
      userData.password = await bcrypt.hash(password, 10);
    }

    const user = userRepository.create(userData);
    const result = await userRepository.save(user);
    res.status(201).json(sanitizeUser(result));
  } catch (error) {
    res
      .status(500)
      .json({ error: "Gagal membuat user", details: error.message });
  }
}

async function deleteUser(req, res) {
  try {
    const userRepository = AppDataSource.getRepository("User");
    const user = await userRepository.findOneBy({
      id: parseInt(req.params.id, 10),
    });
    if (!user) {
      return res.status(404).json({ error: "User tidak ditemukan" });
    }

    await userRepository.softRemove(user);
    res.json({ success: true, message: "User berhasil di-soft delete" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Gagal menghapus user", details: error.message });
  }
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  deleteUser,
};
