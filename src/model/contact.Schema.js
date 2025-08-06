const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const { type } = require("os");

const contactSchema = mongoose.Schema({
  fullName: {
    type: String,
  },
  // contactNumber: {
  //   type: Number,
  // },
  // subject:{
  //   type: String,
  // },
  email: {
    type: String,
  },
  message:{
    type: String,
  },
  // category:{
  //   type: String,
  // },
});

contactSchema.plugin(timestamps);
module.exports = mongoose.model("Contact", contactSchema);
