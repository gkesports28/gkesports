const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["solo", "duo", "squad"], required: true },
    title: { type: String, required: true },
    entryFee: { type: Number, required: true },
    status: {
      type: String,
      enum: ["past", "live", "upcoming"],
      default: "upcoming",
    },
    prizes: { type: Number, required: true },
    killPoint: { type: Number, required: true },
    startTime: { type: Date, required: true },
    totalParticipants: { type: Number, required: true },
    filled: { type: Boolean, default: false },
    totalPlayer: { type: Number, default: 0 },
    customId: { type: Number, default: 0 },
    custompassword: { type: String, default: "" },
    endTime: { type: Date },
    mapId: { type: mongoose.Schema.Types.ObjectId, required: true },
    prizeDetail: [
      {
        minPosition: { type: Number }, 
        maxPosition: { type: Number },
        prize: { type: Number },
      },
    ],
    participants: [{
        userId: { type: mongoose.Schema.Types.ObjectId, required: true },
        gameUserId:{type: Number, required: true},
        gameLevel:{type: Number, required: true},
        gameUserName:{type: String, required: true},
        mapDownload:{type:Boolean},
        joinedAt: { type: Date, default: Date.now },
    }],
    winners: [{
        participantId: { type: mongoose.Schema.Types.ObjectId, ref: 'participants', required: true },
        position: { type: Number, required: true },
        prize: { type: Number, required: true },
        kills: { type: Number, default: 0 }
    }],
    fundsDistributed: { type: Boolean, default: false }
  
  },
  { timestamps: true }
);

const TournamentModel = mongoose.model("Tournament", matchSchema);
module.exports = TournamentModel;
