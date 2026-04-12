import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Setting } from "../models/settings.model.js";

export const getSettings = asyncHandler(async (req, res) => {
  // TODO: fetch current settings; create defaults if none exist
  return res.json(new ApiResponse(200, null, "Settings fetch endpoint not implemented yet"));
});

export const updateSettings = asyncHandler(async (req, res) => {
  // TODO: validate update body and apply changes to settings
  return res.json(new ApiResponse(200, null, "Settings update endpoint not implemented yet"));
});
