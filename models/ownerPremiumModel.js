const mongoose = require('mongoose')

const ownerPremiomSchema = new mongoose.Schema({
    userId:{type: mongoose.Schema.Types.ObjectId,required: true },
    amount:{type:Number,required:true},
},{timestamps:true})


const ownerPremiomModel = mongoose.model("owner_premium",ownerPremiomSchema)
module.exports = ownerPremiomModel