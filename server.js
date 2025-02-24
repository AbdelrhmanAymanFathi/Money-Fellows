require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
const PORT = 5500; 
const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/fundcircle"; // تأكد من ضبط MONGO_URI
const cors = require("cors");

// Middleware
app.use(express.json());
app.use(cors());

// connect to MongoDB
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ متصل بقاعدة البيانات بنجاح!"))
  .catch((err) => console.error("❌ فشل الاتصال بقاعدة البيانات:", err));

// Routes
app.get("/", (req, res) => {
  res.send("🚀 السيرفر يعمل بنجاح!");
});

app.use("/auth", require("./routes/auth"));
app.use("/associations", require("./routes/associations"));
app.use("/associations", require("./routes/payments")); // ✅ تحميل المدفوعات تحت الجمعيات
app.use("/admin", require("./routes/admin"));

// طباعة كل المسارات الموجودة في السيرفر
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    console.log(`[ '${middleware.route.path}' ]`);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 السيرفر شغال على http://localhost:${PORT}`);
});
