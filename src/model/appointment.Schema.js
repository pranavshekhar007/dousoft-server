const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");

const appointmentSchema = new mongoose.Schema({

  name: {
    type: String,
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
    trim: true,
  },
  date: {
    type: String,
  },
  time: {
    type: String,
  },
  subject: {
    type: String,
  },

  status: {
    type: String,
    enum: ["pending", "confirmed", "rejected"],
    default: "pending",
  },
});

appointmentSchema.plugin(timestamps);

module.exports = mongoose.model("Appointment", appointmentSchema);
