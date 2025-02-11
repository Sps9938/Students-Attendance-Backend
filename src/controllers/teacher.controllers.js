import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResjponse.js";
import { asyncHandler } from "../utils/asynHandler.js";

const register = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "message From controller!!"
        )
    )

})

export {
    register
};