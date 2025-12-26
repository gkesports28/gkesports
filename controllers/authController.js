const jwt = require("jsonwebtoken");

const { isValidPassword } = require("../utils/Utils");
const walletModel = require("../models/WalletModel");
const LoginModule = require("../models/userModel");
const JWT_SECRET = process.env.JWT_SECRET_KEY;
const memberModel = require("../models/memberShipModel");
const JoinGameMode = require("../models/JoinGameModel");
const walletTransactionModel = require("../models/WalletTransactionModel");
const TournamentModel = require("../models/TournamentModel");
const AdminModel = require("../models/adminModel");
const sendEmail = require("../utils/sendEmail");
const EsportsModel = require("../models/MapModel");
const axios = require("axios");
require("dotenv").config();
console.log(process.env.JWT_SECRET_KEY);
function randomWordCreator() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomWord = "";
  for (let i = 0; i < 5; i++) {
    randomWord += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return randomWord;
}

function randomreferCodeCreator() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomWord = "";
  for (let i = 0; i < 7; i++) {
    randomWord += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return randomWord;
}
//Crete the referal code using username
function generateReferralCode(username) {
  if (!username) {
    throw new Error("Username must be provided");
  }

  // Use the username to generate the referral code.
  //  Making it more robust and adaptable.
  let referralCode = username.substring(0, 7); // Use first 7 chars of username
  while (referralCode.length < 7) {
    referralCode += Math.floor(Math.random() * 10); // Pad with random digits
  }
  return referralCode;
}

async function checkDuplicate({ userName, email }) {
  let query = {};
  if (email) {
    query.email = email;
  }
  if (userName) {
    query.userName = userName;
  }
  const existingUser = await LoginModule.findOne(query);
  return existingUser;
}
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// exports.signUp = async (req, res) => {
//     const { firstName, lastName, userName, phoneNumber, email, password, state, referrerCode } = req.body;

//     // console.log("payload::::::::::::");
//     console.log(firstName, lastName, userName, phoneNumber, email, password, state, referrerCode);
//     try {
//         if (!firstName || !lastName || !userName || !phoneNumber || !email || !password || !state) { return res.status(400).json({ status: "fail", message: "All fields are required" }); }

//         // Check for duplicate username or email
//         const userNameExists = await LoginModule.findOne({ userName });
//         if (userNameExists) { return res.status(400).json({ status: "fail", message: "Username already taken" }); }

//         const phoneNumberExists = await LoginModule.findOne({ phoneNumber });
//         if (phoneNumberExists) { return res.status(400).json({ status: "fail", message: "Mobile is already in use" }); }

//         const emailAddressExits = await LoginModule.findOne({ email });
//         if (emailAddressExits) { return res.status(400).json({ status: "fail", message: "Email Address is already in use" }); }

//         //Check for refer code in response
//         if (referrerCode) {
//             if (referrerCode?.split('').length <= 7) {
//                 const referrer = await LoginModule.findOne({ referralCode: referrerCode });
//                 if (!referrer) { return res.status(400).json({ status: "fail", message: "Invalid Referrer Code" }); }
//             }

//             if (referrerCode?.split('').length > 7) {
//                 const member = await memberModel.findOne({ memberCode: referrerCode })
//                 if (!member) { return res.status(400).json({ status: "fail", message: "Invalid Referrer Code" }); }
//             }
//         }

//         // Prepare user data
//         let objData = {
//             firstName,
//             lastName,
//             userName,
//             phoneNumber,
//             email: email.toString().toLowerCase(),
//             password,
//             state,
//             memberCode: randomWordCreator(),
//             referralCode: generateReferralCode(userName),
//             referredBy: null
//         };

//         const referalAmount = await ReferralModel.findOne({});

//         let user;
//         let reffererId;
//         if (referrerCode) {
//             if (referrerCode?.split('').length <= 7) {
//                 const referrer = await LoginModule.findOne({ referralCode: referrerCode });
//                 if (!referrer) { return res.json({ status: "fail", message: "Invalid referral code" }); }

//                 user = await LoginModule.create(objData);
//                 user.referredBy = referrer._id;
//                 reffererId = referrer._id;

//             } else {
//                 let findMember = await memberModel.findOne({ memberCode: referrerCode });
//                 if (!findMember) { return res.json({ status: "fail", message: "Invalid member code" }); }

