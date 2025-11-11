const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    balance: { type: Number, default: 0 },
    winningBalance: { type: Number, default: 0 },
    bonusBalance: { type: Number, default: 0 },
    depositBalance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const walletModel = mongoose.model("wallet", walletSchema);
module.exports = walletModel;
