import { Student } from "../models/student.models.js";
import { Class } from "../models/class.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";
import { app } from "../app.js";

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

const getStuentByClass = asyncHandler(async (req, res) => {
    //get classId
    //check valid classid
    //chck in class , classId exist or not
    //pipeline
    //$match
    //$lookup
    //$addfields
    //$project
    const { classId } = req.params;
    if (!isValidObjectId(classId)) {
        throw new ApiError(400, "Invlid classId");
    }
    const getClass = await Class.findById(classId);
    if (!getClass) {
        throw new ApiError(400, "classId Not Found");
    }
    const studentAggregate = await Class.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(getClass?._id)
            },
        },
        {
            $lookup: {
                from: "students",
                localField: "_id",
                foreignField: "class",
                as: "students",
               

            }
        },
     
        {
            $addFields: {
                totalStudents: {
                    $size: "$students"
                }
            }
        },
        {

            $project: {
              
                totalStudents: 1,
                students: {
                    Name: 1,
                    EnrollmentNo: 1,
                    createdAt: 1
                }

            }

        }

    ])
    if(!studentAggregate.length)
    {
        throw new ApiError(500, "Failed to fetch students detail, please try again")
    }
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        studentAggregate[0],
        "Student details Fetched Successfully"
    ))

})
export {
    addStudents,
    getStuentByClass
}