//                 user = await LoginModule.create(objData);
//                 findMember.members.push({ userId: user._id, amount: 0, gamePlay: 0 });
//                 await findMember.save();
//                 user.memberedBy = findMember._id;

//                 //Distribute bonus
//                 // let findMemberAmount = await memberAmountModel.findOne();
//                 // let walletAdd = await walletModel.findOne({ userId: referrer._id })
//                 // walletAdd.bonusBalance = walletAdd.bonusBalance + findMemberAmount.shipAmount
//                 // await walletAdd.save()
//             }
//         }
//         else {
//             user = await LoginModule.create(objData);
//         }

//         const wallet = await walletModel.create({ userId: user._id });
//         const walletTransaction = await walletTransactionModel.create({ userId: user._id });
//         console.log(walletTransaction, wallet, "walletTransaction")
//         user.walletId = wallet._id;
//         user.walletTransactionId = walletTransaction._id;
//         //Send the Email Verification OTP
//         // let otp = generateOTP();
//         // user.emailOtp = otp;
//         // user.emailOtpExpiresIn = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
//         // await sendEmail(user.email, "Email Verification OTP for GK Esports App", `GK Esports App - Please use below otp to verify your account - \n Your OTP: ${otp}`);

//         if (referalAmount && referrerCode) {
//             // user.walletBalance += (referalAmount.referralAmount);
//             // referrer.walletBalance += (referalAmount.referralAmount);
//             // await referrer.save();

//             const [userWallet, referrerWallet] = await Promise.all([
//                 walletModel.findOne({ userId: user._id }),
//                 walletModel.findOne({ userId: reffererId }),
//             ]);

//             // console.log('user:: ', userWallet);
//             // console.log('referrer:: ', referrerWallet);

//             userWallet.bonusBalance += (referalAmount.referralAmount);
//             referrerWallet.bonusBalance += (referalAmount.referralAmount);

//             await Promise.all([userWallet.save(), referrerWallet.save()]);
//         }
//         await user.save();

//         return res.status(201).json({ status: "success", message: "Account  Create Successfully", data: user });
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({ status: "error", message: "An error occurred during user creation", error: error.message });
//     }
// };

// Function to generate a unique referral code
// Generates a unique 7-character alphanumeric referral code
async function generateUniqueReferralCode() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = 7;
  let code, exists;

  do {
    code = "";
    for (let i = 0; i < length; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    exists = await LoginModule.findOne({ referralCode: code });
  } while (exists);

  return code;
}

// exports.signUp = async (req, res) => {
//   const {
//     firstName,
//     lastName,
//     userName,
//     phoneNumber,
//     email,
//     password,
//     state,
//     referrerCode,
//   } = req.body;

//   try {
//     // 1. Validate Required Fields
//     if (
//       !firstName ||
//       !lastName ||
//       !userName ||
//       !phoneNumber ||
//       !email ||
//       !password ||
//       !state
//     ) {
//       return res
//         .status(400)
//         .json({ status: "fail", message: "All fields are required" });
//     }

//     // 2. Check for Duplicate username, phone, email
//     const [userNameExists, phoneNumberExists, emailAddressExists] =
//       await Promise.all([
//         LoginModule.findOne({ userName }),
//         LoginModule.findOne({ phoneNumber }),
//         LoginModule.findOne({ email }),
//       ]);

//     if (userNameExists)
//       return res
//         .status(400)
//         .json({ status: "fail", message: "Username already taken" });
//     if (phoneNumberExists)
//       return res
//         .status(400)
//         .json({ status: "fail", message: "Mobile number already in use" });
//     if (emailAddressExists)
//       return res
//         .status(400)
//         .json({ status: "fail", message: "Email already in use" });

//     // 3. Handle Referrer Code (if provided)
//     let reffererId = null;
//     let referrerWallet = null;

//     if (referrerCode) {
//       if (referrerCode.length === 7) {
//         const referrer = await LoginModule.findOne({
//           referralCode: referrerCode,
//         });
//         if (!referrer)
//           return res
//             .status(400)
//             .json({ status: "fail", message: "Invalid Referrer Code" });
//         reffererId = referrer._id;
//         referrerWallet = await walletModel.findOne({ userId: reffererId });
//       } else {
//         const member = await memberModel.findOne({ memberCode: referrerCode });
//         if (!member)
//           return res
//             .status(400)
//             .json({ status: "fail", message: "Invalid Member Code" });
//         reffererId = member._id;
//       }
//     }

