const { isValidPassword } = require("../utils/Utils");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const AdminModel = require("../models/adminModel");
const { sendGlobalNotification } = require("../config/fcmConfig");
const contactModel = require("../models/contactModel");
const { uploadImageToCloudinary } = require("../utils/cloudinary");
const sliderModel = require("../models/sliderModel");
const { default: mongoose } = require("mongoose");
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
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);

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
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET);

    res.status(200).json({
      status: "success",
      message: "User logged in successfully",
      data: { token, user },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};

exports.sendCustomNotification = async (req, res) => {
  const { messageTitle, messageBody } = req.body;
  if (!messageTitle)
    return res
      .status(422)
      .json({ message: "message title is required", success: true });
  if (!messageBody)
    return res
      .status(422)
      .json({ message: "message body is required", success: true });

  try {
    sendGlobalNotification(messageTitle, messageBody);
    res
      .status(200)
      .json({ message: "notification sent successfully", success: true });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "internal server error", success: true });
  }
};

// contact detail

exports.addContactDetails = async (req, res) => {
  try {
    const body = req.body;

    // Body empty check
    if (!body || Object.keys(body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No data received",
      });
    }

    // Allow only specific fields
    const allowedFields = ["email", "customer_care", "manager"];
    const field = Object.keys(body)[0];

    if (!allowedFields.includes(field)) {
      return res.status(400).json({
        success: false,
        message: "Invalid field",
      });
    }

    const value = body[field];

    // Value validation
    if (!value || value.toString().trim() === "") {
      return res.status(400).json({
        success: false,
        message: `${field} is required`,
      });
    }

    // Find existing settings (single document)
    let settings = await contactModel.findOne();

    if (!settings) {
      // Create new document with dynamic key
      settings = await contactModel.create({
        [field]: value,
      });
    } else {
      // Update only that field
      await contactModel.findByIdAndUpdate(
        settings._id,
        { $set: { [field]: value } },
        { new: true }
      );
    }

    return res.status(200).json({
      success: true,
      message: `${field} saved successfully`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getContactDetails = async (req, res) => {
  try {
    const data = await contactModel.findOne({});
    if (!data) {
      return res.status(400).json({ status: false, message: "no data found" });
    }
    return res.status(200).json({
      status: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server error",
    });
  }
};
exports.addSliderController = async (req, res) => {
  try {
    let hyperlink = "";
    if (req.body.url) {
      hyperlink = req.body.url;
    }
    const image = await uploadImageToCloudinary(req.file);
    if (!image) {
      return res
        .status(400)
        .json({ status: false, message: "faild to upload slider" });
    }
    const payload = {
      slider: image,
      url: hyperlink,
    };
    const insert = await sliderModel.create(payload);
    if (!insert) {
      return res.status(400).json({
        status: false,
        message: "fail to add slider try again.",
      });
    }
    return res.status(200).json({
      status: true,
      message: "Slider Add Successfull",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server error",
    });
  }
};

exports.getAllSliders = async (req, res) => {
  try {
    const slider = await sliderModel.find();
    if (!slider) {
      return res.status(400).json({
        status: false,
        message: "no slider found",
      });
    }
    return res.status(200).json({
      status: true,
      data: slider,
    });
  } catch (error) {
    return res.status(500).json({
      status: "Internal server error",
    });
  }
};

exports.deleteSlider = async (req, res) => {
  try {
    const { slider_id } = req.query;
    if (!slider_id || slider_id.length === 0) {
      return res.status(400).json({
        status: false,
        message: "slider id missing in the headers",
      });
    }
    if (!mongoose.Types.ObjectId.isValid(slider_id)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid ObjectId" });
    }

    const del = await sliderModel.deleteOne({ _id: slider_id });
    if (del.deletedCount.length === 0) {
      return res.status(400).json({
        status: false,
        message: "Unable to delete",
      });
    }
    return res.status(201).json({
      status: true,
      message: "slider delete successfull",
    });
  } catch (error) {
    return res.status(500).json({
      status: "Internal server error",
    });
  }
};
