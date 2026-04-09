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
        enum: ['stay', 'destinationWedding', 'corporateEvents', 'other'],
        default: 'other',
        required: true,
    },

    //For cron job confirmation
    isConfirmationSent: {
        type: Boolean,
        default: false,
        index: true // for efficient cron job queries on unsent confirmations
    },
    /*
    //TO-DO : add check in and checkout date -> done
    //? TO-DO: add guest count -> done 
    // TO- DO: razorpay payment gateway models here  -> done 
    //TO-DO : add payment details (e.g., totalAmount, paymentStatus enum ['pending', 'paid', 'failed']).
    //No. of guests=>
    */

    //TO-DO : Review this code from this to end
    checkIn: {
        type: Date,
        required: true,
    },
    checkOut: {
        type: Date,
        required: true,
        validate: {
            validator(value) {
                if(!value || !this.checkIn) return true;
                return value > this.checkIn;
            },
            message: "Check-out date must be after check-in date.",
        },
    },
    guestCount: {
        type: Number,
        required: false,
        default: 1,
    },
    totalAmount: {
        type: Number, //in paisas
        required: true,
        min: 100,
    },
    paymentDetails: {
        type: String,
        enum: ["online", "offline"],
        default: "online",
        //mostly it will be online 
    },

    //RAZORPAY
    currency: {
        type: String,
        required: true,
        default: "INR"
    },
    transactionDate: {
        type: Date,
        default: Date.now //date of transaction
    },
    razorpay_order_id: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    razorpay_payment_id: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    razorpay_signature: {
        type: String,
        required: true,
        trim: true
    },
    paymentStatus: {
        type: String,
        enum: ["created", "authorized", "captured", "failed", "refund"],
        default: "created"
    },
    paymentMethod: {
        type: String,
        enum: ["upi", "card", "netbanking", "wallet"],
        default: "upi"
    },
    receiptGenerated: {
        type: Boolean,
        default: false
    },
    receiptUrl: {
        type: String,
        trim: true
    },
}, {
    timestamps: true
});


// checkIn must be before checkOut; schema validator handles this now

bookingSchema.index({ email: 1, fullName: 1, createdAt: -1, });
bookingSchema.index({ paymentStatus: 1, createdAt: -1 });
bookingSchema.index({ checkIn: 1, checkOut: 1, createdAt: -1 });

//You can also add razorpay methods here 



//add razorpay methods here
export const Booking = mongoose.model("Booking", bookingSchema);

