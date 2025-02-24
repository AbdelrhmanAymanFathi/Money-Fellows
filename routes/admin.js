const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Association = require("../models/Association");
require("dotenv").config();

const router = express.Router();

// بيانات تسجيل الدخول للمدير
const ADMIN_CREDENTIALS = { email: "admin", password: "AdminAdmin" };

// تسجيل دخول المدير
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("🔍 محاولة تسجيل الدخول:", { email, password });

  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, { expiresIn: "2h" });
    console.log("✅ تسجيل الدخول ناجح!");
    return res.status(200).json({ message: "تم تسجيل الدخول بنجاح", token });
  }

  console.log("❌ تسجيل الدخول فشل!");
  return res.status(401).json({ message: "❌ بيانات تسجيل الدخول غير صحيحة!" });
});

// استرجاع جميع المستخدمين (بدون كلمة المرور)
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "خطأ في جلب المستخدمين", error });
  }
});

// استرجاع جميع الجمعيات
router.get("/associations", async (req, res) => {
  try {
    const associations = await Association.find();
    res.status(200).json(associations);
  } catch (error) {
    res.status(500).json({ message: "خطأ في جلب الجمعيات", error });
  }
});

// إضافة جمعية جديدة
router.post("/associations", async (req, res) => {
  try {
    const { name, amount } = req.body;
    console.log("📌 بيانات الجمعية الجديدة:", { name, amount });

    const newAssociation = new Association({ name, amount });
    await newAssociation.save();

    console.log("✅ تم إضافة الجمعية بنجاح!");
    res.status(201).json({ message: "تم إضافة الجمعية بنجاح!" });
  } catch (error) {
    console.error("❌ خطأ أثناء إضافة الجمعية:", error);
    res.status(500).json({ message: "خطأ أثناء إضافة الجمعية", error });
  }
});

module.exports = router;
