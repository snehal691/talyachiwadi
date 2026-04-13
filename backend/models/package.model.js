import mongoose, { Schema } from "mongoose";
import { minLength } from "zod";

const packageSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minLength: 2,
        maxLength: 80
    },
    slug:{
        type: String,
        unique: true,
        required: true,
        trim: true,
        minLength: 2,
        maxLength: 100,
        lowercase: true
    },
    category: {
        type: String,
        enum: ["tent", "room", "other"],
        required: true,
        index: true
    },
    baseRatePerNight: {
        type: Number,
        required: true,
        min: 0 //in paisa
    },
    maxGuests: {
        type: Number,
        required: true,
        default: 4,
        min: 1,
        max: 4
    },
    totalUnits: {
        type: Number,
        required: true,
        min: 1
    },
    isActive: {
        type: Boolean,
        required: true,
        default: true
    },
    description: {
        type: String,
        trim: true,
        maxLength: 1000,
        default: ""
    }
}, {
    timestamps: true
})

packageSchema.index({category: 1, isActive: 1, createdAt: -1});

export const Package = mongoose.model("Package", packageSchema);