//     // 4. Prepare User Data
//     const objData = {
//       firstName,
//       lastName,
//       userName,
//       phoneNumber,
//       email: email.toLowerCase(),
//       password,
//       state,
//       memberCode: randomWordCreator(),
//       referredBy: reffererId || null,
//     };

//     // 5. Generate Unique Referral Code & Create User
//     let user = null;
//     let attempts = 0;

//     while (!user && attempts < 5) {
//       try {
//         objData.referralCode = await generateUniqueReferralCode();
//         user = await LoginModule.create(objData);
//       } catch (err) {
//         if (err.code === 11000 && err.keyPattern?.referralCode) {
//           attempts++;
//         } else {
//           throw err;
//         }
//       }
//     }

//     if (!user) {
//       return res.status(500).json({
//         status: "error",
//         message: "Failed to generate a unique referral code. Please try again.",
//       });
//     }

//     // 6. Attach to Member (if applicable)
//     if (referrerCode?.length !== 7) {
//       const member = await memberModel.findOne({ memberCode: referrerCode });
//       if (member) {
//         member.members.push({ userId: user._id, amount: 0, gamePlay: 0 });
//         await member.save();
//         user.memberedBy = member._id;
//       }
//     }

//     // 7. Create Wallet & WalletTransaction
//     const [wallet, walletTransaction] = await Promise.all([
//       walletModel.create({ userId: user._id }),
//       walletTransactionModel.create({ userId: user._id }),
//     ]);

//     user.walletId = wallet._id;
//     user.walletTransactionId = walletTransaction._id;

//     // 8. Apply Referral Bonuses
//     const referralSetting = await ReferralModel.findOne({});
//     if (referralSetting && referrerCode) {
//       const userWallet = await walletModel.findOne({ userId: user._id });

//       if (userWallet) {
//         userWallet.bonusBalance += referralSetting.newUserAmount || 0;
//         await userWallet.save();
//       }

//       if (referrerWallet) {
//         referrerWallet.bonusBalance += referralSetting.oldUserAmount || 0;
//         await referrerWallet.save();
//       }
//     }

//     await user.save();

