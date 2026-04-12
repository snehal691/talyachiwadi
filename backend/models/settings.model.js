import mongoose, { Schema } from "mongoose";

const settingsSchema = new Schema({
    totalDeluxeRooms: {
        type: Number,
        required: true,
        default: 8,
        min: 1,
        max: 1000,
    },
    totalTents: {
        type: Number,
        required: true,
        default: 2, //admin can change the number of tents
        min: 0,
        max: 1000,
    },
    minGuestsPerRoom: {
        type: Number,
        required: true,
        default: 2,
        min: 1,
    },
    maxGuestsPerRoom: {
        type: Number,
        required: true,
        default: 4,
        min: 1,
    },
    couplePackagePerNight: {
        type: Number,
        required: true,
        default: 500000, //5k per night in paisa 
        min: 0,
    },
    extraPersonRate: {
        type: Number,
        required: true,
        default: 100000, //1k per night in paisa
        min: 0,
    },
    kidBelow5Rate: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    kid5to10Rate: {
        type: Number,
        required: true,
        default: 50000, //500 per night in paisa
        min: 0,
    },
    coupleTentRate: {
        type: Number,
        required: true,
        default: 250000, //2.5k per night in paisa 
        min: 0,
    },
    groupTentRate: {
        type: Number,
        required: true,
        default: 450000, //4.5k per night in paisa
        min: 0,
    },
    allowCashOnArrival: {
        type: Boolean,
        required: true,
        default: true,
    },
    allowOnlinePayment: {
        type: Boolean,
        required: true,
        default: true,
    },
    adminCanOverrideRates: {
        type: Boolean,
        required: true,
        default: true,
    },
    currency: {
        type: String,
        required: true,
        default: "INR",
    },
}, {
    timestamps: true,
});

export const Settings = mongoose.model("Settings", settingsSchema);
