require("dotenv").config();
const express = require("express");
const { sendResponse, generateOTP } = require("../utils/common");
const mongoose = require("mongoose");
const Product = require("../model/product.Schema");
const ComboProduct = require("../model/comboProduct.Schema");
const Category = require("../model/category.Schema");
const Banner = require("../model/banner.Schema");
const SubCategory = require("../model/subCategory.Schema");
const User = require("../model/user.Schema");
const Booking = require("../model/booking.Schema");
const userController = express.Router();
const axios = require("axios");
const jwt = require("jsonwebtoken");
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const auth = require("../utils/auth");
const moment = require("moment");
const bcrypt = require("bcryptjs");
const Appointment = require("../model/appointment.Schema");
const DoctorReview = require("../model/doctorReview.Schema");
const Blog = require("../model/blog.Schema");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// userController.post("/send-otp", async (req, res) => {
//   try {
//     const { phone, ...otherDetails } = req.body;
//     // Check if the phone number is provided
//     if (!phone) {
//       return sendResponse(res, 400, "Failed", {
//         message: "Phone number is required.",
//         statusCode: 400,
//       });
//     }
//     // Generate OTP
//     const phoneOtp = generateOTP();

//     // Check if the user exists
//     let user = await User.findOne({ phone });

//     if (!user) {
//       // Create a new user with the provided details and OTP
//       user = await User.create({
//         phone,
//         phoneOtp,
//         ...otherDetails,
//       });

//       // Generate JWT token for the new user
//       const token = jwt.sign(
//         { userId: user._id, phone: user.phone },
//         process.env.JWT_KEY
//       );
//       // Store the token in the user object or return it in the response
//       user.token = token;
//       user = await User.findByIdAndUpdate(user.id, { token }, { new: true });
//     } else {
//       // Update the existing user's OTP
//       user = await User.findByIdAndUpdate(user.id, { phoneOtp }, { new: true });
//     }
//     const appHash = "ems/3nG2V1H"; // Apne app ka actual hash yahan dalein

//     // Properly formatted OTP message for autofill
//     const otpMessage = `<#> ${phoneOtp} is your OTP for verification. Do not share it with anyone.\n${appHash}`;

//     let optResponse = await axios.post(
//       `https://api.authkey.io/request?authkey=${
//         process.env.AUTHKEY_API_KEY
//       }&mobile=${phone}&country_code=91&sid=${
//         process.env.AUTHKEY_SENDER_ID
//       }&company=Acediva&otp=${phoneOtp}&message=${encodeURIComponent(
//         otpMessage
//       )}`
//     );

//     if (optResponse?.status == "200") {
//       return sendResponse(res, 200, "Success", {
//         message: "OTP send successfully",
//         data: user,
//         statusCode: 200,
//       });
//     } else {
//       return sendResponse(res, 422, "Failed", {
//         message: "Unable to send OTP",
//         statusCode: 200,
//       });
//     }
//   } catch (error) {
//     console.error("Error in /send-otp:", error.message);
//     // Respond with failure
//     return sendResponse(res, 500, "Failed", {
//       message: error.message || "Internal server error.",
//     });
//   }
// });

// userController.post("/sign-up", upload.fields([{ name: "profilePic", maxCount: 1 }]),
//   async (req, res) => {
//     try {
//       // Check if the phone number is unique
//       const user = await User.findOne({ phone: req.body.phone });
//       if (user) {
//         return sendResponse(res, 400, "Failed", {
//           message: "User is already registered.",
//           statusCode: 400,
//         });
//       }

//       // Generate OTP
//       const otp = generateOTP();

//       // Upload images to Cloudinary
//       let profilePic;

//       if (req.files["profilePic"]) {
//         let image = await cloudinary.uploader.upload(
//           req.files["profilePic"][0].path
//         );
//         profilePic = image.url;
//       }

//       // Create a new user with provided details
//       let newUser = await User.create({
//         ...req.body,
//         phoneOtp: otp,
//         profilePic,
//       });

