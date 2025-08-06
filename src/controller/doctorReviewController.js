const express = require("express");
const DoctorReview = require("../model/doctorReview.Schema");
const { sendResponse } = require("../utils/common");
const doctorReviewController = express.Router();
require("dotenv").config();
const upload = require("../utils/multer");
const cloudinary = require("../utils/cloudinary");

doctorReviewController.post(
  "/create",
  upload.single("video"),
  async (req, res) => {
    try {
      const { type, review, rating, userId } = req.body;

      if (!type || !rating || !userId) {
        return sendResponse(res, 400, "Failed", {
          message: "Required fields are missing.",
        });
      }

      let videoUrl = "";

      if (type === "video") {
        if (!req.file) {
          return sendResponse(res, 400, "Failed", {
            message: "Video file is required for video type.",
          });
        }
        const uploadedVideo = await cloudinary.uploader.upload(req.file.path, {
          resource_type: "video",
        });
        videoUrl = uploadedVideo.secure_url;
      }

      const newReview = await DoctorReview.create({
        type,
        review: type === "text" ? review : "",
        videoUrl: type === "video" ? videoUrl : "",
        rating,
        userId,
      });

      const allReviews = await DoctorReview.find({});
      const avgRating = (
        allReviews.reduce((sum, r) => sum + Number(r.rating), 0) /
        allReviews.length
      ).toFixed(1);

      sendResponse(res, 200, "Success", {
        message: "Review submitted successfully!",
        data: newReview,
        averageRating: avgRating,
        statusCode: 200,
      });
    } catch (error) {
      sendResponse(res, 500, "Failed", {
        message: error.message,
        statusCode: 500,
      });
    }
  }
);

doctorReviewController.post("/list", async (req, res) => {
  try {
    const {
      type = "",
      status,
      pageNo = 1,
      pageCount = 10,
      sortByField,
      sortByOrder,
    } = req.body;

    const query = {};
    if (status) query.status = status;
    if (type && type !== "") query.type = type;
    
    const sortField = sortByField || "createdAt";
    const sortOrder = sortByOrder === "asc" ? 1 : -1;
    const sortOption = { [sortField]: sortOrder };

    const reviews = await DoctorReview.find(query)
      .populate("userId", "name")
      .sort(sortOption)
      .limit(parseInt(pageCount))
      .skip(parseInt(pageNo - 1) * parseInt(pageCount));

    const totalCount = await DoctorReview.countDocuments({});
    const activeCount = await DoctorReview.countDocuments({ status: true });
    sendResponse(res, 200, "Success", {
      message: "List fetched",
      data: reviews,
      documentCount: {
        totalCount,
        activeCount,
        inactiveCount: totalCount - activeCount,
      },
      statusCode: 200,
    });
  } catch (error) {
    sendResponse(res, 500, "Failed", {
      message: error.message,
      statusCode: 500,
    });
  }
});

doctorReviewController.put(
  "/update",
  upload.single("video"),
  async (req, res) => {
    try {
      const { _id, type, review, rating, userId, status } = req.body;
      let update = { type, rating, userId, status };

      // If type is text, update review and clear videoUrl
      if (type === "text") {
        update.review = review;
        update.videoUrl = "";
      }

      // If type is video…
      if (type === "video") {
        // If client uploaded a new video
        if (req.file) {
          // 1. Upload to Cloudinary
          const uploadedVideo = await cloudinary.uploader.upload(
            req.file.path,
            {
              resource_type: "video",
            }
          );
          update.videoUrl = uploadedVideo.secure_url;
        }
      }

      // Don't update the review text for video (optional - depends on your rule)
      if (type === "video") {
        update.review = "";
      }

      // Update the document
      const updated = await DoctorReview.findByIdAndUpdate(_id, update, {
        new: true,
      });

      sendResponse(res, 200, "Success", {
        message: "Review updated",
        data: updated,
        statusCode: 200,
      });
    } catch (error) {
      sendResponse(res, 500, "Failed", {
        message: error.message,
        statusCode: 500,
      });
    }
  }
);

doctorReviewController.delete("/delete/:id", async (req, res) => {
  try {
    await DoctorReview.findByIdAndDelete(req.params.id);
    sendResponse(res, 200, "Success", {
      message: "Review deleted",
      statusCode: 200,
    });
  } catch (error) {
    sendResponse(res, 500, "Failed", {
      message: error.message,
      statusCode: 500,
    });
  }
});

module.exports = doctorReviewController;
