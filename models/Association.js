const mongoose = require("mongoose");

const AssociationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true }
});

module.exports = mongoose.model("Association", AssociationSchema);
