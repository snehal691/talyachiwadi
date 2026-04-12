import express from "express";
import {
  createBooking,
  verifyBookingPayment,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
} from "../controllers/booking.controller.js";
import { verifyJWT } from "../middleware/verifyJWT.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

// Public booking endpoints
router.post("/create-order", createBooking);
router.post("/verify-payment", verifyBookingPayment);

// Admin / protected booking endpoints
router.get("/", verifyJWT, isAdmin, getAllBookings);
router.get("/:id", verifyJWT, isAdmin, getBookingById);
router.patch("/:id/status", verifyJWT, isAdmin, updateBookingStatus);

export default router;
