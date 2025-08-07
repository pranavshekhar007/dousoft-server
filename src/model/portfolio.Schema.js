const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");

const portfolioSchema = mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String },
  gallery: [{ type: String }],
  url: { type: String },
  client: { type: String },
  technologies: [{ type: String }],
  status: { type: Boolean, default: true },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PortfolioCategory",
    required: true,
  },
});

portfolioSchema.plugin(timestamps);
module.exports = mongoose.model("Portfolio", portfolioSchema);
