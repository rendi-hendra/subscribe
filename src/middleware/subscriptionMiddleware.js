const AppDataSource = require("../../data-source");

async function subscriptionMiddleware(req, res, next) {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: "User belum terautentikasi" });
  }

  const memberRepository = AppDataSource.getRepository("Member");
  const member = await memberRepository.findOneBy({
    userId: req.user.id,
    status: "active",
  });

  const now = new Date();
  if (
    !member ||
    (member.expiredAt && new Date(member.expiredAt) <= now) ||
    (member.startedAt && new Date(member.startedAt) > now)
  ) {
    return res.status(403).json({
      error: "Akses forbidden. Subscription belum aktif atau sudah kadaluarsa",
    });
  }

  next();
}

module.exports = subscriptionMiddleware;
