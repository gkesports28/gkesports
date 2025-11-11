const mongoose =require('mongoose')

const weeklyWinnerSchema = new mongoose.Schema({
    userId:{type: mongoose.Schema.Types.ObjectId,required: true },
    position:{type:Number},
    prize:{type:Number},
   
},{timestamps:true})


const WeeklyWinnerModel = mongoose.model("weeklywinner",weeklyWinnerSchema)
module.exports = WeeklyWinnerModel