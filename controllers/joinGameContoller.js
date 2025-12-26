const { default: mongoose } = require("mongoose");
const JoinGameMode = require("../models/JoinGameModel");
const MyLeaguesModel = require("../models/myLeaguesModel");
const walletModel = require("../models/WalletModel");
const walletTransactionModel = require("../models/WalletTransactionModel");
const TournamentModel = require("../models/TournamentModel");
const LoginModule = require("../models/userModel");
const ReferralModel = require("../models/referralModel");
const {
  deductFunds,
  deductFundService,
  bonusFundService,
} = require("../services/walletService");
const memberModel = require("../models/memberShipModel");
const memberAmountModel = require("../models/memberAmount");
const ffCredentialsModel = require("../models/ffcredentialsModel");

function randomNumberFive() {
  return Math.floor(Math.random() * 6) + 1;
}

function generateRandomFiveDigitNumber() {
  let randomNumber = "";
  for (let i = 0; i < 5; i++) {
    randomNumber += randomNumberFive();
  }
  return randomNumber;
}

const fiveDigitNumber = generateRandomFiveDigitNumber();

async function generateUniqueTeamId() {
  let teamId;
  let teamExists;

  do {
    teamId = fiveDigitNumber;
    teamExists = await JoinGameMode.findOne({ teamId: teamId });
  } while (teamExists);

  return teamId;
}

exports.addJoinGameModel = async (req, res) => {
  try {
    const data = req.body;
    const userId = req.user.id;
    console.log(userId, "data");
    const playerLevel = Number(data.gameLevel);
    const tournament = await TournamentModel.findOne({
      _id: data.tournamentId,
    });

    if (!tournament) {
      return res.json({ status: "fail", message: "Tournament not found" });
    }

    if (tournament.status == "past" && tournament.status == "live") {
      return res.json({
        status: "fail",
        message: "Tournament is either live or closed",
      });
    }

    if (isNaN(playerLevel)) {
      return res.json({
        status: "fail",
        message: "Invalid game level, it should be a number",
      });
    }

    const objData = {
      userName: data.userName,
      gameId: data.gameId,
      gameLevel: data.gameLevel,
      mapDownload: data.mapDownload,
      userId: userId,
      tournamentId: data.tournamentId,
      joinDate: new Date(),
    };

    let activeTournaments = await JoinGameMode.findOne({
      userId: userId,
      tournamentId: data.tournamentId,
    });

    if (activeTournaments) {
      return res.json({
        status: "fail",
        message: "You have already joined this tournament",
      });
    }
    const responseData = await deductFundService(
      userId,
      data.balance,
      `For Playing ${tournament.title}`
    );
    console.log(responseData);
    let memberShipModels = await memberModel.find({});
    let memberShipAmountFetch = await memberAmountModel.findOne({});
    console.log(memberShipAmountFetch, "memberShipModels memberShipModels");
    let memberShipUpdateWidrowAmount = await memberModel.find({
      userId: userId,
    });

    await Promise.all(
      memberShipModels.map(async (element) => {
        element.members.forEach((member) => {
          if (member.userId.equals(userId)) {
            member.amount = member.amount + memberShipAmountFetch.shipAmount;
            member.gamePlay = member.gamePlay + 1;
          }
        });
        await element.save();
      })
    );

    let withdrawAvailable = await memberModel.findOne({
      "members.userId": userId,
    });
    console.log(userId, "userId withdrawAvailable withdrawAvailable");
    console.log(withdrawAvailable, "withdrawAvailable withdrawAvailable");

    if (withdrawAvailable) {
      withdrawAvailable.withdrawAvailableAmount =
        withdrawAvailable.withdrawAvailableAmount +
        memberShipAmountFetch.shipAmount;
      withdrawAvailable.totalAmount =
        withdrawAvailable.totalAmount + memberShipAmountFetch.shipAmount;
      await withdrawAvailable.save();
    }

    await JoinGameMode.create(objData);
    tournament.totalPlayer = tournament.totalPlayer + 1;
    await tournament.save();

    let findJoinData = await JoinGameMode.find({ userId: userId });
    console.log(findJoinData, "findJoinData");
    if (findJoinData.length == 1) {
      console.log("true");
      let userFind = await LoginModule.findOne({ _id: userId });
      console.log(userFind);
      if (userFind.referredBy) {
        const referAmount = await ReferralModel.findOne({});
        if (referAmount) {
          const description = `Referral bonus ₹${referAmount.oldUserAmount} for referring ${userFind.firstName}`;
          console.log(description, "Referral Bonus Description");

          await bonusFundService(
            userFind.referredBy,
            referAmount.oldUserAmount,
            description
          );
        }
      }

      // if (userFind.referredBy) {
      //         let referAmount = await ReferralModel.findOne({});
      //         let description = `Referal bonus ${referAmount.referralAmount} of user ${userFind.firstName}`;
      //         console.log(description, "Desc");
      //         await bonusFundService(
      //           userFind.referredBy,
      //           referAmount.referralAmount,
      //           description || "Referal Bonus"
      //         );
      //       }
    }

    //Saving Freefire userId and userName
    const playerFFCredentials = await ffCredentialsModel.findOne({ userId });
    if (playerFFCredentials) {
      playerFFCredentials.ffData.push({
        ffUserId: objData.gameId,
        ffUserName: objData.userName,
      });
      await playerFFCredentials.save();
      console.log();
    } else {
      const newffCredentialsModel = await ffCredentialsModel.create({
        userId,
        ffData: [{ ffUserId: objData.gameId, ffUserName: objData.userName }],
      });
      console.log(newffCredentialsModel);
    }

    res.json({
      status: "success",
      message: "Create Success",
    });
  } catch (error) {
    console.log(error, "error join game");
    res.json({
      status: "failed",
      message: "Insufficient balance",
      error,
    });
  }
};

