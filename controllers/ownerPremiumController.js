const ownerPremiomModel = require("../models/ownerPremiumModel")

exports.getOwnerPremiom = async (req, res) => {
    try {
        const data = await ownerPremiomModel.findOne({ userId: req.user.id })
       if (data) {
        res.json({
            status: true,
        })
       } else {
        res.json({
            status: false,
            message: "No Data Found"
        })
       }
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: "error",
            message: "Server error"
        })
    }
}