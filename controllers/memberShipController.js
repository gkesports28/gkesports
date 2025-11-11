const { default: mongoose } = require("mongoose")
const memberModel = require("../models/memberShipModel")
const LoginModule = require("../models/userModel");
const { deductFundService, addFundService, refundService } = require("../services/walletService");
const { login } = require("./authController");
function randomWordCreator() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomWord = '';
    for (let i = 0; i < 12; i++) {
        randomWord += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return randomWord;
}



exports.addMemberShipRequist = async (req, res) => {
    try {
        const userId = req.user.id;
        const data = req.body;
        const addData = {
            userId: userId,
            name: data.name,
            address: data.address,
            mobileNumber: data.mobileNumber,
            state: data.state,
            email: data.email,
            amount: data.amount,
            memberCode: randomWordCreator(),
        };

         console.log(data, "data");
        let userFind = await memberModel.findOne({ userId: userId });
   
        if (userFind) {
            return res.json({
                status: "fail",
                message: "user already exists",
            });
        }

        const saveData = await memberModel.create(addData);
        await deductFundService(userId, req.body.amount, "Membership Payment Paid");
        if (saveData) {
            return res.json({
                status: "success",
                message: "add success",
            });
        } else {
            return res.json({
                status: "fail",
                message: "failed to add data",
            });
        }
    } catch (error) {
        
        console.log(error);
        return res.json({
            status: "fail",
            error: error.message,
        });
    }
};


exports.getMemberShipRequist = async (req, res) => {
    const { search,  status,date } = req.query;
 
    try {
      // Build the MongoDB query object
      let query = {approvel:"pending"};
      
      if (date&&date!="")  {
        query.createdAt ={ $gte: new Date(date), $lt: new Date(date).setDate(new Date(date).getDate() + 1)}; // Match any type in the array (e.g., ['solo', 'duo'])
      }
  
      if (status&&status!="") {
        query.approvel = status; // Match any status in the array (e.g., ['past', 'upcoming'])
      }
      if (search) query.title = new RegExp(search, "i");
      const membershipRequests=await memberModel.find(query).populate({path:"userId",model:LoginModule}).sort({ createdAt: -1 });
      if (membershipRequests.length > 0) {
        res.json({
          status: "success",
          message: "Get success",
          data: membershipRequests,
        });
      } else {
        res.json({
          status: "fail",
          data: [],
          message: "No Requests found",
        });
      }
    } catch (error) {
      res.json({
        status: "error",
        message: "Error fetching Requests",
        error: error.message,
      });
    }
};

exports.getMembersJoinedOfMemberedUser = async (req, res) => {
    try {
        console.log(req.user, "request");
        const userId = req.user.id;
        console.log(userId, "user");
        const mmeberedUser = await memberModel.findOne({ userId }).populate({ path: "members.userId", model: LoginModule });
        console.log(mmeberedUser);
        return res.status(200).json({ status: "success", message: "Members List found successfully", data: mmeberedUser?.members || [] });
    } catch (e) {
        console.log(e);
        res.status(500).json({ status: "error", message: "Internal Server Error", error: e.message });
    }
};



exports.updateStatus = async (req, res) => {
    try {
        const id = req.params.id
        const { status ,approvel} = req.body
       
        const updateData = await memberModel.findOneAndUpdate({ _id: id }, { status: status,approvel:approvel })
        if(approvel=="rejected"){
            await refundService(updateData.userId, updateData.amount, "Membership Amount Refunded by Admin ");
        }
        if (updateData) {
            res.json({
                status: "success",
                message: "update success"
            })
        } else {
            res.json({
                status: "fail",
            })
        }
    } catch (error) {
        res.json({
            error
        })
    }
}


exports.deleteMember = async (req, res) => {
    try {
        const memberId = req.params.id
        const deleteData = await memberModel.deleteOne({ _id: memberId })
        if (deleteData.deletedCount > 0) {
            res.json({
                status: "success",
                message: "delete success"
            })
        } else {
            res.json({
                status: "fail",
            })
        }
    } catch (error) {
        res.json({
            error
        })
    }
}


exports.getSingleMember = async (req, res) => {
    try {
        const userId = req.user.id
        const findData = await memberModel.findOne({ userId: userId })

        if (findData.status == true) {
            res.json({
                status: "success",
                message: "get success",
            })
        } else {
            res.json({
                status: "fail",
                message: "No a member found"
            })
        }
    } catch (error) {
        res.json({
            error
        })
    }
}


exports.getMembers=async(req,res)=>{
    try {
        const query={approvel:"approved"};
        const {search}=req.query;
        if(search){
           query.$or=[{userName:{$regex:search,$options:"i"}},{email:{$regex:search,$options:"i"},firstName:{$regex:search,$options:"i"},lastName:{$regex:search,$options:"i"}}]
        }
         const members=await memberModel.find(query).populate({path:"userId",model:LoginModule}).populate({path:"members.userId",model:LoginModule}).sort({createdAt:-1});
    //     const members=await memberModel.aggregate([
    //     {
    //         $lookup: {
    //             from: "logins",
    //             localField: "userId",
    //             foreignField: "_id",
    //             as: "user",
    //         },
    //         $lookup: {
    //             from: "logins",
    //             localField: "members.userId",
    //             foreignField: "_id",
    //             as: "user",
    //         },
    //     },
    //     {
    //         $unwind: "$user",
    //     },{
    //         $match:query
    //     }
    // ]);
    console.log(members,"members");
        res.json({
            status:"success",
            message:"get success",
            data:members
        })
    }
     catch (error) {
        console.log(error)
        res.json({
            error
        })
    }
}



