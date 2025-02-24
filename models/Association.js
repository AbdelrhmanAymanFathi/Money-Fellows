const express = require("express");
const Association = require("../models/Association");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// 🔹 إرسال طلب انضمام للجمعية
router.post("/:associationId/join", authMiddleware, async (req, res) => {
  try {
    const { associationId } = req.params;
    const userId = req.user.userId;

    const association = await Association.findById(associationId);
    if (!association) {
      return res.status(404).json({ message: "الجمعية غير موجودة!" });
    }

    const existingMember = association.members.find((m) => m.userId.toString() === userId);
    if (existingMember) {
      return res.status(400).json({ message: "لقد قمت بطلب الانضمام بالفعل!" });
    }

    association.members.push({ userId, status: "pending" });
    await association.save();

    res.status(200).json({ message: "تم إرسال طلب الانضمام!" });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء إرسال الطلب", error: error.message });
  }
});

// 🔹 قبول أو رفض طلب انضمام
router.put("/:associationId/members/:memberId", authMiddleware, async (req, res) => {
  try {
    const { associationId, memberId } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "يجب اختيار 'approved' أو 'rejected'!" });
    }

    const association = await Association.findById(associationId);
    if (!association) {
      return res.status(404).json({ message: "الجمعية غير موجودة!" });
    }

    if (association.admin.toString() !== userId) {
      return res.status(403).json({ message: "ليس لديك صلاحية لتعديل الأعضاء!" });
    }

    const member = association.members.find((m) => m.userId.toString() === memberId);
    if (!member) {
      return res.status(404).json({ message: "العضو غير موجود!" });
    }

    member.status = status;
    await association.save();

    res.status(200).json({ message: `تم ${status === "approved" ? "قبول" : "رفض"} طلب العضو!` });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء تعديل العضو", error: error.message });
  }
});

module.exports = router;
