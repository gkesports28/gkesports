const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
    oldUserAmount: { type: Number, required: true },
    newUserAmount: { type: Number, required: true }
}, { timestamps: true });

const ReferralModel = mongoose.model('Referral', referralSchema);
module.exports = ReferralModel;



// const mongoose = require('mongoose');

// const referralSchema = new mongoose.Schema({
//     referralAmount:{type:Number,required:true},
// },{timestamps:true}) 

// const ReferralModel = mongoose.model('Referral', referralSchema);
// module.exports = ReferralModel;