//     // 9. Success Response
//     return res.status(201).json({
//       status: "success",
//       message: "Account Created Successfully",
//       data: user,
//     });
//   } catch (error) {
//     console.error("SignUp Error:", error);
//     return res.status(500).json({
//       status: "error",
//       message: "An error occurred during user creation",
//       error: error.message,
//     });
//   }
// };
exports.signUp = async (req, res) => {
  const {
    firstName,
    lastName,
    userName,
    phoneNumber,
    email,
    password,
    state,
    referrerCode,
  } = req.body;

  try {
    // 1. Validate Required Fields
    if (
      !firstName ||
      !lastName ||
      !userName ||
      !phoneNumber ||
      !email ||
      !password ||
      !state
    ) {
      return res
        .status(400)
        .json({ status: "fail", message: "All fields are required" });
    }

    // 2. Check for Duplicate username, phone, email
    const [userNameExists, phoneNumberExists, emailAddressExists] =
      await Promise.all([
        LoginModule.findOne({ userName }),
        LoginModule.findOne({ phoneNumber }),
        LoginModule.findOne({ email }),
      ]);

    if (userNameExists)
      return res
        .status(400)
        .json({ status: "fail", message: "Username already taken" });
    if (phoneNumberExists)
      return res
        .status(400)
        .json({ status: "fail", message: "Mobile number already in use" });
    if (emailAddressExists)
      return res
        .status(400)
        .json({ status: "fail", message: "Email already in use" });

    // 3. Handle Referrer Code (if provided)
    let reffererId = null;
    let referrerWallet = null;

    if (referrerCode) {
      if (referrerCode.length === 7) {
        const referrer = await LoginModule.findOne({
          referralCode: referrerCode,
        });
        if (!referrer)
          return res
            .status(400)
            .json({ status: "fail", message: "Invalid Referrer Code" });
        reffererId = referrer._id;
        referrerWallet = await walletModel.findOne({ userId: reffererId });
      } else {
        const member = await memberModel.findOne({ memberCode: referrerCode });
        if (!member)
          return res
            .status(400)
            .json({ status: "fail", message: "Invalid Member Code" });
        reffererId = member._id;
      }
    }

    // 4. Prepare User Data
    const objData = {
      firstName,
      lastName,
      userName,
      phoneNumber,
      email: email.toLowerCase(),
      password,
      state,
      memberCode: randomWordCreator(),
      referredBy: reffererId || null,
    };

    // 5. Generate Unique Referral Code & Create User
    let user = null;
    let attempts = 0;

    while (!user && attempts < 5) {
      try {
        objData.referralCode = await generateUniqueReferralCode();
        user = await LoginModule.create(objData);
      } catch (err) {
        if (err.code === 11000 && err.keyPattern?.referralCode) {
          attempts++;
        } else {
          throw err;
        }
      }
    }

    if (!user) {
      return res.status(500).json({
        status: "error",
        message: "Failed to generate a unique referral code. Please try again.",
      });
    }

    // 6. Attach to Member (if applicable)
    if (referrerCode?.length !== 7 && referrerCode) {
      const member = await memberModel.findOne({ memberCode: referrerCode });
      if (member) {
        member.members.push({ userId: user._id, amount: 0, gamePlay: 0 });
        await member.save();
        user.memberedBy = member._id;
      }
    }

    // 7. Create Wallet & WalletTransaction
    const [wallet, walletTransaction] = await Promise.all([
      walletModel.create({ userId: user._id }),
      walletTransactionModel.create({ userId: user._id }),
    ]);

    user.walletId = wallet._id;
    user.walletTransactionId = walletTransaction._id;

    // 8. Apply Referral Bonuses or default bonus if no referral code
    const referralSetting = await ReferralModel.findOne({});

    if (referrerCode) {
      // If user signed up with referral code
      const userWallet = await walletModel.findOne({ userId: user._id });
      if (userWallet) {
        userWallet.bonusBalance += referralSetting?.newUserAmount || 0;
        await userWallet.save();
      }

      if (referrerWallet) {
        referrerWallet.bonusBalance += referralSetting?.oldUserAmount || 0;
        await referrerWallet.save();
      }
    } else {
      // If user signed up without referral code, give ₹50 bonus
      wallet.bonusBalance += 50;
      await wallet.save();
    }

    await user.save();

    // 9. Success Response
    return res.status(201).json({
      status: "success",
      message: "Account Created Successfully",
      data: user,
    });
  } catch (error) {
    console.error("SignUp Error:", error);
    return res.status(500).json({
      status: "error",
      message: "An error occurred during user creation",
      error: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { userName, password } = req.body;
    console.log("body", req.body);

    // const query = {
    //   $or: [{ userName: loginID }, { phoneNumber: loginID }, {}],
    // };
    const user = await LoginModule.findOne({
      $or: [
        { userName: userName },
        { phoneNumber: userName },
        { email: userName },
      ],
    });

    console.log("user", user);
    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid username or mobile or email or user not found",
      });
    }
    const isPasswordValid = isValidPassword(password, user.password);
    console.log(isPasswordValid);
    if (!isPasswordValid) {
      return res.json({
        status: "fail",
        message: "Invalid username or password",
      });
    }

    const token = jwt.sign(
      { id: user._id, userName: user.userName },
      process.env.JWT_SECRET_KEY
    );
    const wallet = await walletModel.findOne({ userId: user._id });
    if (!wallet) {
      await walletModel.create({ userId: user._id });
    }
    const walletTransaction = await walletTransactionModel.findOne({
      userId: user._id,
    });
    if (!walletTransaction) {
      await walletTransactionModel.create({ userId: user._id });
    }
    res.json({
      status: "success",
      message: "Login successfully",
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "An error occurred during login",
      error: error.message,
    });
  }
};

exports.getProfileData = async (req, res) => {
  try {
    const profileData = await LoginModule.findOne({ _id: req.user.id });
    console.log(profileData);
    res.json({
      status: "success",
      data: profileData,
    });
  } catch (error) {
    console.log(error);
    res.json({
      status: "error",
      message: "An error occurred during profile data retrieval",
      error: error.message,
    });
  }
};

