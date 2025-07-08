import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const pingController = asyncHandler(async(req, res) => {
    return res.status(200)
    .json(new ApiResponse(
        200,
        {message: "Everything is O.K"},
        "OK"
    ))
})

export {
    pingController
}