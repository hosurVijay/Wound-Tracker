import {
    createUser,
    findUserByEmail,
    findUserById,
    updateProfileImage,
    updateUser,
    deleteUser
} from "../models/user.model.js";
import {ApiResponse} from "../utils/apiResponse.js"
import {ApiError} from "../utils/apiError.js"
import { asyncHandler } from "../utils/asyncHandler";
import {
    generateAccessToken, hashPassword, isPassowrdCorrect, generateRefreshToken
} from "../service/user.services.js"


const generateAccessRefreshToken = async (userId) => {
    try {
        const refreshToken = await generateRefreshToken(userId);
        const accessToken = await generateAccessToken(userId);
        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(
            500,
            "Could't process the request of Generating the refresh and access Token"
        )
    }   
}
const registerUser = asyncHandler(async (req, res) => {
        const {name, email, password, phoneNumber, dob} = req.body;
        if ([name, email, password, phoneNumber, dob].some((field) => field.trim() == "")) {
            throw new ApiError(400, "Name and email both required");
        }
        const existUser = await findUserByEmail(email)
        if (existUser.length > 0) {
            throw new ApiError(409, "User already exist")
        }
        const hashedPassword = await hashPassword(password);
        const result = await createUser(
            name, email,  hashedPassword, phoneNumber, dob
        );
        const userId = result.insertId;
        const {refreshToken, accessToken} = await generateAccessRefreshToken(userId);
        const createdUser = await findUserById(userId);
        if (createdUser.length === 0) {
            throw new ApiError(400, "User creation failed!")
        }
        const user = createdUser[0];
        const userPayload = {
            id: user.id,
            name : user.name,
            email : user.email,
            phoneNumber : user.phoneNumber,
            date_of_birth : user.date_of_birth,
            profileImage: user.profileImage
        }
        res.cookie("accessToken", accessToken, {
            httpOnly :true,
            secure : true,
            sameSite : "LAX",
            maxAge: process.env.ACCESS_COOKIE_MAX_AGE
        })
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure :true,
            sameSite: "LAX",
            maxAge: process.env.REFRESH_COOKIE_MAX_AGE
        })
        return res
            .status(201)
            .json(new ApiResponse(201, "User created sucessfully", userPayload))
})