import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Setting } from "../models/settings.model.js";


const updateSettingsSchema = z.object({
  extraPersonRate: z.coerce.number().min(0).optional(),
  kidBelow5Rate: z.coerce.number().min(0).optional(),
  kid5to10Rate: z.coerce.number().min(0).optional(),
  allowCashOnArrival: z.coerce.boolean().optional(),
  allowOnlinePayment: z.coerce.boolean().optional(),
  currency: z.string().trim().min(1).max(10).optional(),
});

export const getSettings = asyncHandler(async (req, res) => {

  const settings = await Setting.findOneAndUpdate(
    { singletonKey: "app_settings_singleton" },
    { $setOnInsert: { singletonKey: "app_settings_singleton" } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();

  if (!settings || Object.keys(settings).length === 0) {
    throw new ApiError(404, "Settings not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, settings, "Settings fetched successfully"));

});

export const updateSettings = asyncHandler(async (req, res) => {
  //get body 
  //empty body check 

  //validate
  const body = req.body || {};

  if (!body || Object.keys(body).length === 0) {
    throw new ApiError(400, "Empty Body")
  }

  const parsedResult = updateSettingsSchema.safeParse(body);

  if (!parsedResult.success) {
    throw new ApiError(400, parsedResult.error.issues[0]?.message || "Invalid form data");
  }

  const updates = parsedResult.data;

  // prevent singleton key tampering
  delete updates.singletonKey;

  const settings = await findOneAndUpdate(
    { singletonKey: "app_settings_singleton" },
    {
      $set: updates,
      $setOnInsert: { singletonKey: "app_settings_singleton" }
    },
    { 
      upsert: true, 
      new: true, 
      setDefaultsOnInsert: true, 
      runValidators: true }
  ).lean();

  if (!settings || Object.keys(settings).length === 0) {
    throw new ApiError(404, "Settings not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, settings, "Settings updated successfully"));

});
