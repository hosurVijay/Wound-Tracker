import {
  createUser,
  findUserByEmail,
  findUserById,
  updateProfileImage,
  updateUser,
  deleteUser,
  updatePassword,
  createPasswordReset,
  findLatestPasswordResetOtp,
  markOTPused,
} from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler";
import {
  generateAccessToken,
  hashPassword,
  isPassowrdCorrect,
  generateRefreshToken,
} from "../service/user.services.js";
import { sendMailOtp } from "../utils/sendOtpMail.js";
import { generateOTP } from "../utils/generateOTP.js";
import jwt from "jsonwebtoken";
import { getAge } from "../utils/ageCalulator.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { secureHeapUsed } from "crypto";

const generateAccessRefreshToken = async (userId) => {
  try {
    const refreshToken = await generateRefreshToken(userId);
    const accessToken = await generateAccessToken(userId);
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Could't process the request of Generating the refresh and access Token",
    );
  }
};
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phoneNumber, dob } = req.body;
  if (
    [name, email, password, phoneNumber, dob].some(
      (field) => field.trim() == "",
    )
  ) {
    throw new ApiError(400, "Name and email both required");
  }
  const existUser = await findUserByEmail(email);
  if (existUser.length > 0) {
    throw new ApiError(409, "User already exist");
  }
  const hashedPassword = await hashPassword(password);
  const result = await createUser(
    name,
    email,
    hashedPassword,
    phoneNumber,
    dob,
  );
  const userId = result.insertId;
  const { refreshToken, accessToken } =
    await generateAccessRefreshToken(userId);
  const createdUser = await findUserById(userId);
  if (createdUser.length === 0) {
    throw new ApiError(400, "User creation failed!");
  }
  const user = createdUser[0];
  const userPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    date_of_birth: user.date_of_birth,
    profileImage: user.profileImage,
  };
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE == "true",
    sameSite: "LAX",
    maxAge: process.env.ACCESS_COOKIE_MAX_AGE,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE == "true",
    sameSite: "LAX",
    maxAge: process.env.REFRESH_COOKIE_MAX_AGE,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, "User created sucessfully", userPayload));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "Email and password required");
  }
  const userExist = await findUserByEmail(email);
  if (userExist.length === 0) {
    throw new ApiError(404, "invalid email or password");
  }
  const comparePass = await isPassowrdCorrect(
    password,
    userExist[0].password_hashed,
  );
  if (!comparePass) {
    throw new ApiError(401, "invalid email or password");
  }
  const { accessToken, refreshToken } = await generateAccessRefreshToken(
    userExist[0].id,
  );

  const loggedUser = await findUserById(userExist[0].id);
  if (loggedUser.length === 0) {
    throw new ApiError(500, "Couldn't login the user");
  }
  const userPayload = {
    id: loggedUser[0].id,
    name: loggedUser[0].name,
    email: loggedUser[0].email,
  };

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE == "true",
    sameSite: "LAX",
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE == "true",
    sameSite: "LAX",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Login Successfull", userPayload));
});

const updateUserPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "All fields are required");
  }
  const userId = req.user?.id;
  const user = await findUserById(userId);
  if (user.length === 0) {
    throw new ApiError(404, "NO user found");
  }

  const isOldPassCorrect = await isPassowrdCorrect(
    oldPassword,
    user[0].password_hashed,
  );
  if (!isOldPassCorrect) {
    throw new ApiError(400, "check your password");
  }

  const hashNewPassword = await hashPassword(newPassword);
  const result = await updatePassword(userId, hashNewPassword);

  if (result.affectedRows === 0) {
    throw new ApiError(500, "Failed to update password");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Password update successful"));
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Field is required");
  const user = await findUserByEmail(email);
  if (user.length === 0) {
    throw new ApiError(404, "User not found");
  }
  const otp = generateOTP();
  const otpHash = await hashPassword(otp.toString());
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await createPasswordReset(user[0].id, otpHash, expiresAt);
  const sendToMail = await sendMailOtp(user[0].email, otp);
  if (!sendToMail) {
    throw new ApiError(500, "Failed to send the otp");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "otp sent successfully", null));
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { otp, email } = req.body;
  if (!otp) throw new ApiError(400, "Field is required");

  const user = await findUserByEmail(email);
  if (user.length === 0) {
    throw new ApiError(404, "no user found");
  }
  const otpUserRecord = await findLatestPasswordResetOtp(user[0].id);

  if (otpUserRecord.length === 0) {
    throw new ApiError(400, "NO valid otp found");
  }

  const isOtpValid = await isPassowrdCorrect(
    otp.toString(),
    otpUserRecord[0].otp_hash,
  );
  const isExpired = new Date() > new Date(otpUserRecord[0].expiresAt);

  if (!isOtpValid) {
    await u;
    throw new ApiError(400, "INVALID OTP or OTP EXPIRED");
  }

  if (!isOtpValid || isExpired) {
    throw new ApiError(400, "INVALID OTP or OTP EXPIRED");
  }

  const resetToken = jwt.sign(
    {
      id: user[0].id,
      purpose: "password_reset",
    },
    process.env.RESET_TOKEN_SECRET,
    {
      expiresIn: process.env.RESET_TOKEN_EXPIRY,
    },
  );

  await markOTPused(otpUserRecord[0].id);
  return res
    .status(200)
    .json(new ApiResponse(200, "OTP verified", { resetToken }));
});

