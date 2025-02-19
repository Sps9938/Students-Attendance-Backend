import { Student } from "../models/student.models.js";
import { Class } from "../models/class.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";
import { app } from "../app.js";
import { json } from "express";

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
                    attendance: 1
                }

            }

        }

    ])
    if (!studentAggregate.length) {
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

const markAttendance = asyncHandler(async (req, res) => {
    //get studentId and status
    //chack studentid valid or not
    //check status already exist or non
    //update new status
    const { studentId } = req.params;
    const { status } = req.body;
    const date = new Date().toISOString().split("T")[0];
    if (!isValidObjectId(studentId)) {
        throw new ApiError(400, "Invalid studentId");
    }
    const student = await Student.findById(studentId);
    if (!student) {
        throw new ApiError(400, "Student Not Found");
    }

    const existAttendance = student.attendance.find((att) => att.date.toISOString().split("T")[0] === date);
    if (existAttendance) {
        //update existing attendance status
        existAttendance.status = status;
    }
    else {
        //Add new attendance entry
        student.attendance.push({ date: new Date(), status });
    }
    await student.save();
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            status,
            "Attendance marked sucessfully"
        ))
})

const getStudetAttendance = asyncHandler(async (req, res) => {
    //get studentId
    //check valid or not
    //return res
    const { studentId } = req.params;
    if (!isValidObjectId(studentId)) {
        throw new ApiError(400, "Invalid studentId");
    }
    const student = await Student.findById(studentId);
    if (!student) {
        throw new ApiError(400, "student Not Found");
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            student.attendance,
            "Student Attendance Fetched Successfully"
        ));
})

const getClassAttendance = asyncHandler(async (req, res) => {
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
            $project: {
                students: {
                    Name: 1,
                    EnrollmentNo: 1,
                    attendance: 1
                }

            }

        }

    ])
    if (!studentAggregate.length) {
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

const getClassAttendanceByDate = asyncHandler(async (req, res) => {
    //get classId
    //check valid classId
    //get date
    //pipeline
    const { classId } = req.params;
    const { date } = req.query;
    if (!isValidObjectId(classId)) {
        throw new ApiError(400, "Invalid classId");
    }
    if (!date) {
        throw new ApiError(400, "Date is required");
    }
    const getClass = await Class.findById(classId);
    if (!getClass) {
        throw new ApiError(400, "ClassId Not Found");
    }
    const studentAggregate = await Class.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(getClass?._id)
            }
        },
        {
            $lookup: {
                from: "students",
                localField: "_id",
                foreignField: "class",
                as: "students"
            }
        },
        {
            $unwind: "$students"
        },
        {
            $addFields: {
                presentCount: {
                    $size: {
                        $filter: {
                            input: "$students.attendance",
                            as: "att",
                            cond: {
                                $and: [
                                    {
                                        $eq: [
                                            { $dateToString: { format: "%Y-%m-%d", date: "$$att.date" } },
                                            date
                                        ]
                                    },
                                    { $eq: ["$$att.status", "Present"] }
                                ]
                            }
                        }
                    }
                },
                absentCount: {
                    $size: {
                        $filter: {
                            input: "$students.attendance",
                            as: "att",
                            cond: {
                                $and: [
                                    {
                                        $eq: [
                                            { $dateToString: { format: "%Y-%m-%d", date: "$$att.date" } },
                                            date
                                        ]
                                    },
                                    { $eq: ["$$att.status", "Absent"] }
                                ]
                            }
                        }
                    }
                },
            }
        },
        {
            $group: {
                _id: "$_id",
                students: {
                    $push: {
                        Name: "$students.Name",
                        EnrollmentNo: "$students.EnrollmentNo",
                        attendance: "$students.attendance",
                        presentOnDate: "$presentCount",
                        absentOnDate: "$absentCount"
                    }
                },
                totalClassPresentOnDate: { $sum: "$presentCount" },
                totalClassAbsentOnDate: { $sum: "$absentCount" }
            }
        },
        {
            $project: {
                students: 1,
                totalClassPresentOnDate: 1,
                totalClassAbsentOnDate: 1
            }
        }

    ])
    if (!studentAggregate.length) {
        throw new ApiError(500, "Failed to Fetch attendance details for the given date");
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            studentAggregate[0],
            `Student attendance details for ${date}) fetched successfully`

        ))

})

export {
    addStudents,
    getStuentByClass,
    markAttendance,
    getStudetAttendance,
    getClassAttendance,
    getClassAttendanceByDate
}