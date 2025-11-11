const memberModel = require("../models/memberShipModel");
const withdrawMemberModel = require("../models/withdrawMemeberModel");

exports.addWithdrawRequist = async (req, res) => {
    try {
        const data = req.body;
        const userId = req.user.id;
        const addData = {
            memberId: userId,
            amount: data.amount,
            status: false
        }
        const saveData = await withdrawMemberModel.create(addData);
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
}

exposts.getWithdrawRequist = async (req, res) => {
    try {
        const findData = await withdrawMemberModel.find();
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
}


exposts.statusUpdate = async (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body;
        const updateData = await withdrawMemberModel.findOneAndUpdate({ _id: id }, { status: status });
        if(updateData) {
            let memberWalletFind = await memberModel.findOne({ _id: updateData.memberId });
        }
        if (updateData) {
            return res.json({
                status: "success",
                message: "update success",
            });
        } else {
            return res.json({
                status: "fail",
            });
        }
    } catch (error) {
        res.json({
            status: "fail",
            error: error.message,
        });
    }
}