//       // Generate JWT token
//       const token = jwt.sign(
//         { userId: newUser._id, phone: newUser.phone },
//         process.env.JWT_KEY
//       );

//       // Store the token in the user object or return it in the response
//       newUser.token = token;
//       const updatedUser = await User.findByIdAndUpdate(
//         newUser._id,
//         { token },
//         { new: true }
//       );

//       // OTP message for autofill
//       const appHash = "ems/3nG2V1H"; // Replace with your actual hash
//       const otpMessage = `<#> ${otp} is your OTP for verification. Do not share it with anyone.\n${appHash}`;

//       let otpResponse = await axios.post(
//         `https://api.authkey.io/request?authkey=${
//           process.env.AUTHKEY_API_KEY
//         }&mobile=${req.body.phone}&country_code=91&sid=${
//           process.env.AUTHKEY_SENDER_ID
//         }&company=Acediva&otp=${otp}&message=${encodeURIComponent(otpMessage)}`
//       );

//       if (otpResponse?.status == "200") {
//         return sendResponse(res, 200, "Success", {
//           message: "OTP sent successfully",
//           data: updatedUser,
//           statusCode: 200,
//         });
//       } else {
//         return sendResponse(res, 422, "Failed", {
//           message: "Unable to send OTP",
//           statusCode: 200,
//         });
//       }
//     } catch (error) {
//       console.error("Error in /sign-up:", error.message);
//       return sendResponse(res, 500, "Failed", {
//         message: error.message || "Internal server error.",
//       });
//     }
//   }
// );

// userController.post("/otp-verification", async (req, res) => {
//   try {
//     const { phone, phoneOtp, firstName } = req.body;
//     const user = await User.findOne({ phone, phoneOtp });
//     if (user) {
//       const updatedUser = await User.findByIdAndUpdate(
//         user._id,
//         { isPhoneVerified: true, ...(firstName && { firstName }) },
//         { new: true }
//       );
//       return sendResponse(res, 200, "Success", {
//         message: "Otp verified successfully",
//         data: updatedUser,
//         statusCode: 200,
//       });
//     } else {
//       return sendResponse(res, 422, "Failed", {
//         message: "Wrong OTP",
//         statusCode: 422,
//       });
//     }
//   } catch (error) {
//     return sendResponse(res, 500, "Failed", {
//       message: error.message || "Internal server error.",
//       statusCode: 500,
//     });
//   }
// });

// userController.post("/login", async (req, res) => {
//   try {
//     const { phone, password } = req.body;
//     const user = await User.findOne({ phone, password });
//     if (user) {
//       return sendResponse(res, 200, "Success", {
//         message: "User logged in successfully",
//         data: user,
//         statusCode: 200,
//       });
//     } else {
//       return sendResponse(res, 422, "Failed", {
//         message: "Invalid Credentials",
//         statusCode: 422,
//       });
//     }
//   } catch (error) {
//     return sendResponse(res, 500, "Failed", {
//       message: error.message || "Internal server error.",
//       statusCode: 500,
//     });
//   }
// });

// userController.post("/resend-otp", async (req, res) => {
//   try {
//     const { phone } = req.body;
//     const user = await User.findOne({ phone });
//     if (user) {
//       const otp = generateOTP();
//       const updatedUser = await User.findByIdAndUpdate(
//         user._id,
//         { phoneOtp: otp },
//         { new: true }
//       );

//       // OTP message for autofill
//       const appHash = "ems/3nG2V1H"; // Replace with your actual hash
//       const otpMessage = `<#> ${otp} is your OTP for verification. Do not share it with anyone.\n${appHash}`;

//       let otpResponse = await axios.post(
//         `https://api.authkey.io/request?authkey=${
//           process.env.AUTHKEY_API_KEY
//         }&mobile=${req.body.phone}&country_code=91&sid=${
//           process.env.AUTHKEY_SENDER_ID
//         }&company=Acediva&otp=${otp}&message=${encodeURIComponent(otpMessage)}`
//       );

