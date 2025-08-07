const express = require("express");
const Portfolio = require("../model/portfolio.Schema");
const { sendResponse } = require("../utils/common");
const upload = require("../utils/multer"); // for image upload
const cloudinary = require("../utils/cloudinary");

const portfolioController = express.Router();

// CREATE
portfolioController.post(
  "/create",
  upload.single("image"),
  async (req, res) => {
    try {
      let obj = { ...req.body };
      if (req.file) {
        const image = await cloudinary.uploader.upload(req.file.path);
        obj.image = image.url;
      }
      // gallery upload support (optional)
      // if (req.files && req.files.gallery) {...}
      const portfolio = await Portfolio.create(obj);
      sendResponse(res, 200, "Success", {
        message: "Portfolio created",
        data: portfolio,
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

// LIST
portfolioController.post("/list", async (req, res) => {
  try {
    const {
      searchKey = "",
      status,
      categoryId,
      pageNo = 1,
      pageCount = 10,
    } = req.body;
    const query = {};
    if (searchKey) query.title = { $regex: searchKey, $options: "i" };
    if (status !== undefined && status !== "")
      query.status = status === "true" || status === true;
    if (categoryId) query.categoryId = categoryId;

    const portfolios = await Portfolio.find(query)
      .populate("categoryId", "name")
      .skip((pageNo - 1) * pageCount)
      .limit(pageCount);

    const totalCount = await Portfolio.countDocuments(query);
    sendResponse(res, 200, "Success", {
      message: "List fetched",
      data: portfolios,
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

// UPDATE
portfolioController.put("/update", upload.single("image"), async (req, res) => {
    try {
      const id = req.body.id;
      const portfolio = await Portfolio.findById(id);
      if (!portfolio) {
        return sendResponse(res, 404, "Failed", {
          message: "Portfolio not found",
          statusCode: 404
        });
      }
      let updatedData = { ...req.body };
      if (req.file) {
        // Delete the old image from Cloudinary if it exists
        if (portfolio.image) {
          const publicId = portfolio.image.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(publicId, (error, result) => {
            if (error) {
              console.error("Error deleting old image from Cloudinary:", error);
            } else {
              console.log("Old image deleted from Cloudinary:", result);
            }
          });
        }
        // Upload the new image to Cloudinary
        const image = await cloudinary.uploader.upload(req.file.path);
        updatedData.image = image.url;
      }
      const updatedPortfolio = await Portfolio.findByIdAndUpdate(id, updatedData, {
        new: true // Return the updated document
      });
      sendResponse(res, 200, "Success", {
        message: "Portfolio updated successfully!",
        data: updatedPortfolio,
        statusCode: 200
      });
    } catch (error) {
      sendResponse(res, 500, "Failed", {
        message: error.message || "Internal server error",
        statusCode: 500
      });
    }
  });
  

// DELETE
portfolioController.delete("/delete/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const portfolio = await Portfolio.findById(id);
      if (!portfolio) {
        return sendResponse(res, 404, "Failed", {
          message: "Portfolio not found",
          statusCode: 404
        });
      }
      const imageUrl = portfolio.image;
      if (imageUrl) {
        const publicId = imageUrl.split("/").pop().split(".")[0]; // Extract public ID from URL
        // Delete the image from Cloudinary
        await cloudinary.uploader.destroy(publicId, (error, result) => {
          if (error) {
            console.error("Error deleting image from Cloudinary:", error);
          } else {
            console.log("Cloudinary image deletion result:", result);
          }
        });
      }
      await Portfolio.findByIdAndDelete(id);
      sendResponse(res, 200, "Success", {
        message: "Portfolio and associated image deleted successfully!",
        statusCode: 200
      });
    } catch (error) {
      console.error(error);
      sendResponse(res, 500, "Failed", {
        message: error.message || "Internal server error",
        statusCode: 500
      });
    }
  });
  

// Get single portfolio details by id
portfolioController.get("/details/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const portfolio = await Portfolio.findById(id).populate(
      "categoryId",
      "name status image description"
    ); // populate info as needed

    if (!portfolio) {
      return sendResponse(res, 404, "Failed", {
        message: "Portfolio not found",
        statusCode: 404,
      });
    }

    sendResponse(res, 200, "Success", {
      message: "Portfolio details retrieved successfully!",
      data: portfolio,
      statusCode: 200,
    });
  } catch (error) {
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
      statusCode: 500,
    });
  }
});

module.exports = portfolioController;
