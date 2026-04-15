const AppDataSource = require("../../data-source");

async function getMembers(req, res) {
  try {
    const memberRepository = AppDataSource.getRepository("Member");
    const members = await memberRepository.find();
    res.json(members);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Gagal membaca members", details: error.message });
  }
}

async function getMemberById(req, res) {
  try {
    const memberRepository = AppDataSource.getRepository("Member");
    const member = await memberRepository.findOneBy({
      id: parseInt(req.params.id, 10),
    });
    if (!member) {
      return res.status(404).json({ error: "Member tidak ditemukan" });
    }
    res.json(member);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Gagal membaca member", details: error.message });
  }
}

async function createMember(req, res) {
  try {
    const { subscriptionId, status, startedAt, expiredAt } = req.body;
    const userId = req.user?.id;
    if (!userId || !subscriptionId) {
      return res.status(400).json({
        error: "subscriptionId wajib diisi dan user harus terautentikasi",
      });
    }

    const subscriptionRepository = AppDataSource.getRepository("Subscription");
    const subscription = await subscriptionRepository.findOneBy({
      id: parseInt(subscriptionId, 10),
      userId,
    });

    if (!subscription) {
      return res.status(404).json({
        error: "Subscription tidak ditemukan atau tidak dimiliki oleh user ini",
      });
    }

    const memberRepository = AppDataSource.getRepository("Member");
    const existingMember = await memberRepository.findOneBy({
      userId,
      subscriptionId: parseInt(subscriptionId, 10),
    });
    if (existingMember) {
      return res.status(409).json({
        error: "Member untuk subscription ini sudah ada",
      });
    }

    const member = memberRepository.create({
      userId,
      subscriptionId: parseInt(subscriptionId, 10),
      status: status || "active",
      startedAt: startedAt || null,
      expiredAt: expiredAt || null,
    });
    const result = await memberRepository.save(member);

    res.status(201).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Gagal membuat member", details: error.message });
  }
}

async function updateMember(req, res) {
  try {
    const memberRepository = AppDataSource.getRepository("Member");
    const member = await memberRepository.findOneBy({
      id: parseInt(req.params.id, 10),
    });
    if (!member) {
      return res.status(404).json({ error: "Member tidak ditemukan" });
    }

    const { userId, subscriptionId, status, startedAt, expiredAt } = req.body;

    member.userId = userId !== undefined ? userId : member.userId;
    member.subscriptionId =
      subscriptionId !== undefined ? subscriptionId : member.subscriptionId;
    member.status = status !== undefined ? status : member.status;
    member.startedAt = startedAt !== undefined ? startedAt : member.startedAt;
    member.expiredAt = expiredAt !== undefined ? expiredAt : member.expiredAt;

    const result = await memberRepository.save(member);
    res.json(result);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Gagal mengupdate member", details: error.message });
  }
}

async function deleteMember(req, res) {
  try {
    const memberRepository = AppDataSource.getRepository("Member");
    const member = await memberRepository.findOneBy({
      id: parseInt(req.params.id, 10),
    });
    if (!member) {
      return res.status(404).json({ error: "Member tidak ditemukan" });
    }

    await memberRepository.remove(member);
    res.json({ success: true });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Gagal menghapus member", details: error.message });
  }
}

module.exports = {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
};
