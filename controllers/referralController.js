const ReferralModel = require('../models/referralModel');
const LoginModel = require('../models/userModel');



exports.addReferCode = async (req, res) => {
  try {
    const { oldUserAmount, newUserAmount } = req.body;

    const data = await ReferralModel.create({ oldUserAmount, newUserAmount });

    res.json({ status: "success", data });
  } catch (error) {
    res.json({ status: "error", message: "Internal server error", error: error.message });
  }
};



exports.getReferCode = async (req, res) => {
    try {
        const referAmount = await ReferralModel.findOne({});
        res.json({
            status: "success",
            data: referAmount
        })
    } catch (error) {
        res.json({
            status: "error",
            message: "Internal server error",
            error: error.message
        })
    }

}

exports.loginReferCode = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log(userId, "userId")
        const user = await LoginModel.findOne({ _id: userId }, {
            referralCode: 1
        });
        console.log(user, "user")
        res.json({
            status: "success",
            data: user
        })

    } catch (error) {
        console.log(error);
        res.json({
            status: "error",
            message: "Internal server error",
            error: error.message
        })
    }
}



exports.referUpdateRefer = async (req, res) => {
    // const referId = req.params.Id;
    try {
    const { oldUserAmount, newUserAmount } = req.body;
    const refer = await ReferralModel.findOne({});

    if (!refer) return res.status(404).json({ status: "fail", message: "Referral config not found" });

    refer.oldUserAmount = oldUserAmount;
    refer.newUserAmount = newUserAmount;
    await refer.save();

    res.json({ status: "success", data: refer });
  } catch (error) {
    res.json({ status: "error", message: "Internal server error", error: error.message });
  }
}


exports.getAllRefer = async (req, res) => {
    try {
        const userId = req.user.id
        const referAmount = await LoginModel.find({referredBy: userId});
        if(referAmount.length > 0) {
            res.json({
                status: "success",
                data: referAmount
            })
        }else{
            res.json({
                status:"fail",
                data:[]
            })
        }

    } catch (error) {
        res.json({
            status: "error",
            message: "Internal server error",
            error: error.message
        })
    }
}