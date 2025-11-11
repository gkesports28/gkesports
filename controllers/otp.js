const axios = require("axios")
const jsonwebtoken = require("jsonwebtoken")
const LoginModule = require("../models/userModel")
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
exports.sendSMS = async (req, res) => {
  try {
    const { phone } = req.body;
    
    const otp = generateOTP();
    const otpExpiry = Date.now() + 60 * 1000;
    let findUser = await LoginModule.findOne({ phoneNumber: phone });
    if (!findUser) {
      await LoginModule.create({
        phoneNumber: phone,
        otp,
        otpExpire: otpExpiry,
      });
    }
    const apiUrl = `https://sms.autobysms.com/app/smsapi/index.php?key=45FA150E7D83D8&campaign=0&routeid=9&type=text&contacts=${phone}&senderid=SMSSPT&msg=Your OTP is ${otp} SELECTIAL&template_id=1707166619134631839`;
    const response = await axios.post(apiUrl);
    if (response.data.type === "SUCCESS") {
      await LoginModule.findOneAndUpdate(
        { phoneNumber: phone },
        { otp, otpExpire: otpExpiry },
        { upsert: true, new: true }
      );
      return res.status(200).json({ message: "OTP sent successfully" });
    } else {
      return res.status(500).json({ message: "Failed to send OTP", error: response.data });
    }
  } catch (error) {
    console.error("SMS sending error:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
exports.verifyOTPp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ message: "Phone number and OTP are required" });
    }
    const user = await LoginModule.findOne({ phoneNumber: phone });
    const token = jsonwebtoken.sign({
      id:user._id
    },"ierutioewhriot")
    if (!user) {
      return res.status(400).json({ message: "Invalid phone number" });
    }
    if (String(user.otp).trim() !== String(otp).trim()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (Date.now() > user.otpExpire) {
      return res.status(400).json({ message: "OTP expired" });
    }
    await LoginModule.updateOne(
      { phoneNumber: phone },
      { $unset: { otp: 1, otpExpire: 1 } }
    );
    return res.status(200).json({ message: "OTP verified successfully", verified: true ,token});
  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};






