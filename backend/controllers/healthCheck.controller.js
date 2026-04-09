import { checkConnectionStatus } from "../db/dbConnect.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const healthCheck = asyncHandler(async (req, res) => {
    let connectionStatus = checkConnectionStatus();

    console.log({connectionStatus});

    if(connectionStatus !== "running"){
        throw new ApiError(500, "DB connection error");
    }

    return res.json(new ApiResponse(200, "ok", "Healthy"));
})