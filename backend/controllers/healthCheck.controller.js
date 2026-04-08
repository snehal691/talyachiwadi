import { checkConnectionStatus } from "../db/dbConnect.js";

export const healthCheck = (req, res) => {
    let connectionStatus = checkConnectionStatus();

    console.log({connectionStatus});

    if(connectionStatus !== "running"){
        return res.status(500).json({
            message: "DB connection error", 
            data: `Not Healthy`,
            success: false
        })
    }

    return res.status(200).json({
        message: "DB connection success",
        data: `Healthy`,
        success: true
    })
}