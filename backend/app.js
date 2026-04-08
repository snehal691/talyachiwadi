import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

//TO-DO : ADD ALLOWED HEADERS HERE (BASEURL AND PROD_URL)
//TO-DO : ADD CORS HERE

/* 
const allowedHeaders =[
process.env.BASE_DEV_URL,
process.env.BASE_PROD_URL,
]

app.use(
  cors({
      origin: allowedHeaders,
      credentials: true,
      methods: ["GET", "POST", "DELETE", "OPTIONS"], //allowed requests methods
      allowedHeaders: ["Content-Type", "Authorization"],
  })
);


*/



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


app.use("/api/v1/health-check", healthCheckRoute);



export default app;