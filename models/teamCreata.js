const mongoose = require('mongoose')

const teamSchema = new mongoose.Schema({
    userId:{type: mongoose.Schema.Types.ObjectId,required: true },
    tournamentId:{type: mongoose.Schema.Types.ObjectId,required: true },
    teamName:{type: String, required: true},
    playerId:{type: mongoose.Schema.Types.ObjectId,required: true },
    gameLevel:{type: Number, required: true},
    mapDownload:{type:Boolean},

},{timestamps:true})


const teamModel = mongoose.model("team_create",teamSchema)
module.exports = teamModel