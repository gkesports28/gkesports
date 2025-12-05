const { default: axios } = require("axios");
const { Cashfree } = require("cashfree-pg");
const LoginModule = require("../models/userModel");
const walletModel = require("../models/WalletModel");
const {
  addFundsService,
  withdrawFundsService,
  reverseFundsService,
} = require("../services/walletService");
const paymentModel = require("../models/paymentModel");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const payoutModel = require("../models/payoutModel");
const { calculatePayoutCharges } = require("../utils/chargesUtil");
const express = require("express");
const app = express();

app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);

require("dotenv").config();
const clientId = process.env.PAYMENT_CLIENT_ID;
const clientSecret = process.env.PAYMENT_CLIENT_SECRET;

//Payout Client Id and Client Secret
const PAYMENT_CLIENT_ID = process.env.PAYMENT_CLIENT_ID;
const PAYMENT_CLIENT_SECRET = process.env.PAYMENT_CLIENT_SECRET;
const PAYOUT_CLIENT_ID = process.env.TEST_ID;
const PAYOUT_CLIENT_SECRET = process.env.TEST_SECRET;
// const PAYOUT_CLIENT_ID = process.env.PAYOUT_CLIENT_ID;
// const PAYOUT_CLIENT_SECRET = process.env.PAYOUT_CLIENT_SECRET;
Cashfree.XClientId = process.env.PAYMENT_CLIENT_ID;
Cashfree.XClientSecret = process.env.PAYMENT_CLIENT_SECRET;
Cashfree.XEnvironment = Cashfree.Environment.PRODUCTION;
// Generate random order ID
function generateOrderId() {
  const uniqueId = crypto.randomBytes(16).toString("hex");
  const hash = crypto.createHash("sha256").update(uniqueId).digest("hex");
  return hash.substr(0, 12);
}

// exports.withdrawFunds = async (req, res) => {
//   const { transfer_amount, beneficiary_id } = req.body;

//   try {
//     // Validate wallet
//     const userWallet = await walletModel.findOne({ userId: req.user.id });
//     if (!userWallet)
//       return res.json({ status: "failed", message: "Unable to get wallet" });

//     if (userWallet.winningBalance < transfer_amount)
//       return res.json({
//         status: "failed",
//         message: "Wallet does not contain sufficient balance",
//       });

//     // Fetch user and beneficiary
//     const user = await LoginModule.findOne({ _id: req.user.id });
//     const beneficiary = user?.beneficiaries?.find(
//       (b) => b?.beneficiary_id?.toString() === beneficiary_id?.toString()
//     );
//     if (!beneficiary)
//       return res.json({ status: "failed", message: "Beneficiary not found" });

//     // Calculate payout & charges
//     const pgCharges = calculatePayoutCharges(transfer_amount);
//     const transferableAmount = transfer_amount - pgCharges;

//     // Prepare request body for Cashfree
//     const data = {
//       beneficiary_details: { beneficiary_id: beneficiary.beneficiary_id },
//       transfer_id: generateOrderId(),
//       transfer_amount: transferableAmount,
//       fundsource_id: "CF_WALLET",
//       transfer_mode: beneficiary.transfer_mode || "imps",
//     };

//     // ✅ Generate HMAC SHA256 signature (correct way)
//     const signature = crypto
//       .createHmac("sha256", PAYOUT_CLIENT_SECRET)
//       .update(JSON.stringify(data))
//       .digest("base64");

//     // Prepare request options
//     const options = {
//       method: "POST",
//       url: "https://payout-api.cashfree.com/payout/v1/transfers",
//       headers: {
//         accept: "application/json",
//         "x-api-version": "2024-01-01",
//         "content-type": "application/json",
//         "x-client-id": PAYOUT_CLIENT_ID,
//         "x-client-secret": PAYOUT_CLIENT_SECRET,
//         "x-signature": signature,
//       },
//       data,
//     };
//     // Call Cashfree API
//     const response = await axios.request(options);
//     const { transfer_id, cf_transfer_id } = response.data;

//     // Save payout record
//     const newPayout = new payoutModel({
//       userId: req.user.id,
//       transferId: transfer_id,
//       cfTransferId: cf_transfer_id,
//       amount: transferableAmount,
//       paymentMode: "imps",
//       pgCharges: pgCharges,
//     });

//     await newPayout.save();

//     // Update wallet balances
//     userWallet.winningBalance -= transfer_amount;
//     userWallet.balance -= transfer_amount;
//     await userWallet.save();

