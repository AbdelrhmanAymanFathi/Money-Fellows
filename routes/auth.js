const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

const router = express.Router();

// Middleware للتحقق من التوكن
const authenticate = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "يجب تسجيل الدخول للوصول إلى هذه الصفحة" });
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "التوكن غير صالح" });
  }
};

// تسجيل مستخدم جديد
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // التأكد من عدم وجود المستخدم مسبقًا
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "البريد الإلكتروني مستخدم بالفعل" });
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // إنشاء المستخدم الجديد
    const newUser = new User({ name, email, password: hashedPassword, phone });
    await newUser.save();

    res.status(201).json({ message: "تم التسجيل بنجاح!" });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ ما", error });
  }
});

// تسجيل الدخول
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // البحث عن المستخدم
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "البريد الإلكتروني أو كلمة المرور غير صحيحة!" });
    }

    // التحقق من كلمة المرور
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "البريد الإلكتروني أو كلمة المرور غير صحيحة!" });
    }

    // توليد التوكن
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "متغير البيئة JWT_SECRET غير مضبوط!" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "تم تسجيل الدخول بنجاح!", token });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء تسجيل الدخول!", error });
  }
});

// ✅ استرجاع بيانات المستخدم بناءً على التوكن
router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء جلب بيانات المستخدم", error });
  }
});

module.exports = router;