//Get FF Crendetails
exports.getFFCredentials = async (req, res) => {
  try {
    const userId = req.user.id;
    const ffCredentials = await ffCredentialsModel.findOne({ userId });
    res.json({
      status: "success",
      message: "FreeFire UserIDs and Username found",
      data: ffCredentials || [],
    });
  } catch (error) {
    console.log(error, "e");
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};
exports.getParticipants = async (req, res) => {
  try {
    const tournamentId = req.params.tournamentId;
    console.log(tournamentId);
    const participants = await JoinGameMode.aggregate([
      {
        $match: {
          tournamentId: new mongoose.Types.ObjectId(tournamentId),
        },
      },
      {
        $lookup: {
          from: "logins",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
    ]);
    console.log(participants, "participants");
    res.json({
      status: "success",
      data: participants,
    });
  } catch (error) {
    console.log(error);
    res.json({
      status: "failed",
      message: "Server Issue",
      error,
    });
  }
};

exports.findAndJoinGame = async (req, res) => {
  try {
    const userId = req.user.id;
    const tournament = req.params.tournamentId;

    const currentUTCDate = new Date();
    const offset = 5.5 * 60 * 60 * 1000;
    const currentISTDate = new Date(currentUTCDate.getTime() + offset);
    const currentDate = new Date(currentISTDate.toISOString().split("T")[0]);

    const existingEntry = await JoinGameMode.findOne({
      userId: userId,
      tournamentId: tournament,
      joinDate: {
        $gte: currentDate,
        $lt: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (existingEntry) {
      return res.status(200).json({
        status: "success",
        alreadyJoined: true,
        message: "You have already joined the tournament today.",
      });
    }

    return res.status(200).json({
      status: "success",
      alreadyJoined: false,
      message: "You have not joined the tournament today.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "failed",
      message: "Server Issue",
      error,
    });
  }
};

exports.findAndJoinGameTeamMember = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id); // Convert userId to ObjectId
    const data = req.body;

    // Get the current date in IST for comparison
    const currentUTCDate = new Date();
    const offset = 5.5 * 60 * 60 * 1000; // IST offset
    const currentISTDate = new Date(currentUTCDate.getTime() + offset);
    const currentDate = new Date(currentISTDate.toISOString().split("T")[0]);

    // Check if the user has already joined the tournament today
    const existingEntry = await JoinGameMode.findOne({
      teamId: data.teamId,
      tournamentId: data.tournamentId,
      joinDate: {
        $gte: currentDate,
        $lt: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000), // Next day
      },
    });

    if (existingEntry) {
      const isTeamMember = existingEntry.teamMembers.some((member) =>
        member.userId.equals(userId)
      );

      if (isTeamMember) {
        return res.json({
          canJoin: false, // User has already joined
          message: "You have already joined the tournament.",
        });
      }
    }

    // If no entry exists or the user is not a team member, allow them to join
    return res.json({
      canJoin: true, // User can join
      message: "You can join the tournament.",
    });
  } catch (error) {
    console.error(error);
    res.json({
      canJoin: false, // Default to false on error
      message: "Server Issue",
      error: error.message,
    });
  }
};

// exports.getMyLeagues = async (req, res) => {
//     try {
//         const
//     } catch (error) {

//     }
// }

exports.addJoinTeam = async (req, res) => {
  try {
    const data = req.body;
    console.log(req.body);
    const userId = req.user.id;
    console.log(userId);
    const tournament = await TournamentModel.findOne({
      _id: data.tournamentId,
    });
    // Validate the game level
    const playerLevel = Number(data.gameLevel);
    if (isNaN(playerLevel)) {
      return res.json({
        status: "fail",
        message: "Invalid game level, it should be a number",
      });
    }

    // Validate balance
    const balance = Number(data.balance);
    if (isNaN(balance) || balance <= 0) {
      return res.json({
        status: "fail",
        message: "Invalid balance amount",
      });
    }

    // Generate a random 6-digit code
    const generate6DigitCode = () => {
      return Math.floor(100000 + Math.random() * 900000);
    };
    const uniqueTeamId = generate6DigitCode(); // Call the function to get the code

    // Check if team already exists
    let findTeam = await JoinGameMode.findOne({
      teamId: uniqueTeamId,
      tournamentId: data.tournamentId,
    });

    if (findTeam) {
      return res.json({
        status: "fail",
        message: "Team already exists for this tournament",
      });
    }

    let userWallet = await walletModel.findOne({ userId: userId });
    if (!userWallet || userWallet.balance < balance) {
      return res.json({
        status: "fail",
        message: "Insufficient balance",
      });
    }

    userWallet.balance -= balance;
    userWallet.depositBalance += balance;
    await userWallet.save();

    let walletTransaction = await walletTransactionModel.findOne({
      userId: userId,
    });
    let withdrawAvailable = await memberModel.findOne({
      "members.userId": userId,
    });
    let memberShipAmountFetch = await memberAmountModel.findOne({});

    console.log(userId, "userId withdrawAvailable withdrawAvailable");
    console.log(withdrawAvailable, "withdrawAvailable withdrawAvailable");
    if (withdrawAvailable) {
      withdrawAvailable.withdrawAvailableAmount =
        withdrawAvailable.withdrawAvailableAmount +
        memberShipAmountFetch.shipAmount;
      withdrawAvailable.totalAmount =
        withdrawAvailable.totalAmount + memberShipAmountFetch.shipAmount;
      await withdrawAvailable.save();
    }
    const walletDataEntry = {
      tournamentId: data.tournamentId,
      amount: data.balance,
      depositBalance: userWallet.depositBalance,
      type: "debit",
      date: new Date(),
      description: `For Playing ${tournament.title}`,
    };

    if (!walletTransaction) {
      await walletTransactionModel.create({
        userId: userId,
        walletId: userWallet._id,
        walletdata: [walletDataEntry],
      });
    } else {
      walletTransaction.walletdata.push(walletDataEntry);
      await walletTransaction.save();
    }

    const objData = {
      userName: data.userName,
      teamId: uniqueTeamId,
      gameId: data.gameId,
      gameLevel: data.gameLevel,
      mapDownload: data.mapDownload,
      userId: userId,
      tournamentId: data.tournamentId,
      teamName: data.teamName,
      joinDate: new Date(),
      teamMembers: [
        {
          userId: userId,
          userName: data.userName,
          gameId: data.gameId,
          gameLevel: data.gameLevel,
          mapDownload: data.mapDownload,
        },
      ],
    };

    let memberShipModels = await memberModel.find({});
    await Promise.all(
      memberShipModels.map(async (element) => {
        element.members.forEach((member) => {
          if (member.userId.equals(userId)) {
            member.amount = member.amount + memberShipAmountFetch.shipAmount;
            member.gamePlay = member.gamePlay + 1;
          }
        });
        await element.save();
      })
    );
    tournament.totalPlayer = tournament.totalPlayer + 1;
    await tournament.save();

    const createTeam = await JoinGameMode.create(objData);
    let findJoinData = await JoinGameMode.find({ userId: userId });

    if (findJoinData.length == 1) {
      console.log("gdfhcvghb");
      let userFind = await LoginModule.findOne({ _id: userId });

      if (findJoinData.length === 1) {
        console.log("User joined for the first time");
        const userFind = await LoginModule.findOne({ _id: userId });

        if (userFind?.referredBy) {
          const referAmount = await ReferralModel.findOne({});

          if (referAmount) {
            // Bonus to the referring user (old user)
            await bonusFundService(
              userFind.referredBy,
              referAmount.oldUserAmount,
              `Referral bonus ₹${referAmount.oldUserAmount} for referring ${userFind.firstName}`
            );

            // Optional: Bonus to the new user (referred one)
            await bonusFundService(
              userId,
              referAmount.newUserAmount,
              `Welcome bonus ₹${referAmount.newUserAmount} for being referred`
            );
          }
        }
      }

      // if (userFind.referredBy) {
      //   let referAmount = await ReferralModel.findOne({});
      //   await bonusFundService(userFind.referredBy, referAmount.referralAmount);
      //   // let walletReferAdd = await walletModel.findOne({ userId: userFind.referredBy })
      //   // walletReferAdd.winningBalance = walletReferAdd.winningBalance + referAmount.referralAmount
      //   // walletReferAdd.balance = walletReferAdd.balance + referAmount.referralAmount
      //   // await walletReferAdd.save()
      // }
    }

    if (!createTeam) {
      return res.json({
        status: "fail",
        message: "Failed to create team",
      });
    } else {
      return res.json({
        status: "success",
        message: "Game and league created successfully",
      });
    }
  } catch (error) {
    console.error("Error in addJoinTeam:", error);
    return res.status(500).json({
      status: "failed",
      message: "Server Issue",
      error,
    });
  }
};

exports.teamAddMember = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const data = req.body;

    const objData = {
      userId: userId,
      userName: data.userName,
      gameId: data.gameId,
      gameLevel: data.gameLevel,
      mapDownload: data.mapDownload,
    };

    let findTeam = await JoinGameMode.findOne({
      teamId: data.teamId,
      tournamentId: data.tournamentId,
    });
    if (!findTeam) {
      return res.json({
        status: "fail",
        message: "Team ID not found",
      });
    }

    let playerAlreadyInTeam = findTeam.teamMembers.some((player) =>
      player.userId.equals(userId)
    );
    if (playerAlreadyInTeam) {
      return res.json({
        status: "fail",
        message: "Player already in the team",
      });
    }

    let tournament = await TournamentModel.findOne({ _id: data.tournamentId });
    if (!tournament) {
      return res.json({
        status: "fail",
        message: "Tournament not found",
      });
    }

    if (tournament.type === "duo") {
      if (findTeam.teamMembers.length >= 2) {
        return res.json({
          status: "fail",
          message: "Duo team is full",
        });
      }
    } else if (tournament.type === "squad") {
      if (findTeam.teamMembers.length >= 4) {
        return res.json({
          status: "fail",
          message: "Squad team is full",
        });
      }
    }

    findTeam.teamMembers.push(objData);
    await findTeam.save();

    return res.json({
      status: "success",
      message: "Player added to the team",
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: "failed",
      message: "Server Issue",
      error: error.message,
    });
  }
};

