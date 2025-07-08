import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

const pingController = asyncHandler(async(req, res) => {
    return res.status(200)
    .json(new ApiResponse(
        200,
        "Server Is Healthy"  
    ))
})

export {
    pingController
}