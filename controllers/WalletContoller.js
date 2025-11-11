const walletModel = require("../models/WalletModel");
const walletTransactionModel = require("../models/WalletTransactionModel");
const PAYOUT_CLIENT_ID = process.env.PAYOUT_CLIENT_ID;
const PAYOUT_CLIENT_SECRET = process.env.PAYOUT_CLIENT_SECRET;
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const axios = require("axios");
const TournamentModel = require("../models/TournamentModel");
const WinnerModel = require("../models/winnerModel");
const JoinGameMode = require("../models/JoinGameModel");
const payoutModel = require("../models/payoutModel");
const paymentModel = require("../models/paymentModel");
function generateTransactionID() {
  const uniqueId = crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(uniqueId).digest("hex");
  console.log(hash);
  return hash.substr(0, 28);
}

exports.addWallet = async (req, res) => {
  try {
    const userId = req.user.id;
    let { balance } = req.body;

    balance = Number(balance);

    let addWallet = await walletModel.findOne({ userId: userId });

    if (addWallet) {
      addWallet.balance = addWallet.balance + balance;
      await addWallet.save();

      res.json({
        status: "success",
        message: "add success",
      });
    } else {
      res.json({
        status: "fail",
        message: "Wallet not found",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.wallethistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const start = new Date(req.body.startTime);
    const end = new Date(req.body.endTime);
    console.log(start, end);

    const getWalletByFilter = await walletTransactionModel.findOne({
      userId: userId,
    });
    console.log(getWalletByFilter, "getWalletByFilter");
    let transactions = getWalletByFilter.walletdata;
    if (start && end)
      transactions = getWalletByFilter.walletdata.filter(
        (transaction) => transaction.date >= start && transaction.date <= end
      );

    if (transactions.length > 0) {
      res.json({
        status: "success",
        message: "get success",
        data: transactions,
      });
    } else {
      res.json({
        status: "fail",
        message: "No Data Found",
      });
    }
  } catch (error) {
    res.json({
      status: "error",
      message: error.message,
    });
  }
};

exports.addWiningBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { balance } = req.body;
    let addWallet = await walletModel.findOne({ userId: userId });
    addWallet.winingBalance = addWallet.winingBalance + balance;
    addWallet.save();
    if (addWallet) {
      res.json({
        status: "success",
        message: "add success",
      });
    } else {
      res.json({
        status: "fail",
      });
    }
  } catch (error) {
    res.json({
      error,
    });
  }
};

exports.getWallet = async (req, res) => {
  try {
    const userId = req.user.id;
    const getWallet = await walletModel.findOne({ userId: userId }).lean();
    if (getWallet) {
      getWallet.balance =
        getWallet.winningBalance +
        getWallet.depositBalance +
        getWallet.bonusBalance;
      res.json({
        status: "success",
        message: "get success",
        data: getWallet,
      });
    } else {
      res.json({
        status: "fail",
        message: "No Data Found",
      });
    }
  } catch (error) {
    res.json({
      error,
    });
  }
};

exports.withdrawFromWallet = async (req, res) => {
  const { transfer_amount, beneficiary_id } = req.body;

  const userWallet = await walletModel.findOne({ userId: req.user.id });
  if (!userWallet)
    return res.json({ status: "failed", message: "Unable to get wallet" });
  if (userWallet.winningBalance < transfer_amount)
    return res.json({
      status: "failed",
      message: "Wallet does not contain sufficient balance",
    });
  try {
    const data = {
      beneficiary_details: { beneficiary_id: beneficiary_id },
      transfer_id: generateTransactionID(),
      transfer_amount: transfer_amount,
      fundsource_id: "CF_WALLET",
      transfer_mode: "imps",
    };
    const PUBLIC_KEY_PATH = path.join(__dirname, "../keys/", "public_key.pem"); // Path to the public key file
    console.log(PUBLIC_KEY_PATH);
    // Load the public key from the PEM file
    const publicKey = fs.readFileSync(PUBLIC_KEY_PATH, "utf8");

    // Function to encrypt data with the public key
    const encryptWithPublicKey = (data) => {
      const buffer = Buffer.from(data, "utf8");
      return crypto.publicEncrypt(publicKey, buffer).toString("base64");
    };
    const encryptedPayload = encryptWithPublicKey(JSON.stringify(data));

    const options = {
      method: "POST",
      url: "https://api.cashfree.com/payout/transfers",
      headers: {
        accept: "application/json",
        "x-api-version": "2024-01-01",
        "content-type": "application/json",
        "x-client-id": PAYOUT_CLIENT_ID,
        "x-client-secret": PAYOUT_CLIENT_SECRET,
        "x-signature": encryptedPayload,
      },
      data: data,
    };

    const response = await axios.request(options);
    console.log(response.data);
    const { transfer_id, cf_transfer_id } = response.data;
    console.log(transfer_id, cf_transfer_id);
    const options2 = {
      method: "GET",
      url: `https://api.cashfree.com/payout/transfers?cf_transfer_id=${cf_transfer_id}`,
      headers: {
        accept: "application/json",
        "x-api-version": "2024-01-01",
        "x-client-id": PAYOUT_CLIENT_ID,
        "x-client-secret": PAYOUT_CLIENT_SECRET,
        "x-signature": encryptedPayload,
      },
    };
    const response2 = await axios.request(options2);
    console.log(response2.data);

    const { status, status_description, transfer_mode } = response2.data;
    if (status == "PENDING" || status == "SUCCESS") {
      userWallet.balance -= transfer_amount;
      await userWallet.save();
    }
    const wallet = await walletTransactionModel.findOneAndUpdate(
      { userId: req.user.id },
      {
        $push: {
          withdrawalTransactions: {
            transactionId: transfer_id,
            beneficiaryId: beneficiary_id,
            status,
            method: transfer_mode,
            amount: transfer_amount,
            statusDescription: status_description,
          },
        },
      },
      { new: true }
    );
    if (!wallet)
      return res.json({
        status: "failed",
        message: "Error in creating withdraw history",
      });
    return res.json({
      status: "success",
      message: "Funds withdrawn Successfully",
    });
  } catch (e) {
    console.log(e);
    res.json({ status: "failed", messge: e.message });
  }
};

exports.getWithdrawalHistory = async (req, res) => {
  const withdrawalHistory = await payoutModel
    .find({ userId: req.user.id })
    .sort({ createdAt: -1 });
  if (!withdrawalHistory)
    return res.json({
      status: "failed",
      message: "Unable to fetch withdraw history",
    });

  return res.json({
    status: "success",
    data: withdrawalHistory,
    message: "Withdrawal History Found successfuly",
  });
};
exports.getAddFundHistory = async (req, res) => {
  const paymentHistory = await paymentModel
    .find({ userId: req.user.id })
    .sort({ date: -1 });
  if (!paymentHistory)
    return res.json({
      status: "failed",
      message: "Unable to fetch payment history",
    });

  return res.json({
    status: "success",
    data: paymentHistory,
    message: "Payment History Found successfuly",
  });
};

exports.distributeFunds = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    console.log(tournamentId);
    // Fetch the tournament
    const tournament = await TournamentModel.findById(tournamentId);

    if (!tournament) {
      return res
        .status(404)
        .json({ status: "fail", message: "Tournament not found" });
    }
    // Check if the funds have already been distributed
    if (tournament.fundsDistributed) {
      return res.status(400).json({
        status: "fail",
        message: "Funds have already been distributed for this tournament",
      });
    }
    const foundObject = await WinnerModel.findOne({
      tournamentId: tournamentId,
    }).populate({ path: "winnerList.participantId", model: JoinGameMode });
    const winners = foundObject.winnerList;
    console.log(winners);
    // Perform the logic to distribute funds to the winners
    console.log;
    for (let winner of winners) {
      //Finding the wallet
      const wallet = await walletModel.findOne({
        userId: winner.participantId.userId,
      });
      wallet.balance += winner.prize;
      wallet.winningBalance += winner.prize;
      await wallet.save();
      const transactionData = {
        amount: winner.prize,
        type: "credit",
        tournamentId: tournament._id,
        date: new Date(),
        description: "Prize Distribution for tournament " + tournament.title,
      };
      const WalletTransactions = await walletTransactionModel.findOneAndUpdate(
        { userId: winner.participantId.userId },
        { $push: { walletdata: transactionData } },
        { new: true }
      );
      console.log(WalletTransactions);
      console.log(
        `Distributing ${winner.prize} to participant ${winner.participantId}`
      );
    }

    // Mark funds as distributed
    tournament.fundsDistributed = true;

    // Save the tournament with the updated fundsDistributed field
    await tournament.save();

    return res
      .status(200)
      .json({ status: "success", message: "Funds distributed successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Server error", error });
  }
};