const resetPassword = asyncHandler(async (req, res) => {
  const { resetToken, newPassword } = req.body;
  if (!resetToken || !newPassword)
    throw new ApiError(400, "All field is required");
  const decodeToken = jwt.verify(resetToken, process.env.RESET_TOKEN_SECRET);
  if (decodeToken.purpose != "password_reset") {
    throw new ApiError(401, "Invalid reset token");
  }

  const hashedPassword = await hashPassword(newPassword);
  const setNewPassword = await updatePassword(hashedPassword, decodeToken.id);

  if (!setNewPassword) {
    throw new ApiError(500, "Failed to update new password");
  }

  return res.status(200).json(new ApiResponse(200, "Password updated", null));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const user = await findUserById(userId);
  if (user.length === 0) {
    throw new ApiError(404, "no user found");
  }
  const userInfo = user[0];
  const userPayload = {
    id: userInfo.id,
    name: userInfo.name,
    email: userInfo.email,
    phoneNumber: userInfo.phoneNumber,
    profileImage: userInfo.profileImage,
    age: getAge(userInfo.date_of_birth),
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, "User details fetched successfully", userPayload),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE == "true",
    sameSite: "LAX",
  });

  res.clearCookie("refrehToken", {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE == "true",
    sameSite: "LAX",
  });

  return res.status(200).json(new ApiError(200, "Logged out", null));
});

const updateUserDetails = asyncHandler(async (req, res) => {
  const { name, phoneNumber, dob } = req.body;
  const userId = req.user?.id;
  const user = await findUserById(userId);
  if (user.length === 0) {
    throw new ApiError(404, "No user found");
  }
  const updateWithNewDetailsOfUser = await updateUser(
    user[0].id,
    name,
    phoneNumber,
    dob,
  );
  if (updateWithNewDetailsOfUser.length === 0) {
    throw new ApiError(500, "Update failed");
  }

  if (req.file?.cloudinaryUrl) {
    await updateProfileImage(req.file?.cloudinaryUrl, user[0].email);
  }

  const userWithUpadtedDetails = await findUserById(userId);
  if (userWithUpadtedDetails.length === 0) {
    throw new ApiError(404, "No user found");
  }
  const userDetails = userWithUpadtedDetails[0];
  const userPayload = {
    id: userDetails.id,
    name: userDetails.name,
    email: userDetails.email,
    phoneNumber: userDetails.phoneNumber,
    profileImage: userDetails.profileImage,
    age: getAge(userDetails.date_of_birth),
  };

  return res
    .status(200)
    .json(new ApiResponse(200, "updated user", userPayload));
});

const deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const user = await findUserById(userId);
  if (user.length === 0) {
    throw new ApiError(404, "No user found");
  }
  const result = await deleteUser(userId);

  if (result.affectedRows === 0) {
    throw new ApiError(500, " Failed to delete the account");
  }

  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "LAX",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "LAX",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Account deleted successfully", null));
});
export {
  registerUser,
  loginUser,
  updateUserPassword,
  verifyOtp,
  resetPassword,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  updateUserDetails,
  deleteAccount,
};
