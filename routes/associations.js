const express = require("express");
const Association = require("../models/Association");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// ✅ إنشاء جمعية جديدة
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;
    const adminId = req.user.userId;

    const newAssociation = new Association({
      name,
      description,
      admin: adminId,
      members: [{ userId: adminId, status: "approved" }], // إضافة المدير كعضو تلقائيًا
    });

    await newAssociation.save();
    res.status(201).json({ message: "تم إنشاء الجمعية بنجاح!", association: newAssociation });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء إنشاء الجمعية", error: error.message });
  }
});

// ✅ جلب جميع الجمعيات
router.get("/", authMiddleware, async (req, res) => {
  try {
    const associations = await Association.find()
      .populate("admin", "name email")
      .populate("members.userId", "name email");

    res.status(200).json(associations);
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء جلب الجمعيات", error: error.message });
  }
});

// ✅ جلب جمعية معينة بالتفاصيل
router.get("/:associationId", authMiddleware, async (req, res) => {
  try {
    const association = await Association.findById(req.params.associationId)
      .populate("admin", "name email")
      .populate("members.userId", "name email");

    if (!association) {
      return res.status(404).json({ message: "الجمعية غير موجودة!" });
    }

    res.status(200).json(association);
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء جلب تفاصيل الجمعية", error: error.message });
  }
});

// ✅ إرسال طلب انضمام للجمعية
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

// ✅ قبول أو رفض طلب انضمام
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

// ✅ حذف جمعية (فقط المدير يمكنه الحذف)
router.delete("/:associationId", authMiddleware, async (req, res) => {
  try {
    const { associationId } = req.params;
    const userId = req.user.userId;

    const association = await Association.findById(associationId);
    if (!association) {
      return res.status(404).json({ message: "الجمعية غير موجودة!" });
    }

    if (association.admin.toString() !== userId) {
      return res.status(403).json({ message: "ليس لديك صلاحية لحذف هذه الجمعية!" });
    }

    await Association.findByIdAndDelete(associationId);
    res.status(200).json({ message: "تم حذف الجمعية بنجاح!" });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء حذف الجمعية", error: error.message });
  }
});

module.exports = router;
