const { isValidPassword } = require("../utils/Utils");
require('dotenv').config();
const jwt = require('jsonwebtoken');
const AdminModel = require("../models/adminModel");
const { sendGlobalNotification } = require("../config/fcmConfig");
const JWT_SECRET = process.env.JWT_SECRET_KEY;
exports.adminSignup = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: "fail",
                message: "Email and password are required",
            });
        }

        const user = await AdminModel.findOne({ email: email });
        if (user) {
            return res.status(400).json({
                status: "fail",
                message: "User already exists",
            });
        }

        const objData = {
            email,
            password,
        };

        const create = await AdminModel.create(objData);

        res.status(201).json({
            status: "success",
            message: "User created successfully",
            data: create,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: "error",
            message: "Server error",
        });
    }
}


exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email, password)

        if (!email || !password) {
            return res.status(400).json({
                status: "fail",
                message: "Email and password are required",
            });
        }

        const user = await AdminModel.findOne({ email: email });
        if (!user) {
            return res.status(400).json({
                status: "fail",
                message: "User not found",
            });
        }

        const isPasswordValid = isValidPassword(password, user.password);
        if (!isPasswordValid) {
            return res.json({
                status: "fail",
                message: "Invalid email or password",
            });
        }
        const token = jwt.sign(
            { id: user._id, email: user.email },
            JWT_SECRET,
        );
        
        res.status(200).json({status: "success",message: "User logged in successfully",data: {token,user},});
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: "error",
            message: "Server error",
        });
    }
}

exports.sendCustomNotification = async (req, res) => {
    const { messageTitle, messageBody } = req.body;
    if (!messageTitle) return res.status(422).json({message: "message title is required", success: true})
    if (!messageBody) return res.status(422).json({message: "message body is required", success: true})

    try {
        
        sendGlobalNotification(messageTitle, messageBody);
        res.status(200).json({message: "notification sent successfully", success: true});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "internal server error", success: true});
    }
};