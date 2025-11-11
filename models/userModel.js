// File: models/userModel.js

const mongoose = require('mongoose');
const { getPasswordHash } = require('../utils/Utils');

const beneficiarySchema = new mongoose.Schema({
    transfer_mode: { type: String, enum: ["upi", "banktransfer", "paytm"], required: true },
    beneficiary_id: { type: String, required: true },
    beneficiary_name: { type: String, required: true },
    beneficiary_contact_details: {
        type: {
            beneficiary_email: { type: String },
            beneficiary_phone: { type: String },
        }
    },
    beneficiary_status: { type: String },
    added_by: { type: String },
    beneficiary_instrument_details: {
        type: {
            bank_account_number: { type: String },
            bank_ifsc: { type: String },
            vpa: { type: String },
        }
    }

}, { timestamps: true })

const loginSchema = new mongoose.Schema({
    firstName: {
        type: String,
        // required: true,
        trim: true
    },
    lastName: {
        type: String,
        // required: true,
        trim: true
    },
    userName: {
        type: String,
        // required: true,
        unique: true,
        trim: true
    },
    memberCode: {
        type: String,
        // required: true,
        unique: true,

    },
    dateOfBirth: {
        type: String,
    },
    phoneNumber: {
        type: String,
        trim: true
    },
    otp:{
        type: String,
        default: null
    },
    otpExpire:{
        type: Date,
        default: null
    },
    email: {
        type: String,
    },
    password: {
        type: String,
      
    },
    emailOtp:{
        type: String,
        default: null
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    emailOtpExpiresIn: {
        type: Date,
    },
    state: {
        type: String,
    },
    deletedAt: {
        type: Date
        , default: null
    },

    referralCode: { type: String, unique: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId },
    memberedBy: { type: mongoose.Schema.Types.ObjectId },
    beneficiaries: [beneficiarySchema],
    otp: { type: String },  // OTP for verification
    otpExpires: { type: Date }, // Expiry for OTP
    walletId: { type: mongoose.Schema.Types.ObjectId, ref: 'wallet' },
    walletTransactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'walletTransaction' },
    walletBalance: { type: Number, default: 0 }
}, { timestamps: true });

// Hash the password before saving the document
loginSchema.pre("save", function (next) {
    if (this.isModified('password')) {
        this.password = getPasswordHash(this.password);
    }
    next();
});

const LoginModule = mongoose.model('Login', loginSchema);
module.exports = LoginModule;
