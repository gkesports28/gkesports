const e = require('cors')
const mongoose = require('mongoose')


const member = new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,required:true},
    amount:{type:Number},
    gamePlay:{type:Number},
},{timestamps:true})


const memberSchema = new mongoose.Schema({
    userId:{type: mongoose.Schema.Types.ObjectId,required: true },
    name:{type:String, required:true},
    address:{type:String, required:true},
    mobileNumber:{type:String, required:true},
    state:{type:String, required:true},
    email:{type:String, required:true},
    memberCode:{type:String},
    totalAmount:{type:Number,default:0},
    withdrawAvailableAmount: { type: Number, default: 0 },
    amount:{type:Number},
    approvel:{type:String,enum:["approved","rejected","pending"],default:"pending"},
    status:{type:Boolean,enum:[true,false],default:false},
    members:[{type:member,default:[]}]
},{timestamps:true})


const   memberModel = mongoose.model("member",memberSchema)
module.exports = memberModel