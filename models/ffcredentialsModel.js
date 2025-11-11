const mongoose = require("mongoose");


const ffCredentialsSchema = new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
    ffData:[{type:{ffUserId:String,ffUserName:String}}],
},{timestamps:true})


const ffCredentialsModel = mongoose.model("ffCredentials",ffCredentialsSchema)   
module.exports = ffCredentialsModel