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

module.exports = {
  getMembers,
  getMemberById,
};
