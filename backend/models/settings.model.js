import mongoose, { Schema } from "mongoose";

const settingsSchema = new Schema({
    //Basic property information
    totalRooms: {
        type: Number,
        required: true,
        default: 1,
        min: 1,
    }
    //Pricing
    
})


/* 
1. Razorpay methods
2. env varaibles
3. changes in enquiry according to client message
4. Settings model add here 
*/