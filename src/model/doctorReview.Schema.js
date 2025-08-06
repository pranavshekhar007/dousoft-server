const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");

const doctorReviewSchema = mongoose.Schema({
  type: {
    type: String,
    enum: ["text", "video"],
    required: true,
    default: "text"
  },
  review: {
    type: String,
    default: "",
  },
  videoUrl: {
    type: String,
    default: "",
  },
  rating: {
    type: Number,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reply: {
    type: String,
    default: "",
  },
  status: {
    type: Boolean,
    default: true,
  },
});

doctorReviewSchema.plugin(timestamps);
module.exports = mongoose.model("DoctorReview", doctorReviewSchema);
