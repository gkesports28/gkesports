const mongoose = require("mongoose")
const myLeaguesSchema = mongoose.Schema({
    joinId:{type:mongoose.Schema.Types.ObjectId,required:true},
    tournamentId:{type:mongoose.Schema.Types.ObjectId,required:true,ref:"Tournament"},
    userId:{type:mongoose.Schema.Types.ObjectId,required:true},
    // status:{type:String,enum:["live","past","upcoming"],required:true},
    teamId:{type:Number,default:0},
    teamName:{type:String,default:null},
    teamMembers:{type: [{
        teamMemberId: { type: mongoose.Schema.Types.ObjectId, required: true },
    }],defauly:[]},
    joinDate:{type:Date}

},{timestamps:true})


const MyLeaguesModel = mongoose.model("my_leagues",myLeaguesSchema)
module.exports = MyLeaguesModel