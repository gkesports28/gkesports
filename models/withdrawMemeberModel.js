const mongoose = require('mongoose')

const memberAmountSchema = new mongoose.Schema({
    memberId:{type: mongoose.Schema.Types.ObjectId,required: true },
    amount:{type:Number,required:true},
    status:{type:Boolean,enum:[true,false],default:false},
},{timestamps:true})


const withdrawMemberModel = mongoose.model("withdraw_requist",memberAmountSchema)
module.exports = withdrawMemberModel