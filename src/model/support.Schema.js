const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const { type } = require("os");

const supportSchema = mongoose.Schema({
  // userPrivacyPolicy: {
  //   type: String,
  // },
  // userTermsAndCondition: {
  //   type: String,
  // },
  // userCookiePolicy: {
  //   type: String,
  // },
  // userShippingPolicy: {
  //   type: String,
  // },
  // refundAndReturn: {
  //   type: String,
  // },
  // supportContact: {
  //   type: String,
  // },
  // supportEmail: {
  //   type: String,
  // },

  fullName: { type: String, required: true },
  email:    { type: String, required: true },
  message:  { type: String, required: true },


});

supportSchema.plugin(timestamps);
module.exports = mongoose.model("Support", supportSchema);
