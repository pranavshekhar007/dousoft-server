const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");

const subscribedUserSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  subscribedFor: {
    type: String,
    enum: ["All", "Category"],
    required: true,
    default: "All",
  },
  blogCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BlogCategory",
    required: function () {
      return this.subscribedFor === "Category";
    },
  },
  subscribedAt: { type: Date, default: Date.now },
});

subscribedUserSchema.plugin(timestamps);
module.exports = mongoose.model("SubscribedUser", subscribedUserSchema);
