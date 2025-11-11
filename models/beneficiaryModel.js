const mongoose = require('mongoose')
const beneficiarySchema = new mongoose.Schema({
    userId:{type: mongoose.Schema.Types.ObjectId,required: true },
    transfer_mode:{type:String,enum:["upi","banktransfer","paytm"],required: true},
    beneficiary_id:{type:String,required:true },
    beneficiary_name:{type: String, required: true},
    beneficiary_contact_details:{
        type:{
            beneficiary_email:{type: String},
            beneficiary_phone:{type: String},
        }
    },
    beneficiary_status:{type: String},
    added_by:{type: String},
    beneficiary_instrument_details:{
        type:{
            bank_account_number:{type: String},
            bank_ifsc:{type: String},
            vpa:{type: String},
        }
    }

},{timestamps:true})

const beneficiaryModel = mongoose.model("beneficiary",beneficiarySchema);
module.exports = beneficiaryModel