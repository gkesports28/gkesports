const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  amount: { type: Number, required: true },
  paymentId: { type: String },
  orderId: { type: String },
  status: {
    type: String,
    enum: ["pending", "success", "failed", "cancelled", "error", "ACTIVE"],
    default: "pending",
  },
  date: { type: Date, default: Date.now },
});

const paymentModel = mongoose.model("payment", paymentSchema);
module.exports = paymentModel;
