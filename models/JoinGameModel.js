const mongoose = require('mongoose')

const joinGameSchema = new mongoose.Schema({
    userId:{type: mongoose.Schema.Types.ObjectId,required: true},
    tournamentId:{type: mongoose.Schema.Types.ObjectId,required: true},
    userName:{type: String, required: true},
    teamId: { type: Number},
    teamName:{type: String,default:null},
    teamMembers:[{
        userId:{type: mongoose.Schema.Types.ObjectId},
        userName:{type: String},
        gameId:{type: Number},
        gameLevel:{type: Number},
        mapDownload:{type:Boolean},
    }],
    gameId:{type: Number, required: true},
    gameLevel:{type: Number, required: true},
    mapDownload:{type:Boolean},
    joinDate: { type: Date, default: Date.now }
},{timestamps:true})

const JoinGameMode = mongoose.model("join_game",joinGameSchema)
module.exports = JoinGameMode