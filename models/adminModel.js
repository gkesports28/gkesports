const mongoose = require("mongoose");
const { getPasswordHash } = require("../utils/Utils");

const adminLogin = new mongoose.Schema({
    firstName: {
        type: String,
        
    },
    lastName: {
        type: String,
        
    },
    phoneNumber: {
        type: String,
        
        unique: true,
        trim: true
    },
    email:{type:String,required:true},
    password:{type:String,required:true},
    otp: { type: String },  // OTP for verification
    otpExpires: { type: Date }, // Expiry for OTP
    socialLinks:{
        type:{
            facebook:{type:String},
            instagram:{type:String},
            linkedIn:{type:String},
            twitter:{type:String},
        }
    }
},{timestamps:true})

adminLogin.pre("save", function (next) {
    if (this.isModified('password')) {
        this.password = getPasswordHash(this.password);
    }
    next();
});

const AdminModel = mongoose.model("admin_login",adminLogin)   
module.exports = AdminModel