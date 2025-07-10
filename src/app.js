import express from "express";

import cors from "cors";

import cookieParser from "cookie-parser";
//TODO

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "https://smartattendance-dashboard.vercel.app"
]

app.use(cors({
    origin: function (origin, callback) {
        if(!origin || allowedOrigins.includes(origin)){
            callback(null, true);
            /*
            null → No error occurred during origin check.(this is for error checking)

            true → The provided origin is allowed to access the resource.(this is for saying allowed to acces the resource)
            */
        }
        else{
            // console.log("Blocked Cors origing:", origin);
            
            callback(new Error("Not allowed CORS"));
        } 
    },

    credentials: true,
    
}));
// app.use(cors({
//     origin: "http://localhost:5173",
//     credentials: true,
// }));

app.use(express.json({limit: "16kb"}))

app.use(express.urlencoded({extended: true, limit: "16kb"}))

app.use(cookieParser());


import teacherRouter from "./routes/user.routes.js";
import classRouter from "./routes/class.routes.js";
import studentRouter from "./routes/students.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"
import healthRouter from "./routes/health.routes.js"

app.use("/api/v1/user", teacherRouter);
app.use("/api/v1/class", classRouter);
app.use("/api/v1/student", studentRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/health", healthRouter);

//if need to debugging then comment below line -> it is error stack trace and given html format
app.use((err, req, res, next) => {
//   console.error("Caught error:", err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || [],
    stack: process.env.NODE_ENV === "development" ? err.ApiError : undefined,
  });
});

//https://localhost:4000/api/v1/teacher/register

export { app };