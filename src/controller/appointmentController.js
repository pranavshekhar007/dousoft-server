const express = require("express");
const Appointment = require("../model/appointment.Schema");
const { sendResponse } = require("../utils/common");
const appointmentController = express.Router();
require("dotenv").config();

// Create Appointment
appointmentController.post("/create", async (req, res) => {
  try {
    const appointmentData = { ...req.body };
    const newAppointment = await Appointment.create(appointmentData);

    sendResponse(res, 200, "Success", {
      message: "Appointment created successfully!",
      data: newAppointment,
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

// List Appointments with pagination, search, status filter
appointmentController.post("/list", async (req, res) => {
  try {
    const {
      searchKey = "",
      status,
      pageNo = 1,
      pageCount = 10,
    } = req.body;

    const query = {};
    if (status) query.status = status;
    if (searchKey) {
      query.$or = [
        { firstName: { $regex: searchKey, $options: "i" } },
        { lastName: { $regex: searchKey, $options: "i" } },
        { email: { $regex: searchKey, $options: "i" } },
        { phone: { $regex: searchKey, $options: "i" } },
      ];
    }

    const appointmentList = await Appointment.find(query)
    .populate("userId", "name")
      .sort({ createdAt: -1 })
      .skip((pageNo - 1) * pageCount)
      .limit(pageCount);

    const totalCount = await Appointment.countDocuments({});
    const confirmedCount = await Appointment.countDocuments({ status: "confirmed" });
    const rejectedCount = await Appointment.countDocuments({ status: "rejected" });
    const pendingCount = totalCount - confirmedCount - rejectedCount;

    sendResponse(res, 200, "Success", {
      message: "Appointment list retrieved successfully!",
      data: appointmentList,
      documentCount: {
        totalCount,
        confirmedCount,
        rejectedCount,
        pendingCount,
      },
      statusCode: 200,
    });
  } catch (error) {
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
      statusCode: 500,
    });
  }
});

// Update Appointment
appointmentController.put("/update", async (req, res) => {
  try {
    const { id, ...updateFields } = req.body;

    const existing = await Appointment.findById(id);
    if (!existing) {
      return sendResponse(res, 404, "Failed", {
        message: "Appointment not found",
        statusCode: 404,
      });
    }

    const updated = await Appointment.findByIdAndUpdate(id, updateFields, { new: true });

    sendResponse(res, 200, "Success", {
      message: "Appointment updated successfully!",
      data: updated,
      statusCode: 200,
    });
  } catch (error) {
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
      statusCode: 500,
    });
  }
});

// Delete Appointment
appointmentController.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const found = await Appointment.findById(id);
    if (!found) {
      return sendResponse(res, 404, "Failed", {
        message: "Appointment not found",
        statusCode: 404,
      });
    }

    await Appointment.findByIdAndDelete(id);

    sendResponse(res, 200, "Success", {
      message: "Appointment deleted successfully!",
      statusCode: 200,
    });
  } catch (error) {
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
      statusCode: 500,
    });
  }
});

// Get Appointment Details
appointmentController.get("/details/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Appointment.findById(id)
    .populate("userId", "name");
    if (!data) {
      return sendResponse(res, 404, "Failed", {
        message: "Appointment not found",
      });
    }

    sendResponse(res, 200, "Success", {
      message: "Appointment fetched successfully!",
      data,
      statusCode: 200,
    });
  } catch (error) {
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
      statusCode: 500,
    });
  }
});

appointmentController.get("/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
  
      const appointments = await Appointment.find({ userId })
        .populate("userId", "name email");
  
      if (!appointments.length) {
        return sendResponse(res, 404, "Failed", {
          message: "No appointments found for this user",
        });
      }
  
      sendResponse(res, 200, "Success", {
        message: "User's appointments fetched successfully!",
        data: appointments,
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

module.exports = appointmentController;
