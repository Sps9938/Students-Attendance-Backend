import express from "express";

import cors from "cors";

import cookieParser from "cookie-parser";

const app = express();

app.use(express.json({limit: "16kb"}))

app.use(express.urlencoded({extended: true, limit: "16kb"}))

app.use(cookieParser());

import teacherRouter from "./routes/user.routes.js";
import classRouter from "./routes/class.routes.js";
app.use("/api/v1/user", teacherRouter);
app.use("/api/v1/class", classRouter);

//https://localhost:4000/api/v1/teacher/register

export { app };