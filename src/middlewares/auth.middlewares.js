import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asynHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";


export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "").trim()

        if (!token) {
            throw new ApiError(400, "Unauthorized request");
        }
        let decodeedToken;
        try {
            decodeedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        } catch (error) {
            throw new ApiError(400, "Token is Not Exist");
        }
        const user = await User.findById(decodeedToken?._id).select("-password -refreshToken");
        if (!user) {
            throw new ApiError(400, "Invalid Access Token, Please singnin again")
        }
        req.user = user;
        next();
        
    } catch (error) {
        throw new ApiError(400, error?.message || "Invalid Access Token");
    }

})