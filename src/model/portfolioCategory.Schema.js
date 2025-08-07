const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const { type } = require("os");

const portfolioCategorySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
  image: {
    type: String,
  },
});

portfolioCategorySchema.plugin(timestamps);
module.exports = mongoose.model("PortfolioCategory", portfolioCategorySchema);