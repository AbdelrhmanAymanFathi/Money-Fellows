const express = require("express");
const { authenticate, adminOnly } = require("../middleware/auth");
const User = require("../models/User");
const Association = require("../models/Association");

const router = express.Router();

// ✅ Protect admin dashboard
router.get("/dashboard", authenticate, adminOnly, (req, res) => {
  res.json({ message: "🚀 مرحبًا بك في لوحة تحكم المسؤول!", adminId: req.user.userId });
});

// ✅ Get all users (Admin Only)
router.get("/users", authenticate, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "❌ خطأ في جلب المستخدمين", error });
  }
});

// ✅ Get all associations (Admin Only)
router.get("/associations", authenticate, adminOnly, async (req, res) => {
  try {
    const associations = await Association.find();
    res.status(200).json(associations);
  } catch (error) {
    res.status(500).json({ message: "❌ خطأ في جلب الجمعيات", error });
  }
});

// ✅ Create a new association (Admin Only)
router.post("/associations", authenticate, adminOnly, async (req, res) => {
  try {
    const { name, amount } = req.body;
    console.log("📌 بيانات الجمعية الجديدة:", { name, amount });

    const newAssociation = new Association({ name, amount });
    await newAssociation.save();

    console.log("✅ تم إضافة الجمعية بنجاح!");
    res.status(201).json({ message: "تم إضافة الجمعية بنجاح!" });
  } catch (error) {
    console.error("❌ خطأ أثناء إضافة الجمعية:", error);
    res.status(500).json({ message: "❌ خطأ أثناء إضافة الجمعية", error });
  }
});

module.exports = router;
