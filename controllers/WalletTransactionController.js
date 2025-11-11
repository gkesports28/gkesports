const { default: mongoose } = require("mongoose")
const walletTransactionModel = require("../models/WalletTransactionModel")
const TournamentModel = require("../models/TournamentModel")

exports.getWalletTransaction = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id)
        // console.log(userId)
        const walletTransactionObject=await walletTransactionModel.findOne({userId:userId}).populate({path:'walletdata.tournamentId',model:TournamentModel})
        const walletTransactions = walletTransactionObject.walletdata
        walletTransactions.sort((a,b)=>{
            return new Date(b.date) - new Date(a.date)
        })
        
        if (walletTransactions) {
            res.json({
                status: "success",
                message: "get success",
                data: walletTransactions
            })

        } else {
            res.json({
                status: "fail",
                message: "No Data Found"
            });
        }
    } catch (error) {
        res.json({ error });
    }
};


exports.getWalletAdminTransaction = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.params.userId)
        console.log(userId)
        const getWallet = await walletTransactionModel.aggregate([
            { $match: { userId: userId } },
            { $unwind:"$walletdata" },
            {
                $lookup: {
                    from:"tournaments",
                    localField:"walletdata.tournamentId",
                    foreignField:"_id",
                    as:"tournamentData"
                }
            },
            { $unwind:"$tournamentData" },
            {
                $group: {
                    _id: "$_id",
                    walletdata: { $push: {
                        tournamentName: "$tournamentData.title",
                        walletDetail: "$walletdata"
                    } },
                    // tournamentData: { $first: "$tournamentData" }
                }
            }
           
        ])
        if (getWallet) {
            res.json({
                status: "success",
                message: "get success",
                data: getWallet
            })
        } else {
            res.json({
                status: "fail",
                message: "No Data Found"
            })
        }
    } catch (error) {
        res.json({
            error
        })
    }
}