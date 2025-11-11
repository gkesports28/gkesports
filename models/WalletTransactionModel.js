const mongoose = require('mongoose')

const walletdata = new mongoose.Schema({
    tournamentId:{type: mongoose.Schema.Types.ObjectId },
    amount:{type: Number,required: true },
    depositBalance:{type: Number },
    type:{type: String,required: true, enum:["credit","debit"]},
    date:{type: Date,required: true },
    description:{type: String},
},{timestamps:true})

const withDrawTransactionSchema=new mongoose.Schema({
    transactionId:{type:String},
    amount:{type:Number},
    method: { type: String, required: true },
    beneficiaryId:{type:String},
    status:{type:String,enum:["PENDING","REJECTED","SUCCESS","FAILED"]},
    statusDescription:{type:String},
},{timestamps:true})

const addFundTransactionSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: false,
        unique: false
    },
  
    amount: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ['SUCCESS', 'FAILED', 'PENDING']  // Define possible statuses
    },
    paymentTime: {
        type: Date,
        required: true
    },
    paymentMethod: {
        type: String,
        required: false
    },
    customerEmail: {
        type: String,
        required: false
    },
    customerPhone: {
        type: String,
        required: false
    },
}, { timestamps: true });

const walletTransaction = new mongoose.Schema({
    userId:{type: mongoose.Schema.Types.ObjectId,required: true },
    walletId:{type: mongoose.Schema.Types.ObjectId},
    walletdata:[walletdata],
    withdrawalTransactions: [withDrawTransactionSchema],  // Renamed withdrawTransactions to withdrawalHistory
    addFundTransactions: [addFundTransactionSchema] 
},{timestamps:true})



const walletTransactionModel = mongoose.model("walletTransaction",walletTransaction)
module.exports = walletTransactionModel