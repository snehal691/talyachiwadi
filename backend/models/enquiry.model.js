import mongoose, { Schema } from "mongoose";


const enquirySchema = new Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
        minLength:2,
        maxLength: 50
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
        lowercase: true,
        trim: true,
        minLength: 5,
        maxLength: 50, 
    },
    mobileNumber: {
        type: String,
        match: [/^[0-9]{10,15}$/, "Please enter a valid mobile number"],
        required: [true, "Mobile number is required"],
        trim: true,
        minLength: 10,
        maxLength: 20,
    },
    bookingType:{
        type: String,
        enum: ['destinationWedding', 'birthdayCelebration', 'kittyParty', 'corporateMeetings', 'schoolTrip', 'collegeEvent', 'culturalEvent', 'other'],
        default: 'other',
        required: true,
        index: true, //to search by destination weddings and all
    },
    message: {
        type: String,
        required: [true, "Message is required"],
        trim: true,
        minLength: [2, "Message must be at least 2 characters long"],
        maxLength: [1000, "Message must be at most 1000 characters long"]
    },
    status: {
        type: String,
        enum: ['pending', 'contacted', 'closed'],
        default: 'pending',
        index: true
    },
    isDeleted: {
        type: Boolean,
        default: false,
        index: true
    }
}, {
    timestamps: true
})

enquirySchema.index({email: 1, createdAt: -1});



export const Enquiry = mongoose.model("Enquiry", enquirySchema);