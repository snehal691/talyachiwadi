import jwt from "jsonwebtoken";
import { Admin } from "../models/admin.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {

  const tokenFromCookie = req.cookies?.accessToken; //get token by cookie
  const tokenFromHeader = req.header("Authorization")?.replace("Bearer ", ""); //if token is in header
  const token = tokenFromCookie || tokenFromHeader; 

  if (!token) {
    throw new ApiError(401, "Unauthorized: Access token missing");
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch {
    throw new ApiError(401, "Unauthorized: Invalid or expired access token");
  }

  const admin = await Admin.findById(decoded?._id).select("-password -refreshToken");
  
  if (!admin) {
    throw new ApiError(401, "Unauthorized: Admin not found");
  }

  req.admin = admin;
  next();
});
