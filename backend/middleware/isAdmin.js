import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";



export const isAdmin = asyncHandler(async (req, res, next) => {
    //cookie mdhe ahe jwt
    const admin = req.admin
    const role = admin?.role

    const allowedRoles = ["admin", "developer"]

    if(!role){
        throw new ApiError(401, "Unauthorized: Access token missing");
    }
    if(!allowedRoles.includes(role)){
        throw new ApiError(401, "Unauthorized: You are not an admin");
    }
    
    next();

})