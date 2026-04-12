import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"


export const isAdmin = asyncHandler(async (req, res, next) => {
    //cookie mdhe ahe jwt
    const admin = req?.admin
    let newAdmin;

    if (!admin) {
        const accessToken = req?.cookies?.accessToken

        try {
            newAdmin = await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)

        } catch (error) {
            throw new ApiError(401, "Unauthorized: Access token missing");
        }
    }
    const role = admin?.role || newAdmin?.role

    const allowedRoles = ["admin", "developer"]

    if (!role) {
        throw new ApiError(401, "Unauthorized: Access token missing");
    }

    if (!allowedRoles.includes(role)) {
        throw new ApiError(401, "Unauthorized: You are not an admin");
    }

    next();

})