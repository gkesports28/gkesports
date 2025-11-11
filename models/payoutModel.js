const mongoose = require("mongoose");

const payoutSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    amount: { type: Number, required: true },
    cfTransferId: { type: String },
    transferId: { type: String },
    payoutMode: { type: String },

    // ✅ Updated enum with both lowercase + uppercase allowed
    status: {
      type: String,
      enum: [
        "pending",
        "success",
        "failed",
        "rejected",
        "cancelled",
        "error",
        "PENDING",
        "SUCCESS",
        "FAILED",
        "REJECTED",
        "CANCELLED",
        "ERROR",
      ],
      default: "pending",
    },

    pgCharges: { type: Number },
    statusDescription: { type: String },
  },
  {
    timestamps: true,
  }
);

const payoutModel = mongoose.model("payout", payoutSchema);
module.exports = payoutModel;
