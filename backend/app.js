import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();

//TO-DO : ADD Allowed CORS HERE

const origins =[
process.env.BASE_DEV_URL,
// process.env.BASE_PROD_URL,
]


app.use(
  cors({
      origin: origins,
      credentials: true,
      methods: ["GET", "POST", "DELETE", "OPTIONS"], //allowed requests methods
      allowedHeaders: ["Content-Type", "Authorization"],
  })
);






//Middlewares

//TO-DO : ADD LIMITER HERE
//app.use(limiter);

app.use(express.json({ limit: "50kb" }));

//helps to convert the user input into the json object added limit to prevent DoS attack
app.use(express.urlencoded({
    extended: true,
    limit: "50kb",
    parameterLimit: 100
}));

//using cookieParser for accepting or setting cookie
app.use(cookieParser()); 


//for public files like img, css and js
// not useful but might be useful in future
// app.use(express.static("public"));


//home route

app.get("/", (req, res) => {
    res.json({
        message: "Hello from backend",
        success: true,

    }).status(200);
})

//import routes : add here 
import healthCheckRoute from "./routes/healthCheck.route.js";
import enquiryRoute from "./routes/enquiry.route.js";
import authRoute from "./routes/auth.route.js";
import bookingRoute from "./routes/booking.route.js";


app.use("/api/v1/health-check", healthCheckRoute);
app.use("/api/v1/enquiry", enquiryRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/bookings", bookingRoute);


//global error handler
app.use((err, req, res, next) => {
  const statusCode = Number.isInteger(err?.statusCode) ? err.statusCode : 500;

  // Mongoose cast error (invalid ObjectId etc.)
  if (err?.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid request data",
      errors: [err.message],
    });
  }

  // Mongoose validation error
  if (err?.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: Object.values(err.errors || {}).map((e) => e.message),
    });
  }

  // Zod validation error
  if (err?.name === "ZodError") {
    return res.status(400).json({
      success: false,
      message: "Invalid form data",
      errors: err.issues?.map((i) => `${i.path.join(".")}: ${i.message}`) || [],
    });
  }

  return res.status(statusCode).json({
    success: false,
    message: err?.message || "Internal Server Error",
    errors: Array.isArray(err?.errors) ? err.errors : [],
  });
});

export default app;