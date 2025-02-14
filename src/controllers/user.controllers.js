import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynHandler.js";

const register = asyncHandler(async (req, res) => {
    //get email,username,password
    //check all fields are not empty
    //chek user alread exist or not
    //create user object - create entry in db
    //remove password and refresh token field from response
    //return res


    const { fullname, username, email, password, role } = req.body;

    if (
        [fullname, username, email, password, role].some((field) => (field ?? "").trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(400, "User with email or username already exists");
    }

    const user = await User.create({
        fullname,
        username: username.toLowerCase(),
        email,
        password,
        role
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(400, "Something went wrong while registering the user")
    }


    return res
    .status(200)
    .json(new ApiResponse(
        200,
        createdUser,
        "User registered Successfully"
    ))

})

const loginUser = asyncHandler(async(req, res) => {

})

const logoutUeer = asyncHandler(async(req, res) => {

})

const changeUserDetails = asyncHandler(async(req, res) => {

})

const changePassword = asyncHandler(async(req, res) => {

})
const fogetUserPassword = asyncHandler(async(req, res ) => {

})

const deleteUserDetails = asyncHandler(async(req, res) => {

})


export {
    register
};