exports.getTeamMembers = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    // const data = await JoinGameMode.find({ userId: userId }, { teamMembers: 1 ,teamName:1,teamId:1});
    const data = await JoinGameMode.aggregate([
      { $match: { userId: userId } },
      { $unwind: "$teamMembers" },
      {
        $lookup: {
          from: "logins",
          localField: "teamMembers.userId",
          foreignField: "_id",
          as: "playerDetails",
        },
      },
      {
        $unwind: "$playerDetails",
      },
      {
        $group: {
          _id: "$_id",
          teamId: { $first: "$teamId" },
          teamName: { $first: "$teamName" },
          teamMembers: {
            $push: {
              userId: "$teamMembers.userId",
              userName: "$teamMembers.userName",
              gameId: "$teamMembers.gameId",
              gameLevel: "$teamMembers.gameLevel",
              mapDownload: "$teamMembers.mapDownload",
              playerDetails: "$playerDetails",
            },
          },
        },
      },
    ]);
    const [data1] = data;
    res.json({
      status: "success",
      message: "get success",
      data: data1,
    });
  } catch (error) {
    console.log(error);
    res.json({
      status: "error",
      message: "Server error",
      error,
    });
  }
};

// const mongoose = require('mongoose');
// const MyLeaguesModel = require("../models/myLeaguesModel");

