const memberAmountModel = require("../models/memberAmount");

exports.addShipAmmount = async (req, res) => {
    try {
        const data = req.body;
        const addData = {
            shipAmount: data.amount,
        };
        const saveData = await memberAmountModel.create(addData);
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



exports.getShipAmmount = async (req, res) => {
    try {
        const findData = await memberAmountModel.findOne();
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

exports.updateShipAmmount = async (req, res) => {
    try {
        const data = req.body;
        const userId = req.params.id;
        console.log(data, userId);
        const updateData = {
            shipAmount: data.shipAmount,
            amount: data.amount

        };
        const saveData = await memberAmountModel.updateOne({ _id: userId }, updateData);
        if (saveData) {
            return res.json({
                status: "success",
                message: "update success",
            });
        } else {
            return res.json({
                status: "fail",
                message: "failed to update data",
            });
        }
    } catch (error) {
        res.json({
            status: "fail",
            error: error.message,
        });
    }
}

