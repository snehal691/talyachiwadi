import mongoose, { Schema } from "mongoose";
import validator from "validator";

const bookingSchema = new Schema(
    {
        //Screen 1 fields
        fullName: {
            type: String,
            required: true,
            trim: true,
            minLength: 2,
            maxLength: 50
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            lowercase: true,
            trim: true,
            minLength: 5,
            maxLength: 50,
            validate: {
                validator: validator.isEmail,
                message: "Please enter a valid email address"
            }
        },
        mobileNumber: {
            type: String,
            match: [/^[0-9]{10,20}$/, "Please enter a valid mobile number"],
            required: [true, "Mobile number is required"],
            trim: true,
            minLength: 10,
            maxLength: 20,
        },
        checkIn: {
            type: Date,
            required: true,
            index: true,
        },
        checkOut: {
            type: Date,
            required: true,
            index: true,
            validate: {
                validator(value) {
                    if (!value || value > this.checkIn) {
                        return true
                    }
                    return value > this.checkIn
                },
                message: "Check out date must be greater than check in date"
            }
        },
        nights: {
            type: Number,
            required: true,
            min: 1,
        },

        //screen 2 guest details
        adults: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
        kidsBelow5: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
        kids5to10: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
        guestsTotal: {
            type: Number,
            required: true,
            min: 1,
            max: 4,
        },

        packageId: {
            type: Schema.Types.ObjectId,
            ref: "Package",
            required: true,
        },

        //we can ignore it but safe to keep it, if the package change in future
        packageSnapshot: {
            name: { type: String, required: true },
            slug: { type: String, required: true },
            category: { type: String, enum: ["tent", "room"], required: true },
        },

        pricingSnapshot: {
            packageBaseRatePerNight: { type: Number, required: true, min: 0 }, //from package rate
            extraPersonRate: { type: Number, required: true, min: 0 }, //from package rate
            kidBelow5Rate: { type: Number, required: true, min: 0 }, //from package rate 
            kid5to10Rate: { type: Number, required: true, min: 0 }, //from package rate
            currency: { type: String, required: true, default: "INR" },
        },

        //final rates
        baseAmount: { type: Number, required: true, min: 0 },
        extrasAmount: { type: Number, required: true, min: 0, default: 0 },
        totalAmount: { type: Number, required: true, min: 0 },

        //paymentModes

        paymentMode: {
            type: String,
            enum: ["cash_on_arrival", "online"],
            required: true,
            default: "online"
        },

        onlinePayableAmount: {
            type: Number,
            required: function () {
                return this.paymentMode === "online"
            },
            min: 0,
            default: 0
        },

        amountDueAtProperty: {
            type: Number,
            required: function () {
                return this.paymentMode === "cash_on_arrival";
            },
            min: 0,
            default: 0,
        },

        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed", "refunded"],
            default: "pending",
            index: true,
        },

        bookingStatus: {
            type: String,
            enum: ["pending", "confirmed", "cancelled", "completed"],
            default: "pending",
            index: true,
        },

        latestRazorpayTxnId: {
            type: Schema.Types.ObjectId,
            ref: "RazorpayTransaction",
        },

        //cron job
        isConfirmationSent: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    { timestamps: true }
)


bookingSchema.index({ packageId: 1, checkIn: 1, checkOut: 1, bookingStatus: 1 });
bookingSchema.index({ email: 1, createdAt: -1 });

bookingSchema.pre("validate", function (next) {
    if (this.paymentMode === "online") {
        this.amountDueAtProperty = 0;
        if (!this.onlinePayableAmount || this.onlinePayableAmount <= 0) {
            this.invalidate("onlinePayableAmount", "Online payable amount must be greater than 0");
        }
    }

    if (this.paymentMode === "cash_on_arrival") {
        this.onlinePayableAmount = 0;
        if (!this.amountDueAtProperty || this.amountDueAtProperty <= 0) {
            this.invalidate("amountDueAtProperty", "Amount due at property must be greater than 0");
        }
    }

    next();
});

export const Booking = mongoose.model("Booking", bookingSchema);