// Withdraw from wallet using Cashfree Payout API
// exports.withdrawFromWallet = async (req, res) => {
//   try {
//     const { transfer_amount, beneficiary_id } = req.body;

//     // Validate request
//     if (!req.user?.id)
//       return res
//         .status(401)
//         .json({ status: "failed", message: "Unauthorized access" });

//     if (!transfer_amount || !beneficiary_id)
//       return res.json({
//         status: "failed",
//         message: "Transfer amount and beneficiary ID required",
//       });

//     // Get user wallet
//     const userWallet = await walletModel.findOne({ userId: req.user.id });
//     if (!userWallet)
//       return res.json({ status: "failed", message: "Unable to get wallet" });

//     if (userWallet.balance < transfer_amount)
//       return res.json({
//         status: "failed",
//         message: "Insufficient wallet balance",
//       });

//     // Prepare transfer data
//     const transfer_id = generateTransactionID();
//     const data = {
//       beneficiary_details: { beneficiary_id },
//       transfer_id,
//       transfer_amount,
//       transfer_mode: "imps",
//       transfer_purpose: "withdrawal",
//       fundsource_id: "CF_WALLET",
//     };

//     // Generate HMAC SHA256 signature
//     const signature = crypto
//       .createHmac("sha256", PAYOUT_CLIENT_SECRET)
//       .update(JSON.stringify(data))
//       .digest("base64");

