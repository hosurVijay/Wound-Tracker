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
import { use } from "react";


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
            secure : process.env.COOKIE_SECURE =="true",
            sameSite : "LAX",
            maxAge: process.env.ACCESS_COOKIE_MAX_AGE
        })
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure :process.env.COOKIE_SECURE == "true",
            sameSite: "LAX",
            maxAge: process.env.REFRESH_COOKIE_MAX_AGE
        })
        return res
            .status(201)
            .json(new ApiResponse(201, "User created sucessfully", userPayload))
})

const loginUser = asyncHandler(async(req, res) => {
    const {email, password} = req.body
    if (!email || !password) {
        throw new ApiError(400, "Email and password required")
    }
    const userExist = await findUserByEmail(email);
    if (userExist.length ===  0) {
        throw new ApiError(404, "invalid email or password")
    }
    const comparePass = await isPassowrdCorrect(password, userExist[0].password_hashed);
    if (!comparePass) {
        throw new ApiError(401, "invalid email or password");
    }
    const {accessToken, refreshToken} = await generateAccessRefreshToken(userExist[0].id)

    const loggedUser = await findUserById(userExist[0].id)
    if (loggedUser.length === 0) {
        throw new ApiError(500, "Couldn't login the user")
    }
    const userPayload = {
        id : loggedUser[0].id,
        name : loggedUser[0].name,
        email : loggedUser[0].email,
    };

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure : process.env.COOKIE_SECURE == "true",
        sameSite: "LAX"
    })
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure : process.env.COOKIE_SECURE == "true",
        sameSite: "LAX",
    })
    
    return res
        .status(200)
        .json(new ApiResponse(200, "Login Successfull", userPayload))
})

const updatePassword = asyncHandler(async (req, res) => {
    const {oldPassword, newPassword} = req.body;
    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "All fields are required")
    }
    const userId = req.user?.id;
    const user = await findUserById(userId);
    if (user.length === 0) {
        throw new ApiError(404, "NO user found")
    }

    const isOldPassCorrect = await isPassowrdCorrect(oldPassword, user[0].password_hashed)
    if (!isOldPassCorrect) {
        throw new ApiError(400, "check your password")
    }

    const hashNewPassword = await hashPassword(newPassword)
    const result = await updatePassword(userId, hashNewPassword)

    if (result.affectedRows === 0) {
        throw new ApiError(500, "Failed to update password");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, "Password update successful",))
})





export {registerUser}