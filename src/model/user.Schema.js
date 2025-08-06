const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const { type } = require("os");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  
  // subscriptionDetails: {
  //   subscriptionId: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "SubscriptionChit",
  //   },
  //   planName: { type: String },
  //   planPrice: { type: String },
  //   duration: { type: Number },
  //   startDate: { type: Date },
  //   endDate: { type: Date },
  // },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  // emailOtp: {
  //   type: String,
  // },
  // phoneOtp: {
  //   type: String,
  // },
  token: {
    type: String,
  },
  // phone: {
  //   type: String,
  //   required: true,
  // },
  // profilePic: {
  //   type: String,
  // },
  // isEmailVerified: {
  //   type: Boolean,
  //   default: false,
  // },
  // isPhoneVerified: {
  //   type: Boolean,
  //   default: false,
  // },
  // countryCode: {
  //   type: String,
  //   default: "91",
  // },
    status: {
      type: Boolean,
      default: true,
  },
  pincode: {
    type: String,
  },
  address: {
    type: String,
  },

  // In user.Schema.js
resetPasswordToken: {
  type: String,
  default: "",
},
resetPasswordExpires: {
  type: Date,
},

  // cartItems: [{
  //   itemId: { type: String, required: true },
  //   itemType: { type: String, enum: ["Product", "ComboProduct"], required: true },
  //   quantity: { type: Number },
  // }],
    // wishListItems: [{ type: String, ref: "Product" }],
});

userSchema.plugin(timestamps);
module.exports = mongoose.model("User", userSchema);