exports.profileUpdate = async (req, res) => {
  try {
    const { firstName, lastName, state } = req.body;

    const objData = { firstName: firstName, lastName: lastName, state: state };

    const update = await LoginModule.findOneAndUpdate(
      { _id: req.user.id },
      objData,
      { new: true }
    );
    if (update) {
      res.json({
        status: "success",
        message: "Profile updated successfully",
        data: update,
      });
    } else {
      res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "An error occurred during profile update",
      error: error.message,
    });
  }
};

//Admin Profile
exports.getAdminProfile = async (req, res) => {
  try {
    const profileData = await AdminModel.findOne({ _id: req.user.id }).select(
      "firstName lastName email phoneNumber socialLinks"
    );
    console.log(profileData);
    res.json({
      status: "success",
      data: profileData,
    });
  } catch (error) {
    console.log(error);
    res.json({
      status: "error",
      message: "An error occurred during profile data retrieval",
      error: error.message,
    });
  }
};

exports.updateAdminProfile = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, socialLinks } = req.body;
    console.log(firstName);
    console.log(firstName, lastName, phoneNumber, socialLinks);
    const objData = {
      firstName: firstName,
      lastName: lastName,
      phoneNumber: phoneNumber,
      socialLinks: socialLinks,
    };

    const update = await AdminModel.findOneAndUpdate(
      { _id: req.user.id },
      objData,
      { new: true }
    ).select("firstName lastName email phoneNumber socialLinks");
    if (update) {
      res.json({
        status: "success",
        message: "Profile updated successfully",
        data: update,
      });
    } else {
      res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "An error occurred during profile update",
      error: error.message,
    });
  }
};
exports.userDetails = async (req, res) => {
  try {
    const query = {};
    const { search } = req.query;
    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: "i" } },
        {
          email: { $regex: search, $options: "i" },
          firstName: { $regex: search, $options: "i" },
          lastName: { $regex: search, $options: "i" },
        },
      ];
    }
    const userDetails = await LoginModule.find(query).sort({ createdAt: -1 });
    if (userDetails.length > 0) {
      res.json({
        status: "success",
        data: userDetails,
      });
    } else {
      res.json({
        status: "success",
        message: "No Data Found",
        data: [],
      });
    }
  } catch (error) {
    res.json({
      error,
    });
  }
};

exports.getSingleUserDetail = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const userDetails = await LoginModule.findOne({ _id: id });
    const walletDetails = await walletModel.findOne({ userId: id });
    const wallet = await walletTransactionModel
      .findOne({ userId: id })
      .populate({ path: "walletdata.tournamentId", model: TournamentModel });
    const walletTransactions = wallet.walletdata;
    const leagues = await JoinGameMode.find({
      $or: [{ userId: id }, { teamMembers: { $elemMatch: { userId: id } } }],
    }).populate({
      path: "tournamentId",
      model: TournamentModel,
      populate: { path: "mapId", model: EsportsModel },
    });
    if (userDetails) {
      res.json({
        status: "success",
        message: "Data found successfully",
        data: {
          userDetails,
          walletDetails,
          walletTransactions,
          leagues,
        },
      });
    } else {
      res.json({
        status: "success",
        message: "Error in fetching user details",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      error,
    });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await LoginModule.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ status: "fail", message: "User not found" });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
    await user.save();

    await sendEmail(
      email,
      "Password Reset OTP for GK Esports App",
      `GK Esports App - Please use below otp to reset your password - \n Your OTP: ${otp}`
    );
    return res
      .status(200)
      .json({ status: "success", message: "OTP sent to email" });
  } catch (err) {
    return res.status(500).json({ status: "error", message: "Server error" });
  }
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await LoginModule.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ status: "fail", message: "User not found" });

    if (user.otp !== otp || new Date() > user.otpExpires) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid or expired OTP" });
    }

    res.json({ status: "success", message: "OTP verified successfully" });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

