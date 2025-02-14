import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynHandler.js";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken
        await user.save({ vallidateBeforeSave: false})

        return { accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
}
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
    //get username or email and password
    //check username or email exist or not
    //if username or email exist ,then verify password is correct or not
    //then after password verified successfully ->generate accesstoken and refreshtoken
    //remove in res field the  password and refreshtoken
    //return res 

    const { email, username, password } = req.body;

    if(!(username || email))
    {
        throw new ApiError(400, "Username or email is required");
    }
    const user = await User.findOne({
        $or: [{username}, {email}]
    })
    if(!user)
    {
        throw new ApiError(400, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid)
    {
        throw new ApiError(400, "Invalid user Password");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(
        200,
        {
            user: loggedInUser,accessToken,refreshToken
        },
        "User Logged in Successfully"
    ))
})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(
        200,
        "User Logged Out"
    ))

})

const getCurrentUser = asyncHandler(async(req, res) => {
    const user = await User.findById(req.user?._id).select("-password")
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        user,
        "Current User Fethced Successfully"
    ))
    })

const updateUserDetails = asyncHandler(async(req, res) => {

})

const changeCurrentPassword = asyncHandler(async(req, res) => {

})
const forgetUserPassword = asyncHandler(async(req, res ) => {

})




export {
    register,
    loginUser,
    logoutUser,
    getCurrentUser
};