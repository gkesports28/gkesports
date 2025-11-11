const mongoose = require('mongoose')

const recentTransactionSchema = new mongoose.Schema({
    userId:{type: mongoose.Schema.Types.ObjectId,required: true},
    amount:{type:Number},
    date:{type:Date},
    type:{type:String,enum:["credit","debit"]},
    tournamentId:{type: mongoose.Schema.Types.ObjectId},
},{timestamps:true})

const RecenetTransactionModel = mongoose.model("recent_transaction",recentTransactionSchema)
module.exports = RecenetTransactionModel   