//     return res.json({
//       status: "success",
//       message: "Funds withdrawal request is processing.",
//     });
//   } catch (e) {
//     console.error("❌ WithdrawFunds Error:", e.message);
//     console.log("error", e);
//     res.json({ status: "failed", message: e.message });
//   }
// };
//SDK Payout
exports.payoutWebhook = async (req, res) => {
  try {
    // const signature = req.headers["x-webhook-signature"];
    // const payload = JSON.stringify(req.body);

    // // Verify Cashfree signature
    // const computedSignature = crypto
    //   .createHmac("sha256", process.env.PAYOUT_WEBHOOK_SECRET)
    //   .update(payload)
    //   .digest("base64");

    // if (computedSignature !== signature) {
    //     return res.status(401).json({ message: "Invalid Signature" });
    // }

    const { event, ...data } = req.body;
    console.log("Received Webhook Event:", event, data);

    if (!event) {
      return res.status(400).json({ message: "Event is not defined" });
    }

    let payoutTransaction;
    let userId, amount, pgCharges; // Declare variables here for broader scope

    if (data?.transferId) {
      payoutTransaction = await payoutModel.findOne({
        transferId: data.transferId,
      });
      if (!payoutTransaction) {
        return res.status(404).json({ message: "Payout not found" });
      }

      // Initialize variables inside the if block
      ({ userId, amount, pgCharges } = payoutTransaction);
      console.log(userId, amount, pgCharges);
      console.log(event, "event");
    }

    // Ensure the variables are defined before using them in the switch statement
    // if (!userId || !amount) {
    //     return res.status(400).json({ message: "Missing userId or amount" });
    // }

    switch (event) {
      case "LOW_BALANCE_ALERT":
        console.log("⚠️ Low Balance Alert");
        const { currentBalance, alertTime } = data;
        console.log(
          `Current Balance: ₹${currentBalance}, Alert Time: ${alertTime}`
        );

        // Here you can add additional logic for handling low balance alerts,
        // such as sending a notification to an admin or taking specific actions.
        // Example:
        if (parseFloat(currentBalance) < 100) {
          console.log(
            "Balance is below the threshold! Triggering notification..."
          );
          // Send notification or alert to admin
        }

        break;

      case "TRANSFER_SUCCESS":
        payoutTransaction.status = "success";
        await payoutTransaction.save();
        const paidAmount = amount + pgCharges;
        await withdrawFundsService(userId, paidAmount, false);
        console.log(
          `✅ Payout Successful: ID ${data.transferId}, Amount ₹${amount}, Reference ID: ${data.referenceId}`
        );
        break;

      case "TRANSFER_FAILED":
      case "TRANSFER_REVERSED":
      case "TRANSFER_REJECTED":
        payoutTransaction.status =
          event === "TRANSFER_REJECTED" ? "rejected" : "failed";
        await payoutTransaction.save();
        const reverseAmount = amount + pgCharges;
        await reverseFundsService(userId, reverseAmount);
        console.log(
          `❌ Payout ${event.replace("_", " ")}: ID ${data.transferId}, Amount ₹${amount}, Reason: ${data.remarks || data.reason}`
        );
        break;

      default:
        console.log(`⚠️ Unhandled event: ${event}`);
    }

    res.status(200).json({ message: "Webhook received successfully" });
  } catch (error) {
    console.error("Webhook Processing Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// exports.withdrawFunds = async (req, res) => {
//   const { transfer_amount, beneficiary_id } = req.body;
//   console.log(
//     transfer_amount,
//     beneficiary_id,
//     "transfer_amount,beneficiary_id"
//   );

//   const transferableAmount =
//     transfer_amount - calculatePayoutCharges(transfer_amount);
//   const pgCharges = calculatePayoutCharges(transfer_amount);
//   const userWallet = await walletModel.findOne({ userId: req.user.id });
//   if (!userWallet)
//     return res.json({ status: "failed", message: "Unable to get wallet" });
//   if (userWallet.winningBalance < transfer_amount)
//     return res.json({
//       status: "failed",
//       message: "Wallet does not contain sufficient balance",
//     });
//   try {
//     const user = await LoginModule.findOne({ _id: req.user.id });
//     console.log(user, "user");
//     const beneficiary = user.beneficiaries.find(
//       (beneficiary) =>
//         beneficiary?.beneficiary_id.toString() == beneficiary_id.toString()
//     );
//     if (!beneficiary) {
//       return res.json({ status: "failed", message: "Beneficiary not found" });
//     }
//     console.log(beneficiary, "beneficiary");
//     const data = {
//       beneficiary_details: { beneficiary_id: beneficiary?.beneficiary_id },
//       transfer_id: generateOrderId(),
//       transfer_amount: transferableAmount,
//       fundsource_id: "CF_WALLET",
//       transfer_mode: beneficiary.transfer_mode || "imps",
//     };
//     const PUBLIC_KEY_PATH = path.join(__dirname, "../keys/", "public_key.pem"); // Path to the public key file
//     console.log(PUBLIC_KEY_PATH);
//     // Load the public key from the PEM file
//     const publicKey = fs.readFileSync(PUBLIC_KEY_PATH, "utf8");

//     // Function to encrypt data with the public key
//     const encryptWithPublicKey = (data) => {
//       const buffer = Buffer.from(data, "utf8");
//       return crypto.publicEncrypt(publicKey, buffer).toString("base64");
//     };
//     const encryptedPayload = encryptWithPublicKey(JSON.stringify(data));

//     const options = {
//       method: "POST",
//       url: "https://api.cashfree.com/payout/transfers",
//       headers: {
//         accept: "application/json",
//         "x-api-version": "2024-01-01",
//         "content-type": "application/json",
//         "x-client-id": PAYOUT_CLIENT_ID,
//         "x-client-secret": PAYOUT_CLIENT_SECRET,
//         "x-signature": encryptedPayload,
//       },
//       data: data,
//     };

//     const response = await axios.request(options);
//     const { transfer_id, cf_transfer_id } = response.data;
//     const newPayout = new payoutModel({
//       userId: req.user.id,
//       transferId: transfer_id,
//       cfTransferId: cf_transfer_id,
//       amount: transferableAmount,
//       paymentMode: "imps",
//       pgCharges: pgCharges,
//     });
//     console.log(newPayout, "pat");
//     await newPayout.save();
//     const userWallet = await walletModel.findOne({ userId: req.user.id });
//     userWallet.winningBalance = userWallet.winningBalance - transfer_amount;
//     userWallet.balance = userWallet.balance - transfer_amount;
//     await userWallet.save();

//     return res.json({
//       status: "success",
//       message: "Funds withdrawn request is being processing  ",
//     });
//   } catch (e) {
//     console.log(e);
//     res.json({ status: "failed", messge: e.message });
//   }
// };

// Cashfree Payment
exports.createPaymentSession = async (req, res) => {
  try {
    const data = req.body;
    const userDetails = await LoginModule.findOne({ _id: req.user.id });
    // console.log(userDetails, "userDetails");
    const objOrderData = {
      customer_details: {
        customer_id: userDetails?._id,
        customer_email: userDetails?.email,
        customer_phone: userDetails?.phoneNumber,
        customer_name: `${userDetails?.firstName} ${userDetails?.lastName}`,
      },
      order_id: await generateOrderId(),
      order_amount: data.amount,
      order_currency: "INR",
    };
    Cashfree.PGCreateOrder("2023-08-01", objOrderData)
      .then(async (response) => {
        // console.log(response.data);
        if (response && response.data) {
          // console.log(response.data, "response.data");
          await paymentModel.create({
            userId: userDetails._id,
            orderId: response.data.order_id,
            paymentId: response.data.payment_session_id,
            amount: data.amount,
            status: "pending",
          });
          console.log("respojnse", response.data);
          return res.json(response.data);
        } else {
          return res.json({
            status: "fail",
            message: "Invalid response from Cashfree",
          });
        }
      })
      .catch((err) => {
        console.error("Error from Cashfree:", err.data);
        return res.json({
          status: "fail",
          message: "Error occurred while creating order",
        });
      });
  } catch (error) {
    console.log("Internal Server Error:", error);
    res.json({ status: "fail", message: "Something went wrong" });
  }
};

exports.getPaymentSession = async (req, res) => {
  try {
    const paymentSessionId = req.query.paymentSessionId;
    console.log(paymentSessionId, "paymentSessionId");
    const paymentData = await paymentModel.findOne({
      paymentId: paymentSessionId,
    });
    console.log(paymentData, "paymentData");
    if (paymentData) {
      res.json({
        status: "success",
        message: "Payment session fetched successfully",
        paymentId: paymentData.paymentId,
      });
    } else {
      res.json({
        status: "failed",
        message: "Invalid response from Cashfree",
      });
    }
  } catch (error) {
    console.log("Error fetching payment:", error);
    res.json({
      status: "error",
      message: "Error occurred while fetching payment",
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const paymentSessionId = req.params.paymentSessionId;
    // console.log("Received orderId:", orderId);

    const payment = await paymentModel.findOne({ paymentId: paymentSessionId });
    console.log("Fetched payment from DB:", payment);

    if (!payment) {
      // console.log("Payment not found for orderId:", orderId);
      return res.json({ status: "failed", message: "Payment not found" });
    }

    if (payment.status !== "pending") {
      // console.log("Payment already verified with status:", payment.status);
      return res.json({ status: payment.status, message: "Already Verified" });
    }

    console.log(`Verifying payment for orderId:::::: ${payment.orderId}`);

    const response = await Cashfree.PGOrderFetchPayments(
      "2023-08-01",
      payment.orderId
    );
    // console.log("Cashfree API response:", response);

    // const test = true; // for testing purposes
    // if (true) { // for testing purposes
    if (response?.data[0]?.payment_status === "SUCCESS") {
      // console.log("Payment successful for orderId:", orderId);
      // console.log("Response data:", response.data);
      const { userId, amount } = payment;
      console.log(userId, amount, "userId,amount");
      const result = await addFundsService(userId, amount);
      console.log("Funds added successfully:", result);

      payment.status = "success";
      await payment.save();

      return res.json({
        status: "success",
        message: "Payment verified successfully",
      });
    } else if (response?.data[0]?.payment_status === "FAILED") {
      // console.log("Payment failed for orderId:", orderId);

      payment.status = "failed";
      await payment.save();
      console.log("Payment status updated to failed in DB");

      return res.json({
        status: "failed",
        message: "Payment failed",
      });
    } else if (response?.data[0]?.payment_status === "CANCELLED") {
      // console.log("Payment cancelled for orderId:", orderId);

      payment.status = "cancelled";
      await payment.save();
      console.log("Payment status updated to cancelled in DB");

      return res.json({
        status: "cancelled",
        message: "Payment was cancelled by the user",
      });
    } else {
      // console.log("Payment still processing for orderId:", orderId);

      return res.json({
        status: "pending",
        message: "Payment is still processing",
      });
    }
  } catch (error) {
    console.log("Error occurred while verifying payment:", error);

    res.json({
      status: "error",
      message: "Error occurred while verifying payment",
    });
  }
};

exports.paymentWebhook = async (req, res) => {
  try {
    // const signature = req.headers["x-webhook-signature"];
    // const timestamp = req.headers["x-webhook-timestamp"];
    // const rawBody = JSON.stringify(req.body);
    // console.log(rawBody,"signature,timestamp,rawBody")
    // if(JSON.parse(rawBody)?.data?.test_object?.test_key)
    //   return res.status(200).send("Testing Enviroment ");
    // // Verify signature
    // const dataToSign = timestamp + rawBody;
    // const computedSignature = crypto
    //   .createHmac("sha256", process.env.PAYMENT_WEBHOOK_SECRET)
    //   .update(dataToSign)
    //   .digest("base64");
    // if (computedSignature !== signature) {
    //   console.log("Signature Verification Failed",computedSignature,signature);
    //   return res.status(400).send("Invalid signature");
    // }
    console.log(req.body, "req.body");
    const { data } = req.body;
    if (data?.test_object?.test_key) {
      console.log("Testing Environment");
      return res.status(200).json({ message: "Tested Successfully" });
    }

    const { payment, order } = data;
    const { order_id } = order;
    const { payment_status, payment_amount } = payment;
    const customerPayment = await paymentModel.findOne({ orderId: order_id });
    // console.log("Fetched payment from DB:", payment);

    if (!customerPayment) {
      // console.log("Payment not found for orderId:", orderId);
      return res.json({ status: "failed", message: "Payment not found" });
    }
    if (customerPayment.status !== "pending") {
      // console.log("Payment already verified with status:", payment.status);
      return res.json({
        status: customerPayment.status,
        message: "Already Verified",
        payment: customerPayment,
      });
    }

    console.log(
      `payment status from (webhook) payment_status:::::* ${payment_status} | payment_amount: ${payment_amount} | payment_status from DB: ${customerPayment.status} `
    );
    let status;
    if (payment_status === "SUCCESS") {
      status = "success";
    } else if (payment_status === "FAILED") {
      status = "failed";
    } else if (payment_status === "EXPIRED") {
      status = "expired";
    } else if (payment_status === "CANCELLED") {
      status = "cancelled";
    }

    console.log(
      `Payment status from (webhook) status::::** ${status} | payment_status: ${payment_status} `
    );
    // Update payment status in the database
    const updatedPayment = await paymentModel.findOneAndUpdate(
      { orderId: order_id },
      { status },
      { new: true }
    );

    console.log(
      `(payment webhook) Updated Payment status::::::: ${updatedPayment}`
    );

    if (updatedPayment) {
      // console.log(`Payment updated: ${order_id} -> ${status}`);
      // If payment is successful, update user's wallet balance
      if (updatedPayment.status === "success") {
        const { userId, amount } = updatedPayment;
        console.log(userId, amount, "userId,amount");

        const result = await addFundsService(userId, amount);
        console.log("Funds added successfully:", result);

        console.log(
          `Wallet updated for user: ${updatedPayment.userId}, Amount: ${payment_amount}`
        );
      }
    } else {
      console.log(`Payment not found for order_id: ${order_id}`);
    }
    return res.status(200).send("Webhook received and processed");
  } catch (error) {
    console.error("Webhook Processing Error:", error);
    return res.status(500).send("Internal Server Error");
  }
};

// test cashfree payout

// proper working with whitelist IP don't change
exports.withdrawFunds = async (req, res) => {
  const { transfer_amount, beneficiary_id } = req.body;

  try {
    // Validate wallet
    const userWallet = await walletModel.findOne({ userId: req.user.id });
    if (!userWallet)
      return res.json({ status: "failed", message: "Unable to get wallet" });

    if (userWallet.winningBalance < transfer_amount)
      return res.json({
        status: "failed",
        message: "Wallet does not contain sufficient balance",
      });

    // Fetch user and beneficiary
    const user = await LoginModule.findOne({ _id: req.user.id });
    const beneficiary = user?.beneficiaries?.find(
      (b) => b?.beneficiary_id?.toString() === beneficiary_id?.toString()
    );
    if (!beneficiary)
      return res.json({ status: "failed", message: "Beneficiary not found" });

    // Calculate payout & charges
    const pgCharges = calculatePayoutCharges(transfer_amount);
    const transferableAmount = transfer_amount - pgCharges;

    // Prepare request body for Cashfree
    const data = {
      beneficiary_details: { beneficiary_id: beneficiary.beneficiary_id },
      transfer_id: generateOrderId(),
      transfer_amount: transferableAmount,
      fundsource_id: "CF_WALLET",
      transfer_mode: beneficiary.transfer_mode || "imps",
    };

    //  Generate HMAC SHA256 signature (correct way)
    console.log({ PAYMENT_CLIENT_ID, PAYOUT_CLIENT_SECRET });
    const signature = await axios.post(
      "https://payout-api.cashfree.com/payout/v1/authorize",
      {},
      {
        headers: {
          "X-Client-Id": PAYOUT_CLIENT_ID,
          "X-Client-Secret": PAYOUT_CLIENT_SECRET,
        },
      }
    );
    console.log(":toke", signature.data);
    // Prepare request options
    const token = signature.data.data.token;
    const options = {
      method: "POST",
      url: "https://api.cashfree.com/payout/transfers",
      headers: {
        accept: "application/json",
        "x-api-version": "2024-01-01",
        "content-type": "application/json",
        "x-client-id": PAYOUT_CLIENT_ID,
        "x-client-secret": PAYOUT_CLIENT_SECRET,
        Authorization: `Bearer ${token}`,
      },
      data,
    };
    // Call Cashfree API
    const response = await axios.request(options);
    console.log("resonse", response);
    const { transfer_id, cf_transfer_id } = response.data;

    // Save payout record
    const newPayout = new payoutModel({
      userId: req.user.id,
      transferId: transfer_id,
      cfTransferId: cf_transfer_id,
      amount: transferableAmount,
      paymentMode: "imps",
      pgCharges: pgCharges,
    });

    await newPayout.save();

    // Update wallet balances
    userWallet.winningBalance -= transfer_amount;
    userWallet.balance -= transfer_amount;
    await userWallet.save();

    return res.json({
      status: "success",
      message: "Funds withdrawal request is processing.",
    });
  } catch (e) {
    console.error("❌ WithdrawFunds Error:", e.message);
    console.log("error", e);
    res.json({ status: "failed", message: e.message });
  }
};
