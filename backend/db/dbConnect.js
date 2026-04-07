import mongoose from "mongoose";

let connectionStatus = "";

const dbConnect = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URL,{
            appName: process.env.MONGODB_APP_NAME
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        connectionStatus = "Running";
    } catch (err) {
        console.log("Error while connecting to MongoDB:", err);
        connectionStatus = "Error";
        throw err;
    }
};

export const checkConnectionStatus = () => {
    return connectionStatus;
    //to check connectionStatus 
};

export default dbConnect;