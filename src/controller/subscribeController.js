const express = require("express");
const SubscribedUser = require("../model/subscribe.Schema");
const BlogCategory = require("../model/blogCategory.Schema");
const { sendResponse } = require("../utils/common");

const subscribeController = express.Router();

// Subscribe API (handles both "All" and category newsletter)
subscribeController.post("/subscribe", async (req, res) => {
  try {
    const { email, subscribedFor = "All", blogCategoryId } = req.body;
    if (!email) {
      return sendResponse(res, 400, "Failed", {
        message: "Email is required.",
      });
    }
    // Check for existing subscription for same email/category
    let exists;
    if (subscribedFor === "All") {
      exists = await SubscribedUser.findOne({ email, subscribedFor: "All" });
      if (exists)
        return sendResponse(res, 409, "Failed", {
          message: "Already subscribed.",
        });
    } else if (subscribedFor === "Category" && blogCategoryId) {
      exists = await SubscribedUser.findOne({
        email,
        subscribedFor: "Category",
        blogCategoryId,
      });
      if (exists)
        return sendResponse(res, 409, "Failed", {
          message: "Already subscribed to this category.",
        });
    } else {
      return sendResponse(res, 400, "Failed", {
        message: "Invalid subscription type or missing category.",
      });
    }

    const doc = await SubscribedUser.create({
      email,
      subscribedFor,
      blogCategoryId: subscribedFor === "Category" ? blogCategoryId : undefined,
    });

    sendResponse(res, 200, "Success", {
      message: "Subscribed successfully!",
      data: doc,
      statusCode: 200,
    });
  } catch (error) {
    sendResponse(res, 500, "Failed", {
      message: error.message,
      statusCode: 500,
    });
  }
});

// List all subscribers, with filtering by type/category
subscribeController.post("/list", async (req, res) => {
  try {
    const {
      subscribedFor,
      blogCategoryId,
      pageNo = 1,
      pageCount = 50,
      searchKey = "",
    } = req.body;
    const query = {};
    if (subscribedFor) query.subscribedFor = subscribedFor;
    if (blogCategoryId) query.blogCategoryId = blogCategoryId;
    if (searchKey) query.email = { $regex: searchKey, $options: "i" };

    const list = await SubscribedUser.find(query)
      .populate("blogCategoryId", "name")
      .skip((pageNo - 1) * pageCount)
      .limit(pageCount)
      .sort({ createdAt: -1 });

    const totalCount = await SubscribedUser.countDocuments(query);
    sendResponse(res, 200, "Success", {
      message: "List fetched",
      data: list,
      totalCount,
      statusCode: 200,
    });
  } catch (error) {
    sendResponse(res, 500, "Failed", {
      message: error.message,
      statusCode: 500,
    });
  }
});

module.exports = subscribeController;
