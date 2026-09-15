import { findUserById } from "../models/user.model.js";
import { generateAccessToken } from "../service/user.services.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"



const verifyUser = asyncHandler(async(req, res, next) => {
    const token = 
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "Unauthorized Access");
    }

    const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if(!decodeToken) {
        throw new ApiError(500, "Token falied")
    }

    const user = await findUserById(decodeToken?.id)

    if (user.length === 0) {
        throw new ApiError(401, "Invalid Token")
    }

    const userPayload = {
        id : user[0].id,
        email: user[0].email,
    }
    req.user = userPayload;
    next();
})

const refreshToken = asyncHandler(async(req, res) => {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
        throw new ApiError(401, "Token required")
    }

    const decodeToken = jwt.verify(
        refreshToken, process.env.REFRESH_TOKEN_SECRET
    );

    const user = await findUserById(decodeToken.id)
    if(user.length ===0) {
        throw new ApiError(404, "NO user found");
    }


    const newAccessToken = await generateAccessToken(decodeToken.id);

    res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE == "true",
        sameSite : "LAX"
    })

    return res.
        status(200)
        .json(new ApiResponse(200, "Token refreshed", null))
}) 

export {verifyUser, refreshToken}