const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // ✅ Remove duplicate import
require("dotenv").config();

const router = express.Router();

// ✅ Middleware to Authenticate User
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

// ✅ Register a New User
router.post("/register", async (req, res) => {
  try {
    console.log("Received Request Body:", req.body); // Debugging

    const { name, username, email, password, phone } = req.body;
    
    // ✅ Check for missing fields
    if (!name || !username || !email || !password || !phone) {
      return res.status(400).json({ message: "All fields are required", receivedData: req.body });
    }

    // ✅ Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // ✅ Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ Create and Save New User
    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
      phone,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "An error occurred", error: error.message });
  }
});

// ✅ Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "البريد الإلكتروني أو كلمة المرور غير صحيحة!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "البريد الإلكتروني أو كلمة المرور غير صحيحة!" });
    }

    // ✅ Include isAdmin in the token payload
    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },  // Add `isAdmin`
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ 
      message: "تم تسجيل الدخول بنجاح!", 
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin  // ✅ Send isAdmin in response
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "حدث خطأ أثناء تسجيل الدخول!", error: error.message });
  }
});



// ✅ Get Logged-in User Data
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
