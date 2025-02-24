const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },  // ✅ Force lowercase
  password: { type: String, required: true },
  phone: { type: String, required: true }
});

module.exports = mongoose.model("User", UserSchema);
