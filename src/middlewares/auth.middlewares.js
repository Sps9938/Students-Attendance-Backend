import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";

        //TOD)->if(accessToken is not exist) here(check refresh token expired or not)
        //1, if refresh token expired just return (unauthorized request)
        //2. if refresh token not expired then ->
        //create a new access token   
export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        let tokenAccess = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "").trim();

        
        let decodedToken;
        try {
            decodedToken = jwt.verify(tokenAccess, process.env.ACCESS_TOKEN_SECRET);

        } catch (error) {
            // throw new ApiError(400, "Access Token is Not Exist");
            console.error("Acces Token not Exist try with Refresh token.....");
            
        }
        
        if (!decodedToken) {
            // console.log("welcome refresh token");
            
            const tokenRefresh = req.cookies?.refreshToken || req.header("Authorization")?.replace("Bearer", "").trim();
            // console.log("Refresh token: ", tokenRefresh);
            
            if(!tokenRefresh){
                throw new ApiError(400, "Unauthorized request, Both access token and refresh token not exist");
            }

            //verify refresh token is expiried or not
            let decodeedRefresh
            try {
                decodeedRefresh = jwt.verify(tokenRefresh,  process.env.REFRESH_TOKEN_SECRET);

            } catch (error) {
                throw new ApiError(400, "Refresh Token is not Exist");
            }

            const user = await User.findById(decodeedRefresh._id);
            if(!user){
                throw new ApiError(400, "User Not Found With Refresh Token");
            }
            const options = {
                httpOnly: true,
                secure: true,
            
            }

            tokenAccess = user.generateAccessToken();

            res.cookie("accessToken", tokenAccess, options);

            await user.save( {validateBeforeSave: false} );
        }

        //no need to change next logic it will remain same->verify access token
       
        decodedToken = jwt.verify(tokenAccess, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        if (!user) {
            throw new ApiError(400, "Invalid Access Token, Please singnin again")
        }
        req.user = user;
        next();
        
    } catch (error) {
        throw new ApiError(400, error?.message || "Invalid Access Token");
    }

})

/*
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
    
*/