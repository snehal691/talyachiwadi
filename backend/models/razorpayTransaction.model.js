import mongoose, { Schema } from "mongoose";

const razorpayTransactionSchema = new Schema({
    bookingId: {
        type: Schema.Types.ObjectId,
        ref: "Booking",
        required: true,
    },
    orderId: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    paymentId: {
        type: String,
        trim: true,
        unique: true,
        sparse: true,
    },
    signature: {
        type: String,
        trim: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    currency: {
        type: String,
        required: true,
        default: "INR",
    },
    method: {
        type: String,
        enum: ["upi", "card", "netbanking", "wallet", "other"],
        default: "other",
    },
    status: {
        type: String,
        enum: ["created", "authorized", "captured", "failed", "refunded"],
        default: "created",
        index: true,
    },
    gatewayPayload: {
        type: Schema.Types.Mixed,
    },
}, {
    timestamps: true,
});

razorpayTransactionSchema.index({ bookingId: 1, orderId: 1, paymentId: 1 });

export const RazorpayTransaction = mongoose.model("RazorpayTransaction", razorpayTransactionSchema);
