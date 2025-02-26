const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = 5500;

// ✅ Middleware
app.use(express.json());
app.use(cors());

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/fundcircle")
  .then(() => console.log("✅ Connected to Database"))
  .catch((err) => console.error("❌ Database Connection Failed:", err));

// ✅ Routes
app.use("/auth", require("./routes/auth"));
app.use("/associations", require("./routes/associations"));
app.use("/payments", require("./routes/payments")); // ✅ FIXED ROUTE

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