exports.resetOtpBasedPassword = async (req, res) => {
  const { phoneNumber, password } = req.body;
  try {
    let user = await LoginModule.findOne({ phoneNumber: phoneNumber });
    if (!user) {
      return res
        .status(404)
        .json({ status: "fail", message: "User not found" });
    }
    user.password = password;
    user.otp = null;
    user.otpExpires = null;
    await user.save();
    res.json({ status: "success", message: "Password reset successfully" });
  } catch (err) {
    console.log(err, "error");
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await LoginModule.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ status: "fail", message: "User not found" });

    if (user.otp !== otp || new Date() > user.otpExpires) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid or expired OTP" });
    }

    user.password = newPassword;
    user.otp = null;
    user.otpExpires = null;
    await user.save();
    await sendEmail(
      email,
      "Password Changed for GK Esports App",
      `GK Esports App - Your password has been reset successfully`
    );
    res.json({ status: "success", message: "Password reset successfully" });
  } catch (err) {
    console.log(err, "error");
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

//Admin Forgot Password
exports.adminForgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log(email);
  try {
    const user = await AdminModel.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ status: "fail", message: "User not found" });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
    await user.save();

    await sendEmail(
      email,
      "Password Reset OTP for GK Esports App",
      `GK Esports App - Please use below otp to reset your password - \n Your OTP: ${otp}`
    );

    res.json({ status: "success", message: "OTP sent to email" });
  } catch (err) {
    console.log(err, "error");
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

exports.adminVerfiyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await AdminModel.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ status: "fail", message: "User not found" });

    if (user.otp !== otp || new Date() > user.otpExpires) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid or expired OTP" });
    }

    res.json({ status: "success", message: "OTP verified successfully" });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

exports.adminResetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await AdminModel.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ status: "fail", message: "User not found" });

    // if (user.otp !== otp || new Date() > user.otpExpires) {
    //     return res.status(400).json({status:"fail", message: "Invalid or expired OTP" });
    // }

    user.password = newPassword;
    user.otp = null;
    user.otpExpires = null;
    await user.save();
    await sendEmail(
      email,
      "Password Changed for GK Esports App",
      `GK Esports App - Your password has been reset successfully`
    );
    res.json({ status: "success", message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

exports.validateToken = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await LoginModule.findById(userId);
    if (!user) {
      const adminUser = await AdminModel.findById(userId);
      if (!adminUser) {
        return res
          .status(401)
          .json({ status: "fail", message: "User not found" });
      }
      return res.status(401).json({
        status: "success",
        message: "token verified succesfully",
        data: adminUser,
      });
    }
    return res.status(401).json({
      status: "success",
      message: "token verified succesfully",
      data: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: "error", message: "Server error" });
  }
};

//Send The Mobile OTP for Login
exports.forgetOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const otp = generateOTP(); // e.g., a 4 or 6 digit OTP
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes from now

    let user = await LoginModule.findOne({ phoneNumber: phone });

    if (!user) {
      res.json({
        status: "fail",
        message: "User not found, creating new user",
      });
    }

    // Send SMS
    const apiUrl = `https://sms.autobysms.com/app/smsapi/index.php?key=45FA150E7D83D8&campaign=0&routeid=9&type=text&contacts=${phone}&senderid=SMSSPT&msg=Your OTP is ${otp} SELECTIAL&template_id=1707166619134631839`;
    const response = await axios.get(apiUrl); // Use GET not POST
    console.log("response", response);
    console.log("SMS API Response:", response.data);

    if (response.data.type === "SUCCESS") {
      await LoginModule.findOneAndUpdate(
        { phoneNumber: phone },
        { otp, otpExpire: otpExpiry },
        { upsert: true, new: true }
      );
      return res.status(200).json({ message: "OTP sent successfully" });
    } else {
      return res.status(500).json({
        message: "Failed to send OTP",
        error: response.data,
      });
    }
  } catch (error) {
    console.error("SMS sending error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const moment = require("moment");
const ReferralModel = require("../models/referralModel");

exports.vadlidateForgetMobileOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res
        .status(400)
        .json({ message: "Phone number and OTP are required" });
    }
    const user = await LoginModule.findOne({ phoneNumber: phone });

    if (!user) {
      return res.status(400).json({ message: "Invalid phone number" });
    }
    if (String(user.otp).trim() !== String(otp).trim()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (moment().isAfter(moment(user.otpExpire))) {
      return res.status(400).json({ message: "OTP expired" });
    }

    await LoginModule.updateOne(
      { phoneNumber: phone },
      { $unset: { otp: 1, otpExpires: 1 } }
    );

    const token = jwt.sign(
      { id: user._id, userName: user.userName },
      "ierutioewhriot"
    );

    return res.status(200).json({
      message: "OTP verified successfully",
      verified: true,
      token,
      status: "success",
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
