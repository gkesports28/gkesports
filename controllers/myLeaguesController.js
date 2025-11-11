const mongoose = require("mongoose");
const MyLeaguesModel = require("../models/myLeaguesModel");
const LoginModule = require("../models/userModel");

const JoinGameMode = require("../models/JoinGameModel");
const TournamentModel = require("../models/TournamentModel");
const EsportsModel = require("../models/MapModel");


exports.getMyLeagues = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);

        const myLeagues = await MyLeaguesModel.aggregate([
            {
                $match: { userId: userId }
            },
            {
                $lookup: {
                    from: "join_games",
                    localField: "joinId",
                    foreignField: "_id",
                    as: "matchData"
                }
            },
            {
                $unwind: "$matchData"
            },
            {
                $lookup: {
                    from: "tournaments",
                    localField: "matchData.tournamentId",
                    foreignField: "_id",
                    as: "tournamentData"
                }
            },
            {
                $unwind: "$tournamentData"
            },
            {
                $project: {
                    matchData: 0
                }
            }
        ]);

        const myLeaguesDetails = await MyLeaguesModel.find(
            { userId: userId },
            { joinId: 0 }
        );
        console.log(myLeaguesDetails);
        const mergedData = myLeagues.map((league, index) => {
            return {
                ...league,
                ...myLeaguesDetails[index]?._doc
            };
        });

        if (mergedData.length > 0) {
            res.json({
                status: "success",
                message: "My Leagues",
                data: mergedData
            });
        } else {
            res.json({
                status: "fail",
                message: "No Leagues Found"
            });
        }
    } catch (error) {
        res.json({
            status: "fail",
            message: error.message
        });
    }
};



exports.getTypeUpdateTypeAccordingTournament = async (req, res) => {
    try {
       

        let findUserLeague = await JoinGameMode.find({userId: req.user.id,})
        .populate({path:'tournamentId',model:TournamentModel,populate:{path:'mapId',model:EsportsModel}})
        .populate({path:'teamMembers.userId',select:'firstName lastName',model:LoginModule});
        
        console.log(findUserLeague,"    findUserLeague   ");

        

        // let updatedLeagues = [];

        // await Promise.all(findUserLeague.map(async (league) => {
        //     let tournamentIdData = await TournamentModel.find({ _id: league.tournamentId });
        //     await Promise.all(tournamentIdData.map(async (tournament) => {
        //         // Determine the status of the league based on tournament timings
        //         if (currentISTDate < tournament.startTime) {
        //             league.status = "upcoming";  // Before the start time
        //         } else if (currentISTDate >= tournament.startTime && currentISTDate < tournament.endTime) {
        //             league.status = "live";  // Between start time and end time
        //         } else if (currentISTDate >= tournament.endTime) {
        //             league.status = "past";  // After the end time
        //         }

        //         // Save the updated league status
        //         await league.save();

        //         // Perform lookup for teamMembers from logins collection
        //         const updatedTeamMembers = await Promise.all(
        //             league.teamMembers.map(async (teamMember) => {
        //                 // Lookup by teamMemberId in logins collection, selecting only firstName and lastName
        //                 const loginData = await LoginModule.findById(teamMember.teamMemberId, 'firstName lastName');
        //                 return {
        //                     ...teamMember._doc,  // Copy teamMember data
        //                     firstName: loginData ? loginData.firstName : null,  // Add firstName
        //                     lastName: loginData ? loginData.lastName : null    // Add lastName
        //                 };
        //             })
        //         );

        //         updatedLeagues.push({
        //             league: {
        //                 ...league._doc,
        //                 teamMembers: updatedTeamMembers // Replace teamMembers with enriched data
        //             },
        //             tournament
        //         });
        //     }));
        // }));

        // console.log(updatedLeagues[0]?.league?.teamMembers?.[0]?.firstName || "No firstName found", "updatedLeagues");

        res.status(200).json({
            status:"success",
            message: 'Leagues Found successfully',
            data:findUserLeague
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
};







// exports.getTypeUpdateTypeAccordingTournament = async (req, res) => {
//     try {

//         const currentUTCDate = new Date();
//         const offset = 5.5 * 60 * 60 * 1000;  
//         const currentISTDate = new Date(currentUTCDate.getTime() + offset);  
//         console.log(currentISTDate);
//         let findUserLeague = await MyLeaguesModel.find({ userId: req.user.id });
//         console.log(findUserLeague);
//         let getTournamentId = findUserLeague.map(async(league) => {
//             let tournamentIdData = await TournamentModel.find({ _id: league.tournamentId, endTime: { $gt: currentISTDate } });
//             let statusUpdateLive = tournamentIdData.map((tournament) => {
//                  if(league.tournamentId.toString() == tournament._id){
//                     findUserLeague = findUserLeague.map((findLeague) => 
//                         findLeague.status = "live"
//                     )
//                  }
//                  await findUserLeague.save()
//             })

//         })
//     } catch (error) {
        
//     }
// }