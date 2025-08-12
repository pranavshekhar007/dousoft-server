const express = require("express");
const { sendResponse } = require("../utils/common");
require("dotenv").config();
const Category = require("../model/blogCategory.Schema");
require("dotenv").config();
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const SubCategory = require("../model/subCategory.Schema");
const Product = require("../model/product.Schema")
const { sendNotification } = require("../utils/sendNotification");

const blogCategoryController = express.Router();

blogCategoryController.post("/create", upload.single("image"), async (req, res) => {
  try {
    let obj = { ...req.body };

    if (req.file) {
      const image = await cloudinary.uploader.upload(req.file.path);
      obj.image = image.url;
    }

    const CategoryCreated = await Category.create(obj);

    sendResponse(res, 200, "Success", {
      message: "Blog Category created successfully!",
      data: CategoryCreated,
      statusCode: 200,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
      statusCode: 500,
    });
  }
});

blogCategoryController.post("/list", async (req, res) => {
  try {
    const {
      searchKey = "",
      status,
      pageNo = 1,
      pageCount = 30,
      sortByField,
      sortByOrder
    } = req.body;
    const query = {};
    if (status) query.status = status;
    if (searchKey) query.name = { $regex: searchKey, $options: "i" };
    const sortField = sortByField || "createdAt";
    const sortOrder = sortByOrder === "asc" ? 1 : -1;
    const sortOption = { [sortField]: sortOrder };
    const categoryList = await Category.find(query)
      .sort(sortOption)
      .limit(parseInt(pageCount))
      .skip(parseInt(pageNo - 1) * parseInt(pageCount));
    const totalCount = await Category.countDocuments({});
    const activeCount = await Category.countDocuments({ status: true });
    sendResponse(res, 200, "Success", {
      message: "Blog Category list retrieved successfully!",
      data: categoryList,
      documentCount: { totalCount, activeCount, inactiveCount: totalCount - activeCount },
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

blogCategoryController.put("/update", upload.single("image"), async (req, res) => {
  try {
    const id = req.body._id;
    const category = await Category.findById(id);
    if (!category) {
      return sendResponse(res, 404, "Failed", {
        message: "Blog Category not found",
        statusCode: 403
      });
    }
    let updatedData = { ...req.body };
    if (req.file) {
      // Delete the old image from Cloudinary
      if (category.image) {
        const publicId = category.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId, (error, result) => {
          if (error) {
            console.error("Error deleting old image from Cloudinary:", error);
          } else {
            console.log("Old image deleted from Cloudinary:", result);
          }
        });
      }
      const image = await cloudinary.uploader.upload(req.file.path);
      updatedData.image = image.url;
    }
    const updatedCategory = await Category.findByIdAndUpdate(id, updatedData, {
      new: true, // Return the updated document
    });
    sendResponse(res, 200, "Success", {
      message: "Blog Category updated successfully!",
      data: updatedCategory,
      statusCode: 200
    });
  } catch (error) {
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
      statusCode: 500
    });
  }
});

blogCategoryController.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return sendResponse(res, 404, "Failed", {
        message: "Blog Category not found",
      });
    }

    // Delete image from Cloudinary if exists
    if (category.image) {
      try {
        // More reliable publicId extraction (handles folders)
        const parts = category.image.split("/");
        const fileName = parts.pop();
        const folderPath = parts.slice(parts.indexOf("upload") + 1).join("/");
        const publicId = folderPath
          ? `${folderPath}/${fileName.split(".")[0]}`
          : fileName.split(".")[0];

        const result = await cloudinary.uploader.destroy(publicId);
        console.log("Cloudinary delete result:", result);
      } catch (cloudErr) {
        console.error("Cloudinary image deletion error:", cloudErr.message);
        // Not throwing — still delete category in DB
      }
    }

    // Delete category from DB
    await Category.findByIdAndDelete(id);

    sendResponse(res, 200, "Success", {
      message: "Blog Category and associated image deleted successfully!",
      statusCode: 200, // Number, not string
    });

  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});



blogCategoryController.get("/details/:id", async (req, res) => {
  try {
    const { id } = req.params
    const CategoryDetails = await Category.findOne({ _id: id });
    const SubCategoryList = await SubCategory.find({ categoryId: id });
    sendResponse(res, 200, "Success", {
      message: "Blog Category with sub category retrived successfully!",
      data: { CategoryDetails, SubCategoryList },
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


module.exports = blogCategoryController;