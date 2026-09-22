import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const generateAccessToken = async function (id) {
  console.log("access token: ", process.env.ACCESS_TOKEN_SECRET);
  return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
};

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const isPassowrdCorrect = async function (password, hashPassword) {
  return await bcrypt.compare(password, hashPassword);
};

const generateRefreshToken = async function (id) {
  console.log("refresh token: ", process.env.REFRESH_TOKEN_SECRET);
  return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};

export {
  isPassowrdCorrect,
  hashPassword,
  generateAccessToken,
  generateRefreshToken,
};
