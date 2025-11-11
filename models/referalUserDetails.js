const mongoose = require('mongoose')

const referalUserDetailsSchema = new mongoose.Schema({
    userId:{type: mongoose.Schema.Types.ObjectId,required: true },
    referalBy:{type: mongoose.Schema.Types.ObjectId,required: true },
},{timestamps:true})

const referalUserDetailsModel = mongoose.model("referal_user_details",referalUserDetailsSchema)
module.exports = referalUserDetailsModel