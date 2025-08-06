const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");

const appointmentSchema = new mongoose.Schema({
  location: {
    type: String,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
    trim: true,
  },
  treatmentService: {
    type: String,
    trim: true,
  },
  date: {
    type: String,
  },
  time: {
    type: String,
  },
  address: {
    type: String,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  zip: {
    type: String,
  },
  country: {
    type: String,
  },
  dob: {
    type: String,
  },
  history: {
    type: String,
  },
  diagnosed: {
    type: Boolean,
    default: false,
  },
  gdpr: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "rejected"],
    default: "pending",
  },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
});

appointmentSchema.plugin(timestamps);

module.exports = mongoose.model("Appointment", appointmentSchema);
