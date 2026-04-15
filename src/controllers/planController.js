const AppDataSource = require("../../data-source");

async function getPlans(req, res) {
  try {
    const planRepository = AppDataSource.getRepository("Plan");
    const plans = await planRepository.find();
    res.json(plans);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Gagal membaca plans", details: error.message });
  }
}

async function getPlanById(req, res) {
  try {
    const planRepository = AppDataSource.getRepository("Plan");
    const plan = await planRepository.findOneBy({
      id: parseInt(req.params.id, 10),
    });
    if (!plan) {
      return res.status(404).json({ error: "Plan tidak ditemukan" });
    }
    res.json(plan);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Gagal membaca plan", details: error.message });
  }
}

async function createPlan(req, res) {
  try {
    const { name, price, durationDays, description } = req.body;
    if (!name || price === undefined || durationDays === undefined) {
      return res.status(400).json({ error: "name, price, dan durationDays wajib diisi" });
    }

    const planRepository = AppDataSource.getRepository("Plan");
    const plan = planRepository.create({
      name,
      price,
      durationDays,
      description,
    });
    const result = await planRepository.save(plan);

    res.status(201).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Gagal membuat plan", details: error.message });
  }
}

async function updatePlan(req, res) {
  try {
    const planRepository = AppDataSource.getRepository("Plan");
    const plan = await planRepository.findOneBy({
      id: parseInt(req.params.id, 10),
    });
    if (!plan) {
      return res.status(404).json({ error: "Plan tidak ditemukan" });
    }

    const { name, price, durationDays, description } = req.body;

    plan.name = name !== undefined ? name : plan.name;
    plan.price = price !== undefined ? price : plan.price;
    plan.durationDays = durationDays !== undefined ? durationDays : plan.durationDays;
    plan.description = description !== undefined ? description : plan.description;

    const result = await planRepository.save(plan);
    res.json(result);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Gagal mengupdate plan", details: error.message });
  }
}

async function deletePlan(req, res) {
  try {
    const planRepository = AppDataSource.getRepository("Plan");
    const plan = await planRepository.findOneBy({
      id: parseInt(req.params.id, 10),
    });
    if (!plan) {
      return res.status(404).json({ error: "Plan tidak ditemukan" });
    }

    await planRepository.remove(plan);
    res.json({ success: true });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Gagal menghapus plan", details: error.message });
  }
}

module.exports = {
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
};
