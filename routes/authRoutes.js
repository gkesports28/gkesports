const express = require("express");
const multer = require("multer");
const upload = multer();
const {
  signUp,
  login,
  profileUpdate,
  getProfileData,
  forgotPassword,
  adminForgotPassword,
  adminResetPassword,
  adminVerfiyOTP,
  resetPassword,
  verifyOTP,
  getAdminProfile,
  updateAdminProfile,
  validateToken,
  forgetOtp,
  vadlidateForgetMobileOTP,
  resetOtpBasedPassword,
} = require("../controllers/authController");
const { authmidleware } = require("../middlewares/authMiddleware");
const {
  adminSignup,
  adminLogin,
  sendCustomNotification,
  addContactDetails,
  addSliderController,
  getAllSliders,
  deleteSlider,
  getContactDetails,
} = require("../controllers/adminController");
const {
  loginReferCode,
  addReferCode,
  getReferCode,
  referUpdateRefer,
  getAllRefer,
} = require("../controllers/referralController");

const LoginRoute = express.Router();

//Auth Route
LoginRoute.post("/signup", signUp);
LoginRoute.post("/login", login); //With Password Login -Email or Phone or Username
// LoginRoute.post('/login-with-otp',loginwithOTP) //Any one email or mobile Login -Email or Phone or Username #Do After client said
// LoginRoute.post('/login-with-otp/email',loginwithEmailOTP) //With OTP Login -Email or Phone or Username #Do After  client said
LoginRoute.post("/forget-otp/phone", forgetOtp); //With OTP Login -Email or Phone or Username #Do 1
// LoginRoute.post('/validate-login-otp',vadlidateLoginOTP) //Any one email or mobile
// LoginRoute.post('/send-otp/phone',sendLoginMobileOTP)
LoginRoute.post("/validate-forget-otp/phone", vadlidateForgetMobileOTP);
// LoginRoute.post('/validate-login-otp/email',vadlidateLoginWebOTP)

LoginRoute.get("/verify-token", authmidleware, validateToken);
LoginRoute.post("/update-password", resetOtpBasedPassword);
//User Forgot Password
LoginRoute.post("/forgot-password", forgotPassword);
LoginRoute.post("/verify-otp", verifyOTP); //Any one email or mobile
// LoginRoute.post('/verify-mobile-otp',mobileVerifyOTP)
// LoginRoute.post('/verify-email-otp',emailVerifyOTP)
LoginRoute.post("/reset-password", resetPassword);

//Admin Forgot Password
LoginRoute.post("/admin/forgot-password", adminForgotPassword);
LoginRoute.post("/admin/verify-otp", adminVerfiyOTP);
LoginRoute.post("/admin/reset-password", adminResetPassword);

//Profile Update
LoginRoute.get("/admin/profile", authmidleware, getAdminProfile);
LoginRoute.put("/admin/profile", authmidleware, updateAdminProfile);

LoginRoute.get("/profile", authmidleware, getProfileData);
LoginRoute.put("/profile", authmidleware, profileUpdate);

// Admin api
LoginRoute.post("/admin/signup", adminSignup);
LoginRoute.post("/admin/login", adminLogin);
LoginRoute.post("/admin/send-notification", sendCustomNotification);

// Refrel code
LoginRoute.post("/refer", addReferCode);
LoginRoute.get("/refer-user", authmidleware, getAllRefer);
LoginRoute.put("/refer", referUpdateRefer);
LoginRoute.get("/refer-code", getReferCode);
LoginRoute.get("/refer", authmidleware, loginReferCode);
LoginRoute.post("/contact", addContactDetails);
LoginRoute.post(
  "/add-slider",
  authmidleware,
  upload.single("gameImage"),
  addSliderController
);
LoginRoute.get("/get-details", getContactDetails);
LoginRoute.get("/get-slider", getAllSliders);
LoginRoute.delete("/delete-slider", deleteSlider);
module.exports = LoginRoute;
