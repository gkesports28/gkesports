const MyLeaguesModel = require("../models/myLeaguesModel");
exports.updateCustom = async(req,res)=>{
        try{
            const id = req.params.id;
            const data =req.body;
            console.log(data)
            let findByID = await MyLeaguesModel.findOne({ _id: id });
            findByID.customId = data.customId,
            findByID.custompassword = data.custompassword
            const update = await findByID.save();
            if(update){
                res.json({
                    status:"success",
                    message:"update success"
                })
            }else{
                res.json({
                    status:"fail",
                })
            }
        }
        catch(error){
            console.log(error)
            res.json({
                error
            })
        }
    }

    exports.nullCustomValue = async(req,res)=>{
        try{
            const id = params.id;
            let findByID = await MyLeaguesModel.findOne({ _id: id });
            findByID.customId = null
            findByID.custompassword = null
            const update = await findByID.save();
            if(update){
                res.json({
                    status:"success",
                    message:"update success"
                })
            }else{
                res.json({
                    status:"fail",
                })
            }
        }
        catch(error){
            res.json({
                error
            })
        }
    }