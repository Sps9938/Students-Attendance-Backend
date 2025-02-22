import express from "express";

import cors from "cors";

import cookieParser from "cookie-parser";

const app = express();

app.use(express.json({limit: "16kb"}))

app.use(express.urlencoded({extended: true, limit: "16kb"}))

app.use(cookieParser());


import teacherRouter from "./routes/user.routes.js";
import classRouter from "./routes/class.routes.js";
import studentRouter from "./routes/students.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"

app.use("/api/v1/user", teacherRouter);
app.use("/api/v1/class", classRouter);
app.use("/api/v1/student", studentRouter);
app.use("/api/v1/dashboard", dashboardRouter);



//https://localhost:4000/api/v1/teacher/register

export { app };