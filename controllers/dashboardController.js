const LoginModule = require("../models/userModel")
const TournamentModel=require("../models/TournamentModel")
const EsportsModel=require("../models/MapModel")
const memberShipModel=require("../models/memberShipModel")
const payoutModel = require("../models/payoutModel")
const paymentModel = require("../models/paymentModel")
exports.getStats=async(req,res)=>{
    const totalUsers=await  LoginModule.countDocuments()
    const totalTournaments=await TournamentModel.countDocuments()
    const totalMaps=await EsportsModel.countDocuments()
    const totalMembers=await memberShipModel.countDocuments();
    const stats={totalUsers,totalTournaments,totalMaps,totalMembers}
    res.json({status:"success",message:"stats",data:stats})
}

exports.getTotalPayments = async (req, res) => {
    try {
        // Fetch all successful transactions
        const successfulPayments = await paymentModel.find({ status: 'success' }).populate({path:"userId",model:LoginModule,select:"firstName lastName"}).sort({date:-1});
        
        // Calculate total amount paid
        const totalAmount = successfulPayments.reduce((sum, payment) => sum + payment.amount, 0);

        res.status(200).json({
            totalAmountPaid: totalAmount,
            successfulTransactions: successfulPayments
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}

// Controller to get total payout and total successful payout
exports.getTotalPayouts = async (req, res) => {
    try {
        const successfulPayouts = await payoutModel.find({ status: 'success' })
            .populate({
                path: "userId",
                model: LoginModule,
                select: "firstName lastName"
            })
            .sort({ createdAt: -1 }); // corrected field name

        const totalPayoutAmount = successfulPayouts.reduce((sum, payout) => {
            return sum + (Number(payout.amount) || 0);
        }, 0);

        res.status(200).json({
            totalPayoutAmount,
            successfulPayouts
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};




