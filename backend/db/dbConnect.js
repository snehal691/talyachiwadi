import mongoose from "mongoose";

let connectionStatus = "";

const dbConnect = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URL,{
            appName: process.env.MONGODB_APP_NAME
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        connectionStatus = "running";
    } catch (err) {
        console.log("Error while connecting to MongoDB:", err);
        connectionStatus = "error";
        throw err;
    }
};

export const checkConnectionStatus = () => {
    return connectionStatus;
    //to check connectionStatus 
    //Returns either error or running
};

export default dbConnect;