exports.allMembersGet = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);

        const memberList = await memberModel.aggregate([
            {
                $match: { userId: userId }
            },
            {
                $unwind: "$members"
            },
            {
                $lookup: {
                    from: "logins",
                    localField: "members.userId",
                    foreignField: "_id",
                    as: "memberDetails"
                }
            },
            {
                $unwind: {
                    path: "$memberDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
        ]);

        res.status(200).json({ success: true, data: memberList });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};







exports.addAndFind = async (req, res) => {
    try {
        const memberId = req.body.memberId
        const userId = req.user.id
        const findData = await memberModel.findOne({ memberId: memberId, userId: userId })
        if (findData) {
            res.json({
                status: "fail",
                message: "Already Added"
            })
        } else {
            const addData = new memberModel({
                memberId: memberId,
                userId: userId
            })
            const saveData = await addData.save()
            if (saveData) {
                res.json({
                    status: "success",
                    message: "add success"
                })
            } else {
                res.json({
                    status: "fail",
                })
            }
        }
    } catch (error) {
        res.json({
            error
        })
    }
}


exports.getMemberCode = async (req, res) => {
    try {
        const userId = req.user.id;
        let memberCode = await memberModel.findOne({ userId: userId }, {
            memberCode: 1,
            totalAmount: 1,
            withdrawAvailableAmount: 1
        })
        res.json({
            status: "success",
            data: memberCode,
        })
    } catch (error) {
        res.json({
            error
        })
    }
}





exports.getAllUsers = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);

        const allDataGet = await memberModel.aggregate([
            {
                $match: { userId: userId }
            },
            {
                $unwind: "$members"
            },
            {
                $lookup: {
                    from: "logins",
                    localField: "members.userId",
                    foreignField: "_id",
                    as: "userData"
                }
            },
            {
                $unwind: {
                    path: "$userData",
                }
            },
            {
                $addFields: {
                    "members.userData": "$userData"
                }
            },
            {
                $group: {
                    _id: "$_id",
                    userId: { $first: "$userId" },
                    name: { $first: "$name" },
                    address: { $first: "$address" },
                    mobileNumber: { $first: "$mobileNumber" },
                    state: { $first: "$state" },
                    email: { $first: "$email" },
                    memberCode: { $first: "$memberCode" },
                    status: { $first: "$status" },
                    members: { $push: "$members" }
                }
            }
        ]);
        const [data] = allDataGet
        res.status(200).json({
            status: "success",
            message: "Data fetched successfully",
            data: data
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "error",
            message: "Error fetching data",
            error: error.message
        });
    }
};

exports.getUsers=async (req,res)=>{
    try {
        const users=await LoginModule.find({}).select("firstName lastName email")
        res.json({
            status:"success",
            data:users
        })
    } catch (error) {
        res.json({
            error
        })
    }
}

exports.filterDateWise = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const { startDate } = req.query;

        const startOfDay = new Date(startDate);
        if (isNaN(startOfDay.getTime())) {
            return res.status(400).json({ success: false, message: "Invalid start date" });
        }

        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date(startOfDay);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const allDataGet = await memberModel.aggregate([
            {
                $match: { userId: userId }
            },
            {
                $unwind: "$members"
            },
            {
                $match: {
                    "members.createdAt": {
                        $gte: new Date(`${startDate}T00:00:00.000Z`),
                        $lt: new Date(`${startDate}T23:59:59.999Z`),
                    }
                }
            },
            {
                $lookup: {
                    from: "logins",
                    localField: "members.userId",
                    foreignField: "_id",
                    as: "userData"
                }
            },
            {
                $unwind: {
                    path: "$userData",
                }
            },
            {
                $addFields: {
                    "members.userData": "$userData"
                }
            },
            {
                $group: {
                    _id: "$_id",
                    userId: { $first: "$userId" },
                    name: { $first: "$name" },
                    address: { $first: "$address" },
                    mobileNumber: { $first: "$mobileNumber" },
                    state: { $first: "$state" },
                    email: { $first: "$email" },
                    memberCode: { $first: "$memberCode" },
                    totalAmount: { $first: "$totalAmount" },
                    withdrawAvailableAmount: { $first: "$withdrawAvailableAmount" },
                    status: { $first: "$status" },
                    members: { $push: "$members" }
                }
            }
        ]);
        res.json({ success: true, data: allDataGet });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};



exports.adminFilterDateWise = async (req, res) => {
    try {
        const date = req.params.date;


        

        const allDataGet = await memberModel.aggregate([
            {
                $unwind: "$members"
            },
            {
                $match: {
                    "members.createdAt": {
                        $gte: new Date(`${date}T00:00:00.000Z`),
                        $lt: new Date(`${date}T23:59:59.999Z`),
                    }
                }
            }
        ]);

        res.json({ success: true, data: allDataGet });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}


exports.filterDateWiseRequiest = async (req, res) => {
    try {
        const { date } = req.params;
        
        const memberFilter = await memberModel.find({ createdAt: {
            $gte: new Date(`${date}T00:00:00.000Z`),
            $lt: new Date(`${date}T23:59:59.999Z`),
        } });

        res.json({ success: true, data: memberFilter });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}