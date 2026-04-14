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
    const { planName, price, status, startedAt, expiredAt } = req.body;
    const userId = req.user?.id;
    if (!userId || !planName || !price) {
      return res
        .status(400)
        .json({ error: "userId, planName, dan price wajib diisi" });
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

    const subscriptionRepository = AppDataSource.getRepository("Subscription");
    const subscription = subscriptionRepository.create({
      userId,
      planName,
      price,
      status: status || "pending",
      startedAt: startedAt || null,
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

    const { planName, price, status, startedAt, expiredAt } = req.body;

    if (
      status !== undefined &&
      !ALLOWED_SUBSCRIPTION_STATUSES.includes(status)
    ) {
      return res.status(400).json({
        error: "Status subscription tidak valid",
        allowed: ALLOWED_SUBSCRIPTION_STATUSES,
      });
    }

    subscription.planName =
      planName !== undefined ? planName : subscription.planName;
    subscription.price = price !== undefined ? price : subscription.price;
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
