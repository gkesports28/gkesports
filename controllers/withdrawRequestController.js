const memberModel = require("../models/memberShipModel");
const { findOneAndReplace } = require("../models/TournamentModel");
const WithdrawRequestModel = require("../models/withdrawRequestModel");

exports.requestWithdrawal = async (req, res) => {
  try {
    const data = req.body;
    const userId = req.user.id;

    const addData = {
      userId: userId,
      amount: data.amount,
      status: "pending",
    };
    let findData = await WithdrawRequestModel.findOne({
      userId: userId,
      status: "pending",
    });
    if (findData) {
      return res.json({
        status: "fail",
        message: "You have already added request. Wait for approval",
      });
    }
    const saveData = await WithdrawRequestModel.create(addData);
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
    res.json({
      status: "fail",
      error: error.message,
    });
  }
};

exports.getWithdrawRequests = async (req, res) => {
  try {
    console.log(req.query, "withsfs");
    const query = {
      status: "pending",
    };
    const { search, status, date } = req.query;
    if (search) {
      query.$or = [
        { "user.userName": { $regex: search, $options: "i" } },
        {
          "user.email": { $regex: search, $options: "i" },
          "user.firstName": { $regex: search, $options: "i" },
          "user.lastName": { $regex: search, $options: "i" },
        },
      ];
    }
    if (status) {
      query.status = status;
    }
    if (date && date != "") {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.createdAt = { $gte: startDate, $lt: endDate };
    }

    console.log(query, "query");
    const findData = await WithdrawRequestModel.aggregate([
      {
        $lookup: {
          from: "logins",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          amount: 1,
          status: 1,
          createdAt: 1,
          "user.firstName": 1,
          "user.lastName": 1,
          "user.userName": 1,
        },
      },
      {
        $match: query,
      },
    ]);
    res.json({
      status: "success",
      data: findData,
    });
  } catch (error) {
    res.json({
      status: "fail",
      error: error.message,
    });
  }
};

exports.getWithdrawRequestsForMember = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(userId);
    const findData = await WithdrawRequestModel.find({ userId: userId });
    res.json({
      status: "success",
      data: findData,
    });
  } catch (error) {
    res.json({
      status: "fail",
      error: error.message,
    });
  }
};

exports.updateWithdrawRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    if (data.status == "approved") {
      console.log(data, "data");
      let findData = await WithdrawRequestModel.findOne({ _id: id });
      let memberShipAmount = await memberModel.findOne({
        userId: findData.userId,
      });
      if (memberShipAmount) {
        memberShipAmount.withdrawAvailableAmount = d;
        memberShipAmount.withdrawAvailableAmount - findData.amount;
        await memberShipAmount.save();
        findData.status = data.status;
        await findData.save();
        return res.json({
          status: "success",
          message: "update success",
        });
      }
      return res.json({ success: "fail", message: "User not found" });
    } else {
      let findData = await WithdrawRequestModel.findOne({ _id: data.id });
      if (findData) {
        findData.status = data.status;
        await findData.save();
        return res.json({
          status: "success",
          message: "update success",
        });
      } else {
        return res.json({
          status: "fail",
          message: "No data found",
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.json({
      status: "fail",
      error: error.message,
    });
  }
};

// exports.searchMemberShipRequist = async (req, res) => {
//     try {
//         const userName = req.params.userName;
//         const findData = await WithdrawRequestModel.aggregate([
//             {
//                 $lookup: {
//                     from: "logins",
//                     localField: "userId",
//                     foreignField: "_id",
//                     as: "user",
//                 }
//             }, {
//                 $unwind: "$user",
//             }, {
//                 $project: {
//                     _id: 1,
//                     userId: 1,
//                     amount: 1,
//                     status: 1,
//                     createdAt: 1,
//                     "user.firstName": 1,
//                     "user.lastName": 1,
//                     "user.userName": 1,
//                 },
//             }, {
//                 $match: {
//                     "user.userName": {
//                         $regex: userName,
//                         $options: "i",
//                     },
//                 },
//             },
//         ])

//         res.json({
//             status: "success",
//             data: findData,
//         })
//     } catch (error) {
//         res.json({
//             status: "fail",
//             error: error.message,
//         });
//     }
// }

// exports.dateSearchEntry = async (req, res) => {
//     try {
//         const date = req.params.date;
//         const findData = await WithdrawRequestModel.aggregate([
//             {
//                 $lookup: {
//                     from: "logins",
//                     localField: "userId",
//                     foreignField: "_id",
//                     as: "user",
//                 }
//             }, {
//                 $unwind: "$user",
//             }, {
//                 $project: {
//                     _id: 1,
//                     userId: 1,
//                     amount: 1,
//                     status: 1,
//                     createdAt: 1,
//                     "user.firstName": 1,
//                     "user.lastName": 1,
//                     "user.userName": 1,
//                 },
//             }, {
//                 $match: {
//                     createdAt: {
//                         $gte: new Date(`${date}T00:00:00.000Z`),
//                         $lt: new Date(`${date}T23:59:59.999Z`),
//                     },
//                 },
//             },
//         ])
//         res.json({
//             status: "success",
//             data: findData,
//         })
//     } catch (error) {
//         res.json({
//             status: "fail",
//             error: error.message,
//         });
//     }
// }
