import mongoose, { Schema } from "mongoose";

const settingsSchema = new Schema({
    singletonKey: {
        type: String,
        default: "app_settings_singleton",
        immutable: true,
        required: true,
        unique: true
    },
    extraPersonRate: {
        type: Number,
        required: true,
        default: 100000,
        min: 0
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
        default: 0,
        min: 0
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
    currency: {
        type: String,
        required: true,
        default: "INR",
        trim: true
    }

}, {
    timestamps: true
})

settingsSchema.index({singletonKey: 1}, {unique: true});

export const Setting = mongoose.model("Setting", settingsSchema);