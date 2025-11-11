const mongoose = require('mongoose')

const withdrawRequestSchema = new mongoose.Schema({
    userId:{type: mongoose.Schema.Types.ObjectId,required: true },
    amount:{type:Number,required:true},
    status:{type:String,enum:["approved","rejected","pending"],required:true},
},{timestamps:true})


const WithdrawRequestModel = mongoose.model("WithdrawRequest",withdrawRequestSchema)
module.exports = WithdrawRequestModel