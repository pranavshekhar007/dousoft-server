const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");

const carrerSchema = mongoose.Schema({
  title: { type: String, required: true },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CareerCategory",
    required: true,
  },
  location: { type: String },
  jobType: { type: String },
  mode: { type: String, default: "Remote" },
  customTags: [{ type: String }],
  description: { type: String },
  status: { type: Boolean, default: true },
});

carrerSchema.plugin(timestamps);
module.exports = mongoose.model("Career", carrerSchema);
