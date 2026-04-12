import mongoose, { Schema } from "mongoose";
import validator from "validator";

const bookingSchema = new Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
        minLength: 2,
        maxLength: 50,
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
            message: "Please enter a valid email address",
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
    bookingType: {
        type: String,
        enum: ['deluxeRoom', 'coupleTent', 'groupTent', 'other', 'couplePackage'],
        default: 'deluxeRoom',
        required: true,
        index: true,
    },    
    settingsId: {
        type: Schema.Types.ObjectId,
        ref: 'Settings',
    },    
    //for cron job
    isConfirmationSent: {
        type: Boolean,
        default: false,
        index: true,
    },
    checkIn: {
        type: Date,
        required: true,
    },
    checkOut: {
        type: Date,
        required: true,
        validate: {
            validator(value) {
                if (!value || !this.checkIn) return true;
                return value > this.checkIn;
            },
            message: "Check-out date must be after check-in date.",
        },
    },
    nights: {
        type: Number,
        required: true,
        min: 1,
        validate: {
            validator(value) {
                if (!value || !this.checkIn || !this.checkOut) return true;
                const msPerDay = 1000 * 60 * 60 * 24;
                return value = Math.round((this.checkOut - this.checkIn) / msPerDay);
            },
            message: "Check-out date must be after check-in date.",
        }
    },
    guestsTotal: {
        type: Number,
        required: true,
        min: 1,
        max: 4,
    },
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
    pricingSnapshot: {
        baseRate: {
            type: Number,
            required: true,
            min: 0,
        },
        extraAdultRate: {
            type: Number,
            required: true,
            min: 0,
        },
        kidBelow5Rate: {
            type: Number,
            required: true,
            min: 0,
        },
        kid5to10Rate: {
            type: Number,
            required: true,
            min: 0,
        },
        coupleTentRate: {
            type: Number,
            required: true,
            min: 0,
        },
        groupTentRate: {
            type: Number,
            required: true,
            min: 0,
        },
        currency: {
            type: String,
            required: true,
            default: "INR",
        },
    },
    baseAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    extrasAmount: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    onlinePayableAmount: {
        type: Number,
        required: function() {
            return this.paymentMode === 'online';
        },
        min: 0,
        default: 0,
    },
    amountDueAtProperty: {
        type: Number,
        required: function() {
            return this.paymentMode === 'cash_on_arrival';
        },
        min: 0,
        default: 0,
    },
    paymentMode: {
        type: String,
        enum: ['online', 'cash_on_arrival'],
        default: 'online',
        required: true,
    },
    bookingStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending',
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending',
    },
    latestRazorpayTxnId: {
        type: Schema.Types.ObjectId,
        ref: 'RazorpayTransaction',

    },
    currency: {
        type: String,
        required: true,
        default: "INR",
    },
}, {
    timestamps: true,
});

bookingSchema.index({ email: 1, fullName: 1, createdAt: -1 });
bookingSchema.index({ paymentStatus: 1, bookingStatus: 1, createdAt: -1 });
bookingSchema.index({ checkIn: 1, checkOut: 1, createdAt: -1 });
bookingSchema.index({ latestRazorpayTxnId: 1 }, { sparse: true });


//validate the pre save 
bookingSchema.pre("validate", function (next) {
  if (this.paymentMode === "online") {
    if (!this.onlinePayableAmount || this.onlinePayableAmount <= 0) {
      this.invalidate("onlinePayableAmount", "Online payable amount must be greater than 0");
    }
    this.amountDueAtProperty = 0;
  }

  if (this.paymentMode === "cash_on_arrival") {
    if (!this.amountDueAtProperty || this.amountDueAtProperty <= 0) {
      this.invalidate("amountDueAtProperty", "Amount due at property must be greater than 0");
    }
    this.onlinePayableAmount = 0;
  }

  next();
});



export const Booking = mongoose.model("Booking", bookingSchema);
