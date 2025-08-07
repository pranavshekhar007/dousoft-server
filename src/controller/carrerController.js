// controller/career.controller.js
const express = require("express");
const Career = require("../model/carrer.Schema");
const { sendResponse } = require("../utils/common");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const careerController = express.Router();

// Setup multer storage for CV uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "./uploads/cvs/";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // unique name prefix timestamp + original filename
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: function (req, file, cb) {
    // Accept PDF, DOC, DOCX only
    const filetypes = /pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, and DOCX files are allowed!"));
    }
  },
});

// CREATE Career Job
careerController.post("/create", async (req, res) => {
  try {
    const career = await Career.create(req.body);
    sendResponse(res, 200, "Success", {
      message: "Career job created successfully!",
      data: career,
      statusCode: 200,
    });
  } catch (error) {
    sendResponse(res, 500, "Failed", { message: error.message, statusCode: 500 });
  }
});

// READ - list all / filtered
careerController.post("/list", async (req, res) => {
  try {
    const {
      searchKey = "",
      categoryId,
      status,
      pageNo = 1,
      pageCount = 10,
    } = req.body;
    const query = {};
    if (searchKey) query.title = { $regex: searchKey, $options: "i" };
    if (categoryId) query.categoryId = categoryId;
    if (typeof status !== "undefined" && status !== "") query.status = status === "true" || status === true;

    const careers = await Career.find(query)
      .populate("categoryId", "name")
      .skip((pageNo - 1) * pageCount)
      .limit(pageCount);

    const totalCount = await Career.countDocuments(query);

    sendResponse(res, 200, "Success", {
      message: "Career list fetched successfully!",
      data: careers,
      totalCount,
      statusCode: 200,
    });
  } catch (error) {
    sendResponse(res, 500, "Failed", { message: error.message, statusCode: 500 });
  }
});

// READ - single career details
careerController.get("/details/:id", async (req, res) => {
  try {
    const career = await Career.findById(req.params.id).populate("categoryId", "name");
    if (!career) {
      return sendResponse(res, 404, "Failed", { message: "Career job not found", statusCode: 404 });
    }
    sendResponse(res, 200, "Success", {
      message: "Career details retrieved successfully!",
      data: career,
      statusCode: 200,
    });
  } catch (error) {
    sendResponse(res, 500, "Failed", { message: error.message, statusCode: 500 });
  }
});

// UPDATE Career job
careerController.put("/update/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const career = await Career.findById(id);
    if (!career) {
      return sendResponse(res, 404, "Failed", { message: "Career job not found", statusCode: 404 });
    }
    const updated = await Career.findByIdAndUpdate(id, req.body, { new: true });
    sendResponse(res, 200, "Success", {
      message: "Career job updated successfully!",
      data: updated,
      statusCode: 200,
    });
  } catch (error) {
    sendResponse(res, 500, "Failed", { message: error.message, statusCode: 500 });
  }
});

// DELETE Career job
careerController.delete("/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const career = await Career.findById(id);
    if (!career) {
      return sendResponse(res, 404, "Failed", { message: "Career job not found", statusCode: 404 });
    }
    await Career.findByIdAndDelete(id);
    sendResponse(res, 200, "Success", {
      message: "Career job deleted successfully!",
      statusCode: 200,
    });
  } catch (error) {
    sendResponse(res, 500, "Failed", { message: error.message, statusCode: 500 });
  }
});

// UPLOAD Candidate CV for a Job
careerController.post("/upload-cv/:careerId", upload.single("cv"), async (req, res) => {
  try {
    if (!req.file) {
      return sendResponse(res, 400, "Failed", { message: "No CV file uploaded", statusCode: 400 });
    }
    // You can store the CV file info in a separate collection or just respond success here
    // For example, save information about the applicant if needed or just return the file URL

    sendResponse(res, 200, "Success", {
      message: "CV uploaded successfully!",
      data: {
        filename: req.file.filename,
        path: req.file.path,
        originalname: req.file.originalname,
      },
      statusCode: 200,
    });
  } catch (error) {
    sendResponse(res, 500, "Failed", { message: error.message, statusCode: 500 });
  }
});

module.exports = careerController;
