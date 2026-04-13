import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Booking } from "../models/booking.model.js";
import z from "zod";

const quotationSchema = z.object({
  packageId : z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid package id",
    path: ["packageId"],
  }),
  checkInDate: z.coerce.date(),
  checkOutDate: z.coerce.date(),
  adults: z.coerce.number().int().min(1),
  kidsBelow5: z.coerce.number().int().min(0).default(0),
  kids5to10: z.coerce.number().int().min(0).default(0),
})



export const getQuotation = asyncHandler(async (req, res) => {
  //get payloa
  //validation 

  //check out date => check in date
  //check in date => today

  //get package 
  //see package maxGuests allowed 
  
  //check availabity 
  // 
  
  
  //base rate amount 


  //process
  //calculate
  //send response 
  const body = req.body;

  if (!body || Object.keys(body).length === 0) {
      throw new ApiError(400, "Form Data is Invalid")
  }





});


