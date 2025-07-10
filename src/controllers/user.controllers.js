import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Otp } from "../models/Otp.model.js";

import nodemailer from "nodemailer";
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken
        await user.save({ vallidateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
}

const sendOtp = asyncHandler(async(req, res) => {

const {email} = req.body;
const teacher = await User.findOne({email});



//generate otp
const otp = Math.floor(100000 + Math.random() * 900000).toString();

const create = await Otp.create({
    email,
    otp,
    createdAt: new Date(),

})
if(!create){
    throw ApiError(400,"Otp model Not created")
}

const transPorter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is: ${otp}`
}

transPorter.sendMail(mailOptions, (err) => {
    if(err){
        throw ApiError(500, "Failed to send OTP")
    }
    return res.status(200)
    .json(new ApiResponse(
        200,
        "OTP sent Sucessfully"
    ))
})

})


const verifyOtp = asyncHandler(async(req, res) => {
    const { email, otp } = req.body;
    // console.log(`email is: ${email} and otp is: ${otp}`);
    
    const otpRecord = await Otp.findOne({email});
    if(!otpRecord){
        throw new ApiError(400, "OTP expired or not found");

    }
    // console.log(`otpRecord is: ${otpRecord.otp} and otp is: ${otp}`);
    // console.log(otpRecord.otp);
    
    if(otpRecord.otp != otp){
        throw new ApiError(400, "Invalid OTP");
    }

  
    // const teacher = await User.findOne({email});
    // teacher.isVerified = true;
    // await teacher.save();

    await Otp.deleteOne({email});

    return res.status(200)
    .json(new ApiResponse(
        200, 
        "Email Verified Sucessfully"
    ))
})

const register = asyncHandler(async (req, res) => {
    //get email,username,password
    //check all fields are not empty
    //chek user alread exist or not
    //create user object - create entry in db
    //remove password and refresh token field from response
    //return res


    const { fullname, username, email, password,renewPassword, role } = req.body;
  
    
    if (
        [fullname, username, email, password, renewPassword,  role].some((field) => (field ?? "").trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(400, "User with email or username already exists");
    }

    if(password != renewPassword){
        throw new ApiError(400, "Passwords Not Match, Please check")
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

const loginUser = asyncHandler(async (req, res) => {
    //get username or email and password
    //check username or email exist or not
    //if username or email exist ,then verify password is correct or not
    //then after password verified successfully ->generate accesstoken and refreshtoken
    //remove in res field the  password and refreshtoken
    //return res 

    const { email, username, password } = req.body;

    if (!(username || email)) {
        throw new ApiError(400, "Username or email is required");
    }
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(403, "Invalid user Password");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User Logged in Successfully"
        ))
})

const logoutUser = asyncHandler(async (req, res) => {
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
        secure: true,
        sameSite: "None",
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

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id).select("-password")
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            user,
            "Current User Fethced Successfully"
        ))
})

const updateUserDetails = asyncHandler(async (req, res) => {
    //get fullname
    //check non empty condition
    //change full name
    const { fullname, email } = req.body;
    if (!fullname || !email) {
        throw new ApiError(400, "fullname and email both are required");
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                email
            }
        },
        { new: true }

    ).select("-password")
    if (!user) {
        throw new ApiError(500, "user details not Updated ,please try again")
    }


    const userDetails = await User.findById(req.user?._id);
    if(!userDetails){
        throw new ApiError(400, "userDetais Not Fetched");
        
    }

    userDetails.isVerified = false;
    await userDetails.save();

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            {},
            "User Details Updated Successfully"
        ))
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    //get oldPassword,newPassword and renewPasssword
    //check oldPasword match or not
    //check same or not
    //change the password
    const { oldPassword, newPassword, renewPassword } = req.body;
    const user = await User.findById(req.user?._id);
    if (!user) {
        throw new ApiError(400, "User Not Found");
    }
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old Password");
    }
    if (!oldPassword || !newPassword || !renewPassword) {
        throw new ApiError(400, "All fields are requrired")
    }
    // console.log(newPassword);
    // console.log(renewPassword);
    if (newPassword !== renewPassword) {
        throw new ApiError(400, "newPassword is not match with renewPassword");
    }
  
   
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            {},
            "Password changed Successfully"
        ))

})

const forgetUserPassword = asyncHandler(async (req, res) => {
    const { username, email, newPassword, renewPassword } = req.body;
    if (!(username || email)) {
        throw new ApiError(400, "username or email required");
    }
    // const user = await User.findById(req.user?._id);
    const user = await User.findOne({
        $or: [
            {email: email || null},
            {username: username || null}
        ]
    })

    if (!((user.username === username) || (user.email === email))) {
        throw new ApiError(400, "User Not Found, Enter correct username or email")
    }
    if (newPassword !== renewPassword) {
        throw new ApiError(400, "newPassword not match with renewPassworc")
    }
    user.password = newPassword;
    user.save({ vallidateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            {},
            "User changed Password Successfully with the help of forgetPassord"
        ))
})

const emailExistChecker = asyncHandler(async(req, res) =>{
    const {email} = req.body;
    if(!email){
        throw new ApiError(400,"Email is Required");
    }

    const userData = await User.find({email});
    // console.log("userData is: ", userData);
    
    if(!userData.length){
        throw new ApiError(400, "Email Not Registered");
    }

    return res.status(200)
    .json(new ApiResponse(
        200,
        "Email Fetched Successfully"
    ))

})
export {
    register,
    loginUser,
    logoutUser,
    getCurrentUser,
    updateUserDetails,
    changeCurrentPassword,
    forgetUserPassword,
    sendOtp,
    verifyOtp,
    emailExistChecker,
};