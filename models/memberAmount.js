const mongoose = require('mongoose')

const memberAmountSchema = new mongoose.Schema({
    shipAmount:{type:Number},
    amount:{type:Number},
},{timestamps:true})

const memberAmountModel = mongoose.model("member_amount",memberAmountSchema)
module.exports = memberAmountModel