//     // Create payout request
//     const options = {
//       method: "POST",
//       url: "https://api.cashfree.com/payout/transfers",
//       headers: {
//         accept: "application/json",
//         "x-api-version": "2024-01-01",
//         "content-type": "application/json",
//         "x-client-id": PAYOUT_CLIENT_ID,
//         "x-client-signature": signature,
//       },
//       data,
//     };

//     const response = await axios.request(options);
//     console.log("✅ Cashfree Transfer Response:", response.data);

//     const cf_transfer_id = response.data?.cf_transfer_id;
//     if (!cf_transfer_id)
//       return res.json({
//         status: "failed",
//         message: "Unable to initiate transfer",
//       });

//     // Check transfer status
//     const checkOptions = {
//       method: "GET",
//       url: `https://api.cashfree.com/payout/transfers?cf_transfer_id=${cf_transfer_id}`,
//       headers: {
//         accept: "application/json",
//         "x-api-version": "2024-01-01",
//         "x-client-id": PAYOUT_CLIENT_ID,
//         "x-client-signature": signature,
//       },
//     };

//     const statusResponse = await axios.request(checkOptions);
//     console.log("🔍 Cashfree Status Response:", statusResponse.data);

//     const {
//       status,
//       status_description,
//       transfer_mode,
//     } = statusResponse.data || {};

//     // Update wallet balance only if pending/success
//     if (status === "PENDING" || status === "SUCCESS") {
//       userWallet.balance -= transfer_amount;
//       await userWallet.save();
//     }

//     // Log transaction
//     await walletTransactionModel.findOneAndUpdate(
//       { userId: req.user.id },
//       {
//         $push: {
//           withdrawalTransactions: {
//             transactionId: transfer_id,
//             beneficiaryId: beneficiary_id,
//             cfTransferId: cf_transfer_id,
//             status,
//             method: transfer_mode,
//             amount: transfer_amount,
//             statusDescription: status_description,
//             createdAt: new Date(),
//           },
//         },
//       },
//       { upsert: true, new: true }
//     );

//     return res.json({
//       status: "success",
//       message: "Withdrawal initiated successfully",
//       data: {
//         transfer_id,
//         cf_transfer_id,
//         status,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Withdraw Error:", error.response?.data || error.message);
//     return res.status(500).json({
//       status: "failed",
//       message:
//         error.response?.data?.message ||
//         "Error while processing withdrawal request",
//     });
//   }
// };
