import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Booking } from "../models/booking.model.js";
import z from "zod";
import { Settings } from "../models/settings.model.js";

const bookingSchema = z.object({

})

const quotationSchema = z.object({
  fullName: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
  email: z.email()
    .trim()
    .min(5, "Email must be at least 5 characters")
    .max(50, "Email must be at most 50 characters"),
  mobileNumber: z.string()
    .min(10, "Phone number must be at least 10 characters")
    .max(20, "Phone number must be at most 20 characters"),
  bookingType: z
    .enum(['deluxeRoom', 'coupleTent', 'groupTent', 'couplePackage'])
    .default('deluxeRoom'),
  checkIn: z.coerce.date(),
  checkOut: z.coerce.date(),
  adults: z.coerce.number().min(1).max(4),
  kidsBelow5: z.coerce.number().min(0).max(4).default(0).optional(),
  kids5to10: z.coerce.number().min(0).max(4).default(0).optional(),
})


export const quotation = asyncHandler(async (req, res) => {
  /*
   *STEPS get body 
    checkInDate > checkOutDate
    20 > 22
    checkIn  > today

    if(deluxeRate) => get deluxeRate
    if(coupleTentRate) => get coupleTentRate
    if(groupTentRate) => get groupTentRate
    if(couplePackageRate) => get couplePackageRate

    calculate the total amount and return to the user

   * 
   */

  const body = req.body;

  if (!body || Object.keys(body).length === 0) {
    throw new ApiError(400, "Invalid Form Data")
  }

  const parseResult = quotationSchema.safeParse(body);

  if (!parseResult.success) {
    throw new ApiError(400, parseResult.error.issues[0]?.message || "Form Data is Invalid");
  }

  const {
    fullName,
    email,
    mobileNumber,
    bookingType,
    checkIn,
    checkOut,
    adults,
    kidsBelow5,
    kids5to10,
  } = parseResult.data;

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const today = new Date();

  if (checkInDate < today) {
    throw new ApiError(400, "Check-in date must be in the future");
  }

  if (checkInDate > checkOutDate) {
    throw new ApiError(400, "Check-in date must be before check-out date");
  }
  
  //how to get rates here ? 
  const bookingRates = await Settings
                          .findOne({ singletonKey: "app_settings_singleton" })
                          .select("couplePackagePerNight coupleTentRate groupTentRate extraPersonRate kidBelow5Rate kid5to10Rate currency minGuestsPerRoom maxGuestsPerRoom allowOnlinePayment allowCashOnArrival")
                          .lean();

  if (!bookingRates) {
    throw new ApiError(500, "Error fetching booking rates");
  }
  
  const baseRate =
  bookingType === "coupleTent" ? bookingRates.coupleTentRate 
  : bookingType === "groupTent" ? bookingRates.groupTentRate 
  : bookingType === "couplePackage" ? bookingRates.couplePackagePerNight 
  : bookingRates.deluxePackagePerNight


  //if tent no extra is allowed 

 


  return res.json(new ApiResponse(200, "", "Quotation endpoint not implemented yet"));

})


export const createBooking = asyncHandler(async (req, res) => {
  
});

export const verifyBookingPayment = asyncHandler(async (req, res) => {
  // TODO: verify Razorpay payment signature
  // TODO: update booking paymentStatus and bookingStatus

  return res.json(new ApiResponse(200, null, "Booking payment verification endpoint not implemented yet"));
});

export const getAllBookings = asyncHandler(async (req, res) => {
  // TODO: add filters, pagination, and admin-only access
  const bookings = await Booking.find().sort({ createdAt: -1 });
  return res.json(new ApiResponse(200, bookings, "Bookings fetched successfully"));
});

export const getBookingById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, "Booking id is required");
  }

  const booking = await Booking.findById(id);
  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  return res.json(new ApiResponse(200, booking, "Booking fetched successfully"));
});

export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!id || !status) {
    throw new ApiError(400, "Booking id and status are required");
  }

  const updatedBooking = await Booking.findByIdAndUpdate(
    id,
    { bookingStatus: status },
    { new: true, runValidators: true }
  );

  if (!updatedBooking) {
    throw new ApiError(404, "Booking not found");
  }

  return res.json(new ApiResponse(200, updatedBooking, "Booking status updated successfully"));
});
