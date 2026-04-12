import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Booking } from "../models/booking.model.js";

export const createBooking = asyncHandler(async (req, res) => {
  // TODO: validate request body
  // TODO: calculate pricing and create a new booking draft
  // TODO: optionally create Razorpay order and return order details

  return res.json(new ApiResponse(200, null, "Booking creation endpoint not implemented yet"));
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
