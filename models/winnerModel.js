const mongoose = require('mongoose')

const winnerSchema = new mongoose.Schema({
    participantId:{type: mongoose.Schema.Types.ObjectId,ref:'join_game'},
    position:{type:Number , default:0},
    prize:{type:Number , default:0},
    kill:{type:Number,default:0},
},{timestamps:true})


const winnersSchema = new mongoose.Schema({
    tournamentId:{type: mongoose.Schema.Types.ObjectId,required: true },
    winnerList:[winnerSchema],
},{timestamps:true})

const WinnerModel = mongoose.model("winners",winnersSchema)
module.exports = WinnerModel