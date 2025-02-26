import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Users } from "../models/users-model.js";
import { handleError } from "../utils/helpers.js";
import HttpError from "../models/http-error.js";
import { RefreshToken } from "../models/refresh-token-model.js";
import { sendEmail } from "../utils/email.js";
import dotenv from "dotenv";
import { Orders } from "../models/orders-model.js";
import { Addresses } from "../models/addresses-model.js";

dotenv.config();

const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user.id, email: user.email },
    "supersecret_dont_share",
    { expiresIn: "15m" } // Shorter expiry for access token
  );
};

const generateRefreshToken = async (user) => {
  const refreshToken = jwt.sign(
    { userId: user.id, email: user.email },
    "supersecret_refresh", // Separate secret key for refresh token
    { expiresIn: "30d" } // Longer expiry for refresh token
  );

  // Save refresh token in the database
  const newRefreshToken = new RefreshToken({
    token: refreshToken,
    userId: user.id,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  });
  await newRefreshToken.save();

  return refreshToken;
};

const getUsers = async (req, res, next) => {
  try {
    const users = await Users.find({}, "-password");
    res
      .status(200)
      .json({ users: users.map((user) => user.toObject({ getters: true })) });
  } catch (err) {
    handleError(err, next, "Fetching users failed");
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await Users.findById(req.params.uid).select("-password");
    if (!user) return handleError(null, next, "User not found", 404);
    res.status(200).json({ user: user.toObject({ getters: true }) });
  } catch (err) {
    handleError(err, next, "Could not retrieve the User data!");
  }
};

const signup = async (req, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check the data", 422)
    );
  }

  const { name, email, password, gender, mobileNumber, orders } = req.body;

  try {
    const existingUser = await Users.findOne({ email });
    if (existingUser)
      return next(
        new HttpError("User already exists, please login instead", 409)
      );

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new Users({
      name,
      email,
      password: hashedPassword,
      gender,
      mobileNumber,
      orders,
    });
    await newUser.save();

    const token = generateAccessToken(newUser);
    const refreshToken = await generateRefreshToken(newUser);

    res
      .status(201)
      .json({ userId: newUser.id, email: newUser.email, token, refreshToken });
  } catch (err) {
    handleError(err, next, "Signing up failed");
  }
};

const signin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await Users.findOne({ email });

    if (!user) return next(new HttpError("Invalid credentials"));

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return next(new HttpError("Invalid credentials"));

    const token = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    res
      .status(200)
      .json({ userId: user.id, email: user.email, token, refreshToken });
  } catch (err) {
    console.log("err=>", err);
    handleError(err, next, "Sign in failed");
  }
};

const refreshAccessToken = async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new HttpError("Refresh token is required", 400));
  }

  try {
    const existingToken = await RefreshToken.findOne({ token: refreshToken });

    if (!existingToken) {
      return next(new HttpError("Invalid refresh token", 403));
    }

    const decodedToken = jwt.verify(refreshToken, "supersecret_refresh");
    const user = await Users.findById(decodedToken.userId);

    if (!user) {
      return next(new HttpError("User not found", 404));
    }

    const newAccessToken = generateAccessToken(user);

    res.status(200).json({ token: newAccessToken });
  } catch (err) {
    console.log("refreshTokenError-->", err);
    return next(new HttpError("Could not refresh token", 403));
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await Users.findById(req.params.uid);
    if (!user) return handleError(null, next, "User not found", 404);

    Object.assign(user, req.body);
    await user.save();
    res.status(200).json({ user: user.toObject({ getters: true }) });
  } catch (err) {
    handleError(err, next, "Update Profile failed");
  }
};

const logout = async (req, res, next) => {
  const { refreshToken } = req.body;

  try {
    await RefreshToken.findOneAndDelete({ token: refreshToken });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    handleError(err, next, "Logout failed");
  }
};

const deleteUser = async (req, res, next) => {
  const userId = req.params.uid;

  try {
    const user = await Users.findById(userId);

    if (!user) {
      return next(new HttpError("User not found", 404));
    }

    await Orders.deleteMany({ userId });

    await Addresses.deleteMany({ userId });

    await user.deleteOne();

    res.status(200).json({
      message: "User, associated orders, and addresses deleted successfully",
    });
  } catch (err) {
    handleError(err, next, "Deleting user failed");
  }
};

const forgortPassword = async (req, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check the data", 422)
    );
  }

  const { email } = req.body;

  try {
    const user = await Users.findOne({ email });

    if (!user) {
      return next(new HttpError("No user found with this email", 404));
    }

    const resetToken = jwt.sign(
      { userId: user.id, email: user.email },
      "supersecret_reset_password", // Secret key for reset token
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    // const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const resetLink = `${process.env.FRONTEND_URL}?token=${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: "Password Reset",
      text: `Please use the following link to reset your password: ${resetLink}`,
    });

    res.status(200).json({ resetToken, message: "Password reset link sent!" });
  } catch (err) {
    console.log("fogotError=-->", err);
    next(new HttpError("Could not initiate password reset", 500));
  }
};

const resetPassword = async (req, res, next) => {
  const { token, newPassword } = req.body;
  console.log("newPassword--", newPassword);

  try {
    if (!token || !newPassword) {
      return next(new HttpError("Invalid request", 400));
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, "supersecret_reset_password");
    } catch (err) {
      return next(new HttpError("Invalid or expired reset token", 403));
    }

    const user = await Users.findById(decodedToken.userId);

    if (!user) {
      return next(new HttpError("User not found", 404));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successful!" });
  } catch (err) {
    next(new HttpError("Could not reset password", 500));
  }
};

export {
  getUsers,
  getUserById,
  signup,
  signin,
  updateProfile,
  refreshAccessToken,
  deleteUser,
  logout,
  forgortPassword,
  resetPassword,
};