//       if (otpResponse?.status == "200") {
//         return sendResponse(res, 200, "Success", {
//           message: "OTP sent successfully",
//           data: updatedUser,
//           statusCode: 200,
//         });
//       } else {
//         return sendResponse(res, 422, "Failed", {
//           message: "Unable to send OTP",
//           statusCode: 200,
//         });
//       }
//     } else {
//       return sendResponse(res, 422, "Failed", {
//         message: "Phone number is not registered",
//         statusCode: 422,
//       });
//     }
//   } catch (error) {
//     return sendResponse(res, 500, "Failed", {
//       message: error.message || "Internal server error.",
//       statusCode: 500,
//     });
//   }
// });

userController.post("/sign-up", async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return sendResponse(res, 400, "Failed", {
        message: "All required fields must be filled.",
      });
    }

    if (password !== confirmPassword) {
      return sendResponse(res, 400, "Failed", {
        message: "Passwords do not match.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendResponse(res, 400, "Failed", {
        message: "Email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      // profileStatus: "completed",
    });

    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_KEY
    );

    const updatedUser = await User.findByIdAndUpdate(
      newUser._id,
      { token },
      { new: true }
    );

    sendResponse(res, 200, "Success", {
      message: "User registered successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

userController.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendResponse(res, 400, "Failed", {
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return sendResponse(res, 401, "Failed", {
        message: "Invalid credentials.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendResponse(res, 401, "Failed", {
        message: "Invalid credentials.",
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_KEY
    );

    await User.findByIdAndUpdate(user._id, { token });

    sendResponse(res, 200, "Success", {
      message: "Login successful",
      data: { ...user._doc, token },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

userController.get("/details/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findOne({ _id: id });
    if (user) {
      return sendResponse(res, 200, "Success", {
        message: "User details fetched  successfully",
        data: user,
        statusCode: 200,
      });
    } else {
      return sendResponse(res, 404, "Failed", {
        message: "User not found",
        statusCode: 404,
      });
    }
  } catch (error) {
    return sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error.",
      statusCode: 500,
    });
  }
});

userController.put("/update", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return sendResponse(res, 401, "Failed", { message: "Token missing" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_KEY);
    } catch (err) {
      return sendResponse(res, 401, "Failed", { message: "Invalid token" });
    }

    const userId = decoded.userId;

    const userData = await User.findById(userId);
    if (!userData) {
      return sendResponse(res, 404, "Failed", {
        message: "User not found",
      });
    }

    let updatedData = { ...req.body };

    // Remove restricted/sensitive fields from update
    // delete updatedData.password;
    // delete updatedData.email;
    // delete updatedData.token;
    // delete updatedData.profilePic;

    // Set profileStatus to completed
    updatedData.profileStatus = "completed";

    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    });

    req.io?.emit("userUpdated", {
      message: "User profile updated",
      userId: updatedUser._id,
      updatedData: updatedUser,
    });

    sendResponse(res, 200, "Success", {
      message: "User updated successfully!",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update error:", error.message);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

userController.post("/list", async (req, res) => {
  try {
    const {
      searchKey = "",
      status,
      pageNo = 1,
      pageCount = 10,
      sortByField,
      sortByOrder,
    } = req.body;

    const query = {};
    if (status) query.status = status;
    if (searchKey) query.name = { $regex: searchKey, $options: "i" };

    // Construct sorting object
    const sortField = sortByField || "createdAt";
    const sortOrder = sortByOrder === "asc" ? 1 : -1;
    const sortOption = { [sortField]: sortOrder };

    // Fetch the user list
    const userList = await User.find(query)
      .sort(sortOption)
      .limit(parseInt(pageCount))
      .skip(parseInt(pageNo - 1) * parseInt(pageCount));
    // .populate({
    //   path: "product",
    //   select: "name description",
    // })
    // .populate({
    //   path: "createdBy",
    //   select: "name",
    // });
    const totalCount = await User.countDocuments({});
    const activeCount = await User.countDocuments({ status: true });
    sendResponse(res, 200, "Success", {
      message: "User list retrieved successfully!",
      data: userList,
      documentCount: {
        totalCount,
        activeCount,
        inactiveCount: totalCount - activeCount,
      },
      statusCode: 200,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

userController.put("/change-password", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return sendResponse(res, 401, "Failed", { message: "Token missing" });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_KEY);
    } catch (err) {
      return sendResponse(res, 401, "Failed", { message: "Invalid token" });
    }

    const userId = decoded.userId;
    const user = await User.findById(userId);
    if (!user) {
      return sendResponse(res, 404, "Failed", { message: "User not found" });
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmPassword) {
      return sendResponse(res, 400, "Failed", {
        message: "All password fields are required.",
      });
    }

    // Compare old password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return sendResponse(res, 400, "Failed", {
        message: "Current password is incorrect.",
      });
    }

    // Check new and confirm password
    if (newPassword !== confirmPassword) {
      return sendResponse(res, 400, "Failed", {
        message: "New passwords do not match.",
      });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    sendResponse(res, 200, "Success", {
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Change password error:", error.message);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

// POST /user/forgot-password
userController.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return sendResponse(res, 400, "Failed", {
        message: "Email is required.",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return sendResponse(res, 404, "Failed", { message: "User not found." });
    }

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = Date.now() + 60 * 60 * 1000;

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();

    // Send email logic (use nodemailer or similar)
    console.log(process.env.FRONTEND_URL);
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    await sendEmail(
      user.email,
      "Reset Password",
      `<p>Click <a href="${resetLink}">here</a> to reset your password.<br>
       Or copy and paste this link into your browser:<br>
       ${resetLink}
       <br><br>
       If you did not request a password reset, please ignore this email.
       </p>`
    );

    sendResponse(res, 200, "Success", {
      message: "Reset password link sent to your email address.",
    });
  } catch (error) {
    sendResponse(res, 500, "Failed", { message: error.message });
  }
});

// POST /user/reset-password
userController.post("/reset-password", async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;
    if (!token || !password || !confirmPassword) {
      return sendResponse(res, 400, "Failed", {
        message: "All fields are required.",
      });
    }
    if (password !== confirmPassword) {
      return sendResponse(res, 400, "Failed", {
        message: "Passwords do not match.",
      });
    }

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Not expired
    });

    if (!user) {
      return sendResponse(res, 400, "Failed", {
        message: "Password reset link is invalid or has expired.",
      });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = "";
    user.resetPasswordExpires = null;
    await user.save();

    sendResponse(res, 200, "Success", {
      message: "Password reset successfully. You can now log in.",
    });
  } catch (error) {
    sendResponse(res, 500, "Failed", { message: error.message });
  }
});

// Helper function to fetch item by type
async function getItemByIdAndType(itemId, itemType) {
  if (!mongoose.Types.ObjectId.isValid(itemId)) return null;
  if (itemType === "Product") return Product.findById(itemId);
  if (itemType === "ComboProduct") return ComboProduct.findById(itemId);
  return null;
}

// Add to Cart
userController.post("/add-to-cart/:id", async (req, res) => {
  try {
    const { id: itemId } = req.params;
    const { userId: currentUserId, itemType } = req.body;

    if (!itemId || !currentUserId || !itemType) {
      return sendResponse(res, 422, "Failed", {
        message: "Missing itemId, userId, or itemType!",
      });
    }

    const item = await getItemByIdAndType(itemId, itemType);
    if (!item) {
      return sendResponse(res, 400, "Failed", {
        message: `${itemType} not found!`,
      });
    }

    const user = await User.findById(currentUserId);
    if (!user) {
      return sendResponse(res, 400, "Failed", { message: "User not found!" });
    }

    if (!Array.isArray(user.cartItems)) user.cartItems = [];

    const cartItemIndex = user.cartItems.findIndex(
      (i) =>
        i.itemId && i.itemId.toString() === itemId && i.itemType === itemType
    );

    let updateQuery, message;

    if (cartItemIndex !== -1) {
      const currentQuantity = user.cartItems[cartItemIndex].quantity;
      if (currentQuantity + 1 > item.stockQuantity) {
        return sendResponse(res, 400, "Failed", {
          message: `Only ${
            item.stockQuantity - currentQuantity
          } item(s) left in stock for this ${itemType}.`,
        });
      }

      updateQuery = {
        $set: {
          [`cartItems.${cartItemIndex}.quantity`]: currentQuantity + 1,
        },
      };
      message = "Item quantity incremented successfully";
    } else {
      if (item.stockQuantity < 1) {
        return sendResponse(res, 400, "Failed", {
          message: `This ${itemType} is currently out of stock.`,
        });
      }

      updateQuery = {
        $push: { cartItems: { itemId, itemType, quantity: 1 } },
      };
      message = `${itemType} added successfully to cart`;
    }

    const updatedUser = await User.findByIdAndUpdate(
      currentUserId,
      updateQuery,
      { new: true }
    );
    sendResponse(res, 200, "Success", {
      message,
      data: updatedUser.cartItems,
      statusCode: 200,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

// Remove from Cart
userController.post("/remove-from-cart/:id", async (req, res) => {
  try {
    const { id: itemId } = req.params;
    const { userId: currentUserId, itemType } = req.body;

    if (!itemId || !currentUserId || !itemType) {
      return sendResponse(res, 422, "Failed", {
        message: "Missing itemId, userId, or itemType!",
      });
    }

    const user = await User.findById(currentUserId);
    if (!user) {
      return sendResponse(res, 400, "Failed", { message: "User not found!" });
    }

    const cartItem = user.cartItems.find(
      (i) =>
        i.itemId && i.itemId.toString() === itemId && i.itemType === itemType
    );

    if (!cartItem) {
      return sendResponse(res, 400, "Failed", { message: "Item not in cart!" });
    }

    let updateQuery, message;

    if (cartItem.quantity > 1) {
      updateQuery = {
        $set: { "cartItems.$[elem].quantity": cartItem.quantity - 1 },
      };
      message = "Item quantity decreased";

      await User.findByIdAndUpdate(currentUserId, updateQuery, {
        new: true,
        arrayFilters: [{ "elem.itemId": itemId, "elem.itemType": itemType }],
      });
    } else {
      updateQuery = {
        $pull: { cartItems: { itemId, itemType } },
      };
      message = "Item removed from cart";

      await User.findByIdAndUpdate(currentUserId, updateQuery, { new: true });
    }

    sendResponse(res, 200, "Success", { message, statusCode: 200 });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

// Remove from Cart (Remove entire item directly)
userController.post("/remove-item-from-cart/:id", async (req, res) => {
  try {
    const { id: itemId } = req.params;
    const { userId: currentUserId, itemType } = req.body;

    if (!itemId || !currentUserId || !itemType) {
      return sendResponse(res, 422, "Failed", {
        message: "Missing itemId, userId, or itemType!",
      });
    }

    const user = await User.findById(currentUserId);
    if (!user) {
      return sendResponse(res, 400, "Failed", { message: "User not found!" });
    }

    const cartItem = user.cartItems.find(
      (i) =>
        i.itemId && i.itemId.toString() === itemId && i.itemType === itemType
    );

    if (!cartItem) {
      return sendResponse(res, 400, "Failed", { message: "Item not in cart!" });
    }

    // Directly remove the entire item from cart
    const updatedUser = await User.findByIdAndUpdate(
      currentUserId,
      {
        $pull: { cartItems: { itemId, itemType } },
      },
      { new: true }
    );

    sendResponse(res, 200, "Success", {
      message: "Item removed completely from cart",
      data: updatedUser.cartItems,
      statusCode: 200,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

// Get Cart Items
userController.get("/cart/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return sendResponse(res, 422, "Failed", {
        message: "User ID is required!",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return sendResponse(res, 400, "Failed", { message: "User not found!" });
    }

    let actualTotalAmount = 0;
    let discountedTotalAmount = 0;

    const cartDetails = await Promise.all(
      user.cartItems.map(async (item) => {
        const product = await getItemByIdAndType(item.itemId, item.itemType);
        if (!product) return null;

        const quantity = item.quantity || 1;
        let price = 0;
        let discounted_price = 0;

        if (item.itemType === "Product") {
          price = product.price || 0;
          discounted_price = product.discountedPrice || price;
        } else if (item.itemType === "ComboProduct") {
          price = product.pricing?.actualPrice || 0;
          discounted_price = product.pricing?.comboPrice || price;
        }

        const actualPrice = price * quantity;
        const discountedPrice = discounted_price * quantity;

        actualTotalAmount += actualPrice;
        discountedTotalAmount += discountedPrice;

        return {
          _id: product._id,
          name: product.name,
          itemType: item.itemType,
          productHeroImage: product.productHeroImage || null,
          price,
          discountedPrice: discounted_price,
          quantity,
          totalItemPrice: actualPrice,
          totalItemDiscountedPrice: discountedPrice,
        };
      })
    );

    sendResponse(res, 200, "Success", {
      message: "Cart items retrieved successfully",
      cartItems: cartDetails.filter(Boolean),
      actualTotalAmount,
      discountedTotalAmount,
      statusCode: 200,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

userController.post("/add-to-wishlist/:id", async (req, res) => {
  try {
    if (!req.params.id) {
      return sendResponse(res, 422, "Failed", {
        message: "Params not found!",
      });
    }

    const productId = req.params.id;
    const currentUserId = req.body.userId;

    const product = await Product.findOne({ _id: productId });
    if (!product) {
      return sendResponse(res, 400, "Failed", {
        message: "Product not found!",
      });
    }
    const user = await User.findOne({ _id: currentUserId });
    if (!user) {
      return sendResponse(res, 400, "Failed", {
        message: "User not found!",
      });
    }

    let message, updateQuery;
    if (user.wishListItems.includes(productId)) {
      updateQuery = { $pull: { wishListItems: productId } };
      message = "Item removed successfully";
    } else {
      updateQuery = { $push: { wishListItems: productId } };
      message = "Item added successfully";
    }

    // Update the post document with the new array
    await User.findOneAndUpdate({ _id: currentUserId }, updateQuery);

    sendResponse(res, 200, "Success", {
      message: message,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

userController.get("/wishlist/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return sendResponse(res, 422, "Failed", {
        message: "User ID is required!",
      });
    }

    const user = await User.findById(userId).populate("wishListItems");

    if (!user) {
      return sendResponse(res, 400, "Failed", {
        message: "User not found!",
      });
    }

    sendResponse(res, 200, "Success", {
      message: "Wishlist items retrieved successfully",
      data: user.wishListItems, // Returns the list of products in the wishlist
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

// userController.put("/update", upload.single("profilePic"), async (req, res) => {
//   try {
//     const id = req.body.userId;
//     const userData = await User.findOne({ _id: id });
//     if (!userData) {
//       return sendResponse(res, 404, "Failed", {
//         message: "User not found",
//       });
//     }

//     let updatedData = { ...req.body };

//     if (req.file) {
//       const profilePic = await cloudinary.uploader.upload(req.file.path);
//       updatedData.profilePic = profilePic.url;
//     }
//     updatedData.profileStatus = "completed";
//     const updatedUser = await User.findByIdAndUpdate(id, updatedData, {
//       new: true,
//     });

//     req.io.emit("userUpdated", {
//       message: "User profile updated",
//       userId: updatedUser._id,
//       updatedData: updatedUser,
//     });

//     sendResponse(res, 200, "Success", {
//       message: "User updated successfully!",
//       data: updatedUser,
//       statusCode: 200,
//     });
//   } catch (error) {
//     console.error(error);
//     sendResponse(res, 500, "Failed", {
//       message: error.message || "Internal server error",
//     });
//   }
// });

userController.post("/home-details", async (req, res) => {
  try {
    const homeCategory = await Category.find({});
    const banner = await Banner.find({});
    const trendingProducts = await Product.find({});
    const bestSellerProducts = await Product.find({});
    sendResponse(res, 200, "Success", {
      message: "Home page data fetched successfully!",
      data: {
        homeCategory,
        banner,
        trendingProducts,
        bestSellerProducts,
      },
      statusCode: 200,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

userController.post("/remove-all-from-cart/:id", auth, async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { userId: currentUserId } = req.body;

    if (!productId || !currentUserId) {
      return sendResponse(res, 422, "Failed", {
        message: "Missing productId or userId!",
      });
    }

    const user = await User.findById(currentUserId);
    if (!user) {
      return sendResponse(res, 400, "Failed", { message: "User not found!" });
    }

    const cartItem = user.cartItems.find(
      (item) => item.productId.toString() === productId
    );

    if (!cartItem) {
      return sendResponse(res, 400, "Failed", { message: "Item not in cart!" });
    }

    // ✅ Remove the product entirely from the cart (regardless of quantity)
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { cartItems: { productId } },
    });

    return sendResponse(res, 200, "Success", {
      message: "Product removed from cart",
    });
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

userController.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return sendResponse(res, 404, "Failed", {
        message: "User not found",
        statusCode: 400,
      });
    }
    await User.findByIdAndDelete(id);
    sendResponse(res, 200, "Success", {
      message: "User deleted successfully!",
      statusCode: 200,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});
userController.get("/dashboard-details", async (req, res) => {
  try {
    // 1. --- APPOINTMENT STATS ---
    const startOfDay = moment().startOf("day").toDate();
    const endOfDay = moment().endOf("day").toDate();

    const [todayAppointments, confirmedAppointments, pendingAppointments] =
      await Promise.all([
        Appointment.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } }),
        Appointment.countDocuments({ status: "confirmed" }),
        Appointment.countDocuments({ status: "pending" }),
      ]);

    // --- REVIEWS STATS ---
    const [totalReviews, newReviews, unreadReviews] = await Promise.all([
      DoctorReview.countDocuments({}),
      DoctorReview.countDocuments({ reply: "" }),
      DoctorReview.countDocuments({ status: true, reply: "" }),
    ]);

    // --- BLOG VIEWS STATS ---
    let totalBlogViews = 0;
    const blogViewsAgg = await Blog.aggregate([
      { $group: { _id: null, views: { $sum: "$views" } } },
    ]);
    totalBlogViews = blogViewsAgg.length ? blogViewsAgg[0].views : 0;

    // Last 15 days appointments
    const last15DaysAgg = await Appointment.aggregate([
      {
        $match: {
          createdAt: {
            $gte: moment().subtract(15, "days").startOf("day").toDate(),
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          noOfAppointments: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    let last15DaysAppointments = [];
    for (let i = 14; i >= 0; i--) {
      let dateObj = moment().subtract(i, "days");
      let formattedDate = dateObj.format("Do MMM");
      let mongoDate = dateObj.format("YYYY-MM-DD");
      let agg = last15DaysAgg.find((a) => a._id === mongoDate);
      last15DaysAppointments.push({
        date: formattedDate,
        noOfAppointments: agg ? agg.noOfAppointments : 0,
        mongoDate,
      });
    }

    sendResponse(res, 200, "Success", {
      message: "Dashboard details retrieved successfully",
      data: {
        appointments: {
          today: todayAppointments,
          confirmed: confirmedAppointments,
          pending: pendingAppointments,
          last15Days: last15DaysAppointments,
        },
        reviews: {
          total: totalReviews,
          new: newReviews,
          unread: unreadReviews,
        },
        blogs: {
          totalViews: totalBlogViews,
        },
      },
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
module.exports = userController;
