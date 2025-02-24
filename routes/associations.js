const express = require("express");
const Association = require("../models/Association");
const { authenticate, adminOnly } = require("../middlewares/authMiddleware"); // ✅ FIXED

const router = express.Router();

// ✅ إنشاء جمعية جديدة (Admin Only)
router.post("/", authenticate, adminOnly, async (req, res) => {
  try {
    const { name, description } = req.body;
    const adminId = req.user.userId;

    if (!name || !description) {
      return res.status(400).json({ message: "يجب إدخال جميع البيانات!" });
    }

    const newAssociation = new Association({
      name,
      description,
      admin: adminId,
      members: [{ userId: adminId, status: "approved" }], // ✅ المدير يصبح عضوًا تلقائيًا
    });

    await newAssociation.save();
    res.status(201).json({ message: "تم إنشاء الجمعية بنجاح!", association: newAssociation });
  } catch (error) {
    res.status(500).json({ message: "❌ خطأ أثناء إنشاء الجمعية", error: error.message });
  }
});

// ✅ جلب جميع الجمعيات
router.get("/", authenticate, async (req, res) => {
  try {
    const associations = await Association.find()
      .populate("admin", "name email")
      .populate("members.userId", "name email");

    res.status(200).json(associations);
  } catch (error) {
    res.status(500).json({ message: "❌ خطأ أثناء جلب الجمعيات", error: error.message });
  }
});

// ✅ جلب جمعية معينة بالتفاصيل
router.get("/:associationId", authenticate, async (req, res) => {
  try {
    const association = await Association.findById(req.params.associationId)
      .populate("admin", "name email")
      .populate("members.userId", "name email");

    if (!association) {
      return res.status(404).json({ message: "الجمعية غير موجودة!" });
    }

    res.status(200).json(association);
  } catch (error) {
    res.status(500).json({ message: "❌ خطأ أثناء جلب تفاصيل الجمعية", error: error.message });
  }
});

// ✅ إرسال طلب انضمام للجمعية
router.post("/:associationId/join", authenticate, async (req, res) => {
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
    res.status(500).json({ message: "❌ خطأ أثناء إرسال الطلب", error: error.message });
  }
});

// ✅ قبول أو رفض طلب انضمام (Admin Only)
router.put("/:associationId/members/:memberId", authenticate, adminOnly, async (req, res) => {
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
      return res.status(403).json({ message: "🚫 ليس لديك صلاحية لتعديل الأعضاء!" });
    }

    const member = association.members.find((m) => m.userId.toString() === memberId);
    if (!member) {
      return res.status(404).json({ message: "🚫 العضو غير موجود!" });
    }

    member.status = status;
    await association.save();

    res.status(200).json({ message: `تم ${status === "approved" ? "قبول" : "رفض"} طلب العضو!` });
  } catch (error) {
    res.status(500).json({ message: "❌ خطأ أثناء تعديل العضو", error: error.message });
  }
});

// ✅ حذف جمعية (Admin Only)
router.delete("/:associationId", authenticate, adminOnly, async (req, res) => {
  try {
    const { associationId } = req.params;
    const userId = req.user.userId;

    const association = await Association.findById(associationId);
    if (!association) {
      return res.status(404).json({ message: "الجمعية غير موجودة!" });
    }

    if (association.admin.toString() !== userId) {
      return res.status(403).json({ message: "🚫 ليس لديك صلاحية لحذف هذه الجمعية!" });
    }

    await Association.findByIdAndDelete(associationId);
    res.status(200).json({ message: "✅ تم حذف الجمعية بنجاح!" });
  } catch (error) {
    res.status(500).json({ message: "❌ خطأ أثناء حذف الجمعية", error: error.message });
  }
});

module.exports = router;
