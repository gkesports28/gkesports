const { imageUrl } = require("../config/constent")
const EsportsModel = require("../models/MapModel")
const { uploadImageToCloudinary } = require("../utils/cloudinary")

exports.addEsports = async(req,res)=>{
    try {
        const data = req.body
         
    const image = await uploadImageToCloudinary(req.file);

        const objData = {
            gameImage:image,
            title:data.title
        }
        const addData = await EsportsModel.create(objData)
        if(addData){
            res.json({
                status:"success",
                message:"add success"
                
            })
        }else{
            res.json({
                status:"fail",
            })
        }
    } catch (error) {
        res.json({
            error
        })
    }
}


exports.getEsports = async(req,res)=>{
    try {
        let addData = await EsportsModel.find({deletedAt:null}).sort({createdAt:1})
        if(addData.length >0){
            res.json({
                status:"success",
                message:"get success",
                data:addData
            })
        }else{
            res.json({
                status:"success",
                data:addData,
                message:"No Data Found"
            })
        }
    } catch (error) {
        res.json({
            error
        })
    }
}

exports.updateEsports = async(req,res)=>{
    try {
        const data = req.body
        console.log(data);
        const mapId = req.params.mapId
        const image = await uploadImageToCloudinary(req.file);
        const objData = {
            gameImage:image,
            title:data.title
        }
        const update = await EsportsModel.findOneAndUpdate({_id:mapId},objData,{new:true})
        console.log(update)
        if(update){
            res.json({
                status:"success",
                message:"Map Edited Successfuly"
            })
        }else{
            res.json({
                status:"failure",
                message:"Error in updating Map "
            })
        }
    } catch (error) {
        res.json({
            error
        })
    }
}

exports.deleteEsports=async(req,res)=>{
    try{
        const mapId=req.params.mapId; 
        const deletedMap=await EsportsModel.findOneAndUpdate({_id:mapId},{deletedAt:new Date()});
        if(!deletedMap)
            return res.json({status:"failure",message:"Error in deleting map"});
            return res.json({status:"success",message:"Map Deleted Succesfully"});

    }
    catch(e){
        console.log(e);
        return res.json({status:"failure",message:"Internal Server Error",error:e.message})
    }
}