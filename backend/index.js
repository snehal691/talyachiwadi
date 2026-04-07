import app from "./app.js";
import dbConnect from "./db/dbConnect.js";


const sleep = (ms) => new Promise(res => setTimeout(res, ms));
//dotenv config if needed

const PORT = process.env.PORT || 8000;

async function startServer() {
    try {
        await dbConnect();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error("Error starting the server:", err);
        console.log("retrying")
        await sleep(5000); // Wait for 5 seconds and retry the server
        return startServer(); //used return so that it attached to the event loop
    }
}

startServer();