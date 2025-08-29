const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const { type } = require("os");

const carrerCategorySchema = mongoose.Schema({
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

carrerCategorySchema.plugin(timestamps);
module.exports = mongoose.model("CareerCategory", carrerCategorySchema);