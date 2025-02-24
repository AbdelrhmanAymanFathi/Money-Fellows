require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
const PORT = 5500; 
const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/fundcircle"; 

const cors = require("cors");

// ✅ Middleware (Only Define express.json() Once)
app.use(express.json());
app.use(cors());

// ✅ Connect to MongoDB
mongoose
  .connect(mongoURI, {})
  .then(() => console.log("✅ متصل بقاعدة البيانات بنجاح!"))
  .catch((err) => console.error("❌ فشل الاتصال بقاعدة البيانات:", err));

// ✅ Routes
app.get("/", (req, res) => {
  res.send("🚀 السيرفر يعمل بنجاح!");
});

app.use("/auth", require("./routes/auth"));
app.use("/associations", require("./routes/associations"));
app.use("/associations", require("./routes/payments")); 
app.use("/admin", require("./routes/admin"));

// ✅ Print All Routes
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    console.log(`[ '${middleware.route.path}' ]`);
  }
});

// ✅ Start the Server
app.listen(PORT, () => {
  console.log(`🚀 السيرفر شغال على http://localhost:${PORT}`);
});