// exports.getJoinDetails = async (req, res) => {
//     try {

//         // Convert req.user.id to ObjectId using the `new` keyword
//         const userId = new mongoose.Types.ObjectId(req.user.id);

//         // Await the result of the aggregation query
//         const dataGet = await JoinGameMode.aggregate([
//             { $match: { userId: userId } },
//             {
//                 $lookup:{
//                     from: "maps",
//                     localField: "mapId",
//                     foreignField: "_id",
//                     as: "mapDetails"
//                 },

//             },{
//                 $unwind:"$mapDetails"
//             },{
//                 $lookup:{
//                     from:"tournaments",
//                     localField:"tournamentId",
//                     foreignField:"matches._id",
//                     as:"tournament"
//                 }
//             },{
//                 $unwind:"$tournament"
//             }
//         ]);

//         console.log(dataGet);

//         if (dataGet.length > 0) {
//             return res.json({
//                 status: "success",
//                 data: dataGet,
//             });
//         } else {
//             return res.json({
//                 status: "error",
//                 message: "No data found"
//             });
//         }
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({
//             status: "error",
//             message: "Server error"
//         });
//     }
// }

exports.joinTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const data = req.body;
    console.log(data);
    // Fetch the tournament
    const tournament = await TournamentModel.findById(tournamentId);

    // Check if tournament exists and is accepting participants
    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    // Check if tournament is filled
    if (tournament.currentParticipants >= tournament.totalParticipants) {
      return res.status(400).json({ message: "Tournament is full" });
    }

    // Add participant
    tournament.participants.push({ ...data });

    // // Update the current number of participants
    // tournament.currentParticipants += 1;

    // Check if tournament is now full
    if (tournament.currentParticipants === tournament.totalParticipants) {
      tournament.filled = true;
    }

    // Save the tournament
    await tournament.save();

    return res
      .status(200)
      .json({ message: "Successfully joined the tournament", tournament });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

exports.viewTeam = async (req, res) => {
  try {
    // const data = await JoinGameMode.find({ userId: userId }, { teamMembers: 1 ,teamName:1,teamId:1});
    const data = await JoinGameMode.aggregate([
      {
        $match: {
          tournamentId: new mongoose.Types.ObjectId(req.params.tournamentId),
        },
      },
      {
        $lookup: {
          from: "logins",
          localField: "teamMembers.userId",
          foreignField: "_id",
          as: "playerDetails",
        },
      },
      {
        $unwind: "$playerDetails",
      },
      {
        $group: {
          _id: "$_id",
          teamMembers: { $push: "$teamMembers" },
          teamName: { $first: "$teamName" },
          // teamId: { $first: "$teamId" },
        },
      },
    ]);
    if (data.length > 0) {
      return res.json({
        status: "success",
        message: "get success",
        data: data,
      });
    } else {
      return res.json({
        status: "error",
        message: "No data found",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      message: "Server error",
      error,
    });
  }
};
