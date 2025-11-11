const WinnerModel = require("../models/winnerModel")
const TournamentModel = require("../models/TournamentModel")
const WeeklyWinnerModel = require("../models/WeeklyWinnerModel");
const JoinGameMode = require("../models/JoinGameModel");
const LoginModule = require("../models/userModel");
exports.assignWinners = async (req, res) => {
    try {
        const { tournamentId } = req.params;
        const winners = req.body; // 'winners' is an array of { participantId, position, kills }

        // Fetch the tournament
        const tournament = await TournamentModel.findById(tournamentId);

        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        // Check if the tournament has ended
        // if (tournament.status == 'live' || tournament.status == 'upcoming') {
        //     return res.status(400).json({ status: "fail", message: 'Cannot assign winners to a live or upcoming tournament' });
        // }

        // Prepare the winner list with prize assignment
        const winnerList = winners.map(winner => {
            // Find the prize range for the winner's position
            const prizeDetail = tournament.prizeDetail.find(prize =>
                winner.position >= prize.minPosition &&
                (!prize.maxPosition || winner.position <= prize.maxPosition)
            );
            const killPoints = winner.kill * tournament.killPoint;  // Assuming 'killPoint' is the value for points per kill in the tournament.
            
            const totalPrize = (prizeDetail ? prizeDetail.prize :0)+ killPoints;
            return {
                participantId: winner.participantId,
                position: winner.position,
                prize: totalPrize,  // Assign prize if found, otherwise 0
                kill: winner.kill || 0
            };
        });

        // Check if the winners already exist for this tournament
        let existingWinners = await WinnerModel.findOne({ tournamentId: tournamentId });

        if (existingWinners) {
            // If winners already exist, update the winnerList
            existingWinners.winnerList = winnerList;
            await existingWinners.save();

            return res.status(200).json({
                status: "success",
                message: 'Winners updated successfully',
                data: existingWinners
            });
        } else {
            // If no winners exist, create a new document in WinnerModel
            const winnerDoc = new WinnerModel({
                tournamentId: tournamentId,
                winnerList: winnerList
            });

            // Save the new winners' document
            await winnerDoc.save();

            return res.status(200).json({
                status: "success",
                message: 'Winners assigned successfully',
                data: winnerDoc
            });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server error', error });
    }
};
exports.getWinners = async (req, res) => {
    try {
        const {tournamentId}=req.params;
        const foundedWinners=await WinnerModel.findOne({tournamentId:tournamentId}).populate({path:'winnerList.participantId',model:JoinGameMode,populate:{path:'userId',model:LoginModule}})
        
            if(!foundedWinners)
                return res.status(200).json({status:"fail",message:"Error in finding winners"});
           
            return res.status(200).json({status:"success", message: 'Winners Found successfully', data:foundedWinners.winnerList }); 
            
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Server error', error });
    }
}
exports.addWeeklyWinner = async(req,res)=>{
    try {
        const data = req.body
        const objData = {
            userId:data.userId,
            position:data.position,
            prize:data.prize,
        }
        const existingWinner=await WeeklyWinnerModel.findOne({
            $or: [
              { userId: data.userId },
              { position: data.position }
            ]
          })
        if(existingWinner){
            return res.json({
                status:"fail",
                message:"User already exists"
            })
        }
        const addData = await WeeklyWinnerModel.create(objData)
        if(addData){
            res.json({
                status:"success",
                message:"Winner added successfully"
            })
        }else{
            res.json({
                status:"fail",
                message:"Error in adding winner"
            })
        }
    } catch (error) {
        res.json({
            status:"error",
            message:"Error in adding winner",
            error:error.message
        })
    }
}

exports.removeWeeklyWinner = async(req,res)=>{
    try {
        const {id} = req.params
        const removeData = await WeeklyWinnerModel.deleteOne({_id:id})
        if(removeData){
            res.json({
                status:"success",
                message:"Winner removed successfully"
            })
        }else{
            res.json({
                status:"fail",
                message:"Error in removing winner"
            })
        }
    } catch (error) {
        res.json({
            status:"error",
            message:"Error in removing winner",
            error:error.message
        })
    }
}
exports.editWeekyWinner = async(req,res)=>{
    try {
        const {id} = req.params
        const data = req.body
        const objData = {
            userId:data.userId,
            position:data.position,
            prize:data.prize,
        }
        const editData = await WeeklyWinnerModel.findByIdAndUpdate(id,objData)
        if(editData){
            res.json({
                status:"success",
                message:"Winner edited successfully"
            })
        }else{
            res.json({
                status:"fail",
                message:"Error in editing winner"
            })
        }
        }
    catch (error) {
        res.json({
            status:"error",
            message:"Error in editing winner",
            error:error.message
        })
    }
}
exports.getWeeklyWinners = async (req, res) => {
    try {
        const getallWinner = await WeeklyWinnerModel.find().populate({path:'userId',model:LoginModule}).sort({position:1});
        console.log(getallWinner)

        if (getallWinner.length > 0) {
            res.json({
                status: "success",
                message: "Data retrieved successfully",
                data: getallWinner
            });
        } else {
            res.json({
                status: "fail",
                message: "No Data Found"
            });
        }
    } catch (error) {
        res.json({
            status: "error",
            message: "Something went wrong",
            error: error.message
        });
    }
};
