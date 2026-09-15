import { findUserById } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
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