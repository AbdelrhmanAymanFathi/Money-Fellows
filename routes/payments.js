const express = require("express");
const Payment = require("../models/Payment");
const { authenticate, adminOnly } = require("../middlewares/authMiddleware"); // ✅ FIXED

console.log("🛠️ Debug: Imported authenticate & adminOnly:", { authenticate, adminOnly });

const router = express.Router();

// ✅ Debugging: Ensure Router is Defined
console.log("🛠️ Debug: Router Initialized");

// ✅ Create a New Payment
router.post("/", authenticate, async (req, res) => {
  try {
    console.log("📥 Received Request Body:", req.body);

    const { amount, userId } = req.body;

    if (!amount || !userId) {
      console.log("⚠️ Missing required fields!");
      return res.status(400).json({ message: "All fields are required" });
    }

    const newPayment = new Payment({ amount, userId });
    await newPayment.save();

    console.log("✅ Payment Created Successfully!");
    res.status(201).json({ message: "Payment created successfully!", payment: newPayment });
  } catch (error) {
    console.error("❌ Error Creating Payment:", error);
    res.status(500).json({ message: "Error creating payment", error });
  }
});

// ✅ Fetch All Payments
router.get("/", authenticate, async (req, res) => {
  try {
    const payments = await Payment.find();
    res.status(200).json(payments);
  } catch (error) {
    console.error("❌ Error Fetching Payments:", error);
    res.status(500).json({ message: "Error fetching payments", error });
  }
});

module.exports = router;
