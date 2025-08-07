const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const { type } = require("os");

const blogCategorySchema = mongoose.Schema({
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

blogCategorySchema.plugin(timestamps);
module.exports = mongoose.model("BlogCategory", blogCategorySchema);