const axios = require("axios");
require("dotenv").config();
console.log(process.env.PAYOUT_CLIENT_ID, process.env.PAYOUT_CLIENT_SECRET);
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const LoginModule = require("../models/userModel");
function generateBeneficiaryID() {
  const uniqueId = crypto.randomBytes(16).toString("hex");
  const hash = crypto.createHash("sha256").update(uniqueId).digest("hex");
  return hash.substr(0, 12);
}
const addBeneficiary = async (req, res) => {
  const {
    beneficiary_name,
    beneficiary_phone,
    bank_account_number,
    bank_ifsc,
    vpa,
    transfer_mode,
  } = req.body;

  const userId = req.user.id;
  let data;
  if (transfer_mode == "upi") {
    data = {
      beneficiary_id: generateBeneficiaryID(),
      beneficiary_name: beneficiary_name,
      beneficiary_instrument_details: { vpa: vpa },
    };
  } else if (transfer_mode == "banktransfer") {
    data = {
      beneficiary_id: generateBeneficiaryID(),
      beneficiary_name: beneficiary_name,
      beneficiary_instrument_details: { bank_account_number, bank_ifsc },
    };
  } else {
    data = {
      beneficiary_id: generateBeneficiaryID(),
      beneficiary_name: beneficiary_name,
      beneficiary_contact_details: { beneficiary_phone },
    };
  }
  const PUBLIC_KEY_PATH = path.join(
    __dirname,
    "../keys/",
    "public_key_test.pem"
  ); // Path to the public key file
  console.log(PUBLIC_KEY_PATH);
  // Load the public key from the PEM file
  const publicKey = fs.readFileSync(PUBLIC_KEY_PATH, "utf8");

  // Function to encrypt data with the public key
  const encryptWithPublicKey = (data) => {
    const buffer = Buffer.from(data, "utf8");
    return crypto.publicEncrypt(publicKey, buffer).toString("base64");
  };

  const encryptedPayload = encryptWithPublicKey(JSON.stringify(data));
  try {
    const options = {
      method: "POST",
      url: "https://api.cashfree.com/payout/beneficiary",
      headers: {
        accept: "application/json",
        "x-api-version": "2024-01-01",
        "content-type": "application/json",
        "x-client-id": process.env.PAYOUT_CLIENT_ID,
        "x-client-secret": process.env.PAYOUT_CLIENT_SECRET,
        "x-signature": encryptedPayload,
      },
      data: data,
    };

    const response = await axios.request(options);
    console.log(response);

    const addBeneficiary = await LoginModule.findOneAndUpdate(
      { _id: req.user.id },
      { $push: { beneficiaries: { ...response.data, transfer_mode } } }, // Corrected $push usage
      { new: true } // Optional: to return the updated document
    );

    if (!addBeneficiary) {
      return res.json({
        status: "fail",
        message: "Something went wrong",
      });
    }
    return res.json({
      status: "success",
      message: "Beneficiary added successfully",
    });
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      if (data && data.message) {
        if (data.message.includes("already added")) {
          return res.status(status).json({
            status: "failed",
            message: "Beneficiary already exists.",
          });
        }
        return res.status(status).json({
          status: "failed",
          message: data.message,
        });
      }
    }
    console.log(error.message, "error");
    res
      .status(500)
      .json({ status: "failed", message: "Internal Server Error" });
  }
};

const removeBeneficiary = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ status: "failed", message: "Beneficiary ID is required" });
    }
    const userBeneficiary = await LoginModule.findOne({
      _id: req.user.id,
      "beneficiaries.beneficiary_id": id,
    });
    if (!userBeneficiary) {
      return res
        .status(404)
        .json({ status: "failed", message: "Beneficiary not found" });
    }

    const PUBLIC_KEY_PATH = path.join(__dirname, "../keys/public_key.pem");
    const publicKey = fs.readFileSync(PUBLIC_KEY_PATH, "utf8");

    // Encrypt data with the public key
    const encryptWithPublicKey = (data) => {
      const buffer = Buffer.from(data, "utf8");
      return crypto.publicEncrypt(publicKey, buffer).toString("base64");
    };

    const encryptedPayload = encryptWithPublicKey(JSON.stringify({ id }));

    const options = {
      method: "DELETE",
      url: `https://api.cashfree.com/payout/beneficiary?beneficiary_id=${id}`,
      headers: {
        accept: "application/json",
        "x-api-version": "2024-01-01",
        "content-type": "application/json",
        "x-client-id": process.env.PAYOUT_CLIENT_ID,
        "x-client-secret": process.env.PAYOUT_CLIENT_SECRET,
        "x-signature": encryptedPayload,
      },
    };

    // Make API request to remove beneficiary
    const response = await axios.request(options);
    console.log("Cashfree Response:", response.data);

    // Remove beneficiary from database
    const updatedUser = await LoginModule.findOneAndUpdate(
      { _id: req.user.id },
      { $pull: { beneficiaries: { beneficiary_id: id } } },
      { new: true }
    );

    if (!updatedUser) {
      return res
        .status(500)
        .json({ status: "failed", message: "Error in deleting beneficiary" });
    }

    return res.json({
      status: "success",
      message: "Beneficiary deleted successfully",
    });
  } catch (error) {
    console.error("Error Removing Beneficiary:", error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};

const getBeneficiaries = async (req, res) => {
  const user = await LoginModule.findOne({ _id: req.user.id });
  const beneficiaries = user?.beneficiaries;
  if (beneficiaries?.length == 0)
    return res.json({ status: "success", data: [], message: "No data found" });

  return res.json({
    status: "success",
    data: beneficiaries,
    message: "Data found successfully",
  });
};

module.exports = { addBeneficiary, removeBeneficiary, getBeneficiaries };
