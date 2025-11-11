const mongoose = require('mongoose')

const esportsSchema = mongoose.Schema({
    gameImage:{type:String,required:true},
    title:{type:String},
    deletedAt:{type:Date,default:null}
},{timestamps:true})

const EsportsModel = mongoose.model("map",esportsSchema)
module.exports = EsportsModel