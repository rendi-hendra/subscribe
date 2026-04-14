const snap = require("../config/midtrans");
const AppDataSource = require("../../data-source");

async function createPayment(req, res) {
  try {
    const {
      orderId,
      grossAmount,
      subscriptionId,
      customerDetails,
      itemDetails,
      paymentType,
    } = req.body;
    const userId = req.user?.id;

    if (!orderId || !grossAmount || !userId || !subscriptionId) {
      return res.status(400).json({
        error: "orderId, grossAmount, userId, dan subscriptionId wajib diisi",
      });
    }

    const paymentRepository = AppDataSource.getRepository("Payment");
    const subscriptionRepository = AppDataSource.getRepository("Subscription");

    const subscription = await subscriptionRepository.findOneBy({
      id: parseInt(subscriptionId, 10),
      userId,
    });
    if (!subscription) {
      return res.status(404).json({ error: "Subscription tidak ditemukan" });
    }

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      item_details: itemDetails || [
        {
          id: subscriptionId.toString(),
          price: grossAmount,
          quantity: 1,
          name: subscription.planName || "Subscription Payment",
        },
      ],
      customer_details: customerDetails || {},
    };

    const transaction = await snap.createTransaction(parameter);
    const payment = paymentRepository.create({
      subscriptionId: parseInt(subscriptionId, 10),
      userId,
      midtransOrderId: orderId,
      grossAmount,
      paymentType: paymentType || "midtrans",
      paymentStatus: "pending",
      paymentUrl: transaction.redirect_url || transaction.token || null,
    });
    const result = await paymentRepository.save(payment);

    res.status(201).json({ payment: result, midtrans: transaction });
  } catch (error) {
    res.status(500).json({
      error: "Gagal membuat transaksi Midtrans",
      details: error.message,
    });
  }
}

module.exports = {
  createPayment,
};
