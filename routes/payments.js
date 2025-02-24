const express = require("express");
const Payment = require("../models/Payment");
const Association = require("../models/Association");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// ✅ إضافة دفعة جديدة
router.post("/:associationId", authMiddleware, async (req, res) => {
  try {
    const { associationId } = req.params;
    const { amount } = req.body;
    const userId = req.user.userId;

    // التأكد من أن الجمعية موجودة
    const association = await Association.findById(associationId);
    if (!association) {
      return res.status(404).json({ message: "الجمعية غير موجودة!" });
    }

    // التحقق مما إذا كان المستخدم عضوًا في الجمعية
    const isMember = association.members.some((m) => m.userId.toString() === userId && m.status === "approved");
    if (!isMember) {
      return res.status(403).json({ message: "❌ لا يمكنك الدفع لأنك لست عضوًا مقبولًا في الجمعية!" });
    }

    // إنشاء عملية الدفع
    const payment = new Payment({ userId, associationId, amount, status: "pending" });
    await payment.save();

    res.status(201).json({ message: "✅ تم تسجيل الدفعة بنجاح، في انتظار الموافقة!" });
  } catch (error) {
    res.status(500).json({ message: "❌ حدث خطأ أثناء الدفع!", error: error.message });
  }
});

// ✅ عرض جميع المدفوعات لجمعية معينة
router.get("/:associationId", authMiddleware, async (req, res) => {
  try {
    const { associationId } = req.params;

    const payments = await Payment.find({ associationId }).populate("userId", "name email");

    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: "❌ حدث خطأ أثناء جلب المدفوعات!", error: error.message });
  }
});

// ✅ تحديث حالة الدفعة إلى "completed"
router.put("/:paymentId/complete", authMiddleware, async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "❌ الدفعة غير موجودة!" });
    }

    payment.status = "completed";
    await payment.save();

    res.status(200).json({ message: "✅ تم تأكيد الدفعة بنجاح!" });
  } catch (error) {
    res.status(500).json({ message: "❌ حدث خطأ أثناء تحديث الدفعة!", error: error.message });
  }
});

module.exports = router;
