const AppDataSource = require("../../data-source");

async function handleNotification(req, res) {
  try {
    const { order_id, transaction_status, fraud_status, transaction_id } =
      req.body;

    if (!order_id || !transaction_status) {
      return res
        .status(400)
        .json({ error: "order_id dan transaction_status wajib diisi" });
    }

    const paymentRepository = AppDataSource.getRepository("Payment");
    const subscriptionRepository = AppDataSource.getRepository("Subscription");
    const memberRepository = AppDataSource.getRepository("Member");

    const payment = await paymentRepository.findOneBy({
      midtransOrderId: order_id,
    });
    if (!payment) {
      return res.status(404).json({ error: "Payment tidak ditemukan" });
    }

    const status = transaction_status;
    let updatedPaymentStatus = status;

    if (status === "capture" && fraud_status === "challenge") {
      updatedPaymentStatus = "challenge";
    }

    payment.paymentStatus = updatedPaymentStatus;
    payment.midtransTransactionId =
      transaction_id || payment.midtransTransactionId;
    await paymentRepository.save(payment);

    if (
      updatedPaymentStatus === "settlement" ||
      updatedPaymentStatus === "capture"
    ) {
      const subscription = await subscriptionRepository.findOneBy({
        id: payment.subscriptionId,
      });
      if (subscription) {
        let durationDays = 30; // fallback rating
        const planRepository = AppDataSource.getRepository("Plan");
        if (subscription.planId) {
          const plan = await planRepository.findOneBy({ id: subscription.planId });
          if (plan) {
            durationDays = plan.durationDays;
          }
        }

        subscription.status = "active";
        subscription.startedAt = subscription.startedAt || new Date();
        subscription.expiredAt =
          subscription.expiredAt ||
          new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
        await subscriptionRepository.save(subscription);

        let member = await memberRepository.findOneBy({
          userId: payment.userId,
          subscriptionId: subscription.id,
        });
        if (!member) {
          member = memberRepository.create({
            userId: payment.userId,
            subscriptionId: subscription.id,
            status: "active",
            startedAt: subscription.startedAt,
            expiredAt: subscription.expiredAt,
          });
        } else {
          member.status = "active";
          member.startedAt = subscription.startedAt;
          member.expiredAt = subscription.expiredAt;
        }
        await memberRepository.save(member);
      }
    }

    res.json({ success: true, payment: updatedPaymentStatus });
  } catch (error) {
    res.status(500).json({
      error: "Gagal memproses notifikasi Midtrans",
      details: error.message,
    });
  }
}

module.exports = {
  handleNotification,
};
