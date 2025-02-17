import { Student } from "../models/student.models.js";
import { Class } from "../models/class.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";

const addStudents = asyncHandler(async (req, res) => {
    // get classToken and students(a doc comes for students detalis as a praricular class)
    //check classToken is exist in class object or not
    //then create student document
    const { classToken, students } = req.body;

    const classData = await Class.findOne({ classToken });
    if (!classData) {
        throw new ApiError(400, "Invalid class link");
    }
    if (classData?.teacherId.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "You can not add students as you are not the owner");
    }
    //create student document
    const studentDocs = students.map((student) => ({
        Name: student.Name,
        EnrollmentNo: student.EnrollmentNo,
        class: classData._id,

    }));
    //save students in database
    const add = await Student.insertMany(studentDocs);
    if (!add) {
        throw new ApiError(500, "Failed to Add Students");
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            add,
            "Students added Successfully"
        ))



})

export {
    addStudents
}