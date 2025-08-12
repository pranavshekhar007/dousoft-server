const express = require("express");
const Appointment = require("../model/appointment.Schema");
const { sendResponse } = require("../utils/common");
const sendEmail = require("../utils/sendEmail");
const appointmentController = express.Router();
require("dotenv").config();

// Create Appointment
appointmentController.post("/create", async (req, res) => {
  try {
    const appointmentData = { ...req.body };
    const newAppointment = await Appointment.create(appointmentData);

    sendResponse(res, 200, "Success", {
      message:
        "Appointment created successfully! Please wait for confirmation via email.",
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
    const { searchKey = "", status, pageNo = 1, pageCount = 10 } = req.body;

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
      .sort({ createdAt: -1 })
      .skip((pageNo - 1) * pageCount)
      .limit(pageCount);

    const totalCount = await Appointment.countDocuments({});
    const confirmedCount = await Appointment.countDocuments({
      status: "confirmed",
    });
    const rejectedCount = await Appointment.countDocuments({
      status: "rejected",
    });
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
    const { id, status, ...updateFields } = req.body;

    if (!id) {
      return sendResponse(res, 400, "Failed", {
        message: "Appointment ID is required",
        statusCode: 400,
      });
    }

    const existing = await Appointment.findById(id);
    if (!existing) {
      return sendResponse(res, 404, "Failed", {
        message: "Appointment not found",
        statusCode: 404,
      });
    }

    const wasStatus = existing.status;
    const willStatus = status ?? updateFields.status;

    const updated = await Appointment.findByIdAndUpdate(
      id,
      { ...updateFields, ...(status && { status }) },
      { new: true }
    );

    // console.log({
    //   wasStatus,
    //   willStatus,
    //   updatedStatus: updated?.status,
    //   email: updated?.email,
    // });

    if (willStatus === "confirmed" && wasStatus !== "confirmed") {
      if (!updated?.email) {
        console.warn("No email on appointment, skipping email send");
      } else {
        try {
          const emailHtml = `
            <div style="font-family: Arial, sans-serif;">
              <h2>Your appointment is confirmed</h2>
              <p>Dear ${updated.name || "Customer"},</p>
              <p>Your appointment has been confirmed.</p>
              <ul>
                <li>Date: ${updated.date || "-"}</li>
                <li>Time: ${updated.time || "-"}</li>
                <li>Subject: ${updated.subject || "-"}</li>
              </ul>
              <p>We look forward to seeing you.</p>
            </div>
          `;
          console.log("Attempting to send email to", updated.email);
          await sendEmail(updated.email, "Appointment Confirmed", emailHtml);
          console.log("Email sent successfully");
        } catch (mailErr) {
          console.error("Email send failed:", mailErr?.message, mailErr);
        }
      }
    }

    return sendResponse(res, 200, "Success", {
      message: "Appointment updated successfully!",
      data: updated,
      statusCode: 200,
    });
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "Failed", {
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
    const data = await Appointment.findById(id);
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

// appointmentController.get("/user/:userId", async (req, res) => {
//     try {
//       const { userId } = req.params;

//       const appointments = await Appointment.find({ userId })
//         .populate("userId", "name email");

//       if (!appointments.length) {
//         return sendResponse(res, 404, "Failed", {
//           message: "No appointments found for this user",
//         });
//       }

//       sendResponse(res, 200, "Success", {
//         message: "User's appointments fetched successfully!",
//         data: appointments,
//         statusCode: 200,
//       });
//     } catch (error) {
//       console.error(error);
//       sendResponse(res, 500, "Failed", {
//         message: error.message || "Internal server error",
//         statusCode: 500,
//       });
//     }
//   });

module.exports = appointmentController;
