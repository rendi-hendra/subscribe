const AppDataSource = require("../../data-source");

async function getSubscriptions(req, res) {
  try {
    const subscriptionRepository = AppDataSource.getRepository("Subscription");
    const subscriptions = await subscriptionRepository.find();
    res.json(subscriptions);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Gagal membaca subscriptions", details: error.message });
  }
}

async function getSubscriptionById(req, res) {
  try {
    const subscriptionRepository = AppDataSource.getRepository("Subscription");
    const subscription = await subscriptionRepository.findOneBy({
      id: parseInt(req.params.id, 10),
    });
    if (!subscription) {
      return res.status(404).json({ error: "Subscription tidak ditemukan" });
    }
    res.json(subscription);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Gagal membaca subscription", details: error.message });
  }
}

const ALLOWED_SUBSCRIPTION_STATUSES = [
  "pending",
  "active",
  "expired",
  "cancelled",
];

async function createSubscription(req, res) {
  try {
    const { planId, status, startedAt, expiredAt } = req.body;
    const userId = req.user?.id;
    if (!userId || !planId) {
      return res
        .status(400)
        .json({ error: "userId dan planId wajib diisi" });
    }

    if (
      status !== undefined &&
      !ALLOWED_SUBSCRIPTION_STATUSES.includes(status)
    ) {
      return res.status(400).json({
        error: "Status subscription tidak valid",
        allowed: ALLOWED_SUBSCRIPTION_STATUSES,
      });
    }

    const planRepository = AppDataSource.getRepository("Plan");
    const plan = await planRepository.findOneBy({ id: parseInt(planId, 10) });
    if (!plan) {
      return res.status(404).json({ error: "Plan tidak ditemukan" });
    }

    const subscriptionRepository = AppDataSource.getRepository("Subscription");
    const subscription = subscriptionRepository.create({
      userId,
      planId,
      status: status || "pending",
      startedAt: startedAt || new Date(),
      expiredAt: expiredAt || null,
    });
    const result = await subscriptionRepository.save(subscription);

    res.status(201).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Gagal membuat subscription", details: error.message });
  }
}

async function updateSubscription(req, res) {
  try {
    const subscriptionRepository = AppDataSource.getRepository("Subscription");
    const subscription = await subscriptionRepository.findOneBy({
      id: parseInt(req.params.id, 10),
    });
    if (!subscription) {
      return res.status(404).json({ error: "Subscription tidak ditemukan" });
    }

    const { planId, status, startedAt, expiredAt } = req.body;

    if (
      status !== undefined &&
      !ALLOWED_SUBSCRIPTION_STATUSES.includes(status)
    ) {
      return res.status(400).json({
        error: "Status subscription tidak valid",
        allowed: ALLOWED_SUBSCRIPTION_STATUSES,
      });
    }

    if (planId !== undefined && planId !== subscription.planId) {
      const planRepository = AppDataSource.getRepository("Plan");
      const plan = await planRepository.findOneBy({ id: parseInt(planId, 10) });
      if (!plan) {
        return res.status(404).json({ error: "Plan tidak ditemukan" });
      }
      subscription.planId = planId;
    }

    subscription.status = status !== undefined ? status : subscription.status;
    subscription.startedAt =
      startedAt !== undefined ? startedAt : subscription.startedAt;
    subscription.expiredAt =
      expiredAt !== undefined ? expiredAt : subscription.expiredAt;

    const result = await subscriptionRepository.save(subscription);
    res.json(result);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Gagal mengupdate subscription", details: error.message });
  }
}

module.exports = {
  getSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
};
