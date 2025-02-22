import { Student } from "../models/student.models.js";
import { Class } from "../models/class.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";
import { createObjectCsvWriter } from "csv-writer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
const getDashBoardStats = asyncHandler(async (req, res) => {
    const { classId } = req.params;
    const { date } = req.query;
    const attendanceDate = date ? new Date(date) : new Date();
    // console.log(attendanceDate);


    const formattedDate = attendanceDate.toISOString().split("T")[0];
    // console.log(formattedDate);

    // console.log(attendanceDate);

    if (!isValidObjectId(classId)) {
        throw new ApiError(400, "Invalid classId");
    }


    const getClass = await Class.findById(classId);
    if (!getClass) {
        throw new ApiError(400, "Class Not Found")
    }

    const studentAggregate = await Class.aggregate([
        {
            $match: {
                _id: getClass?._id
            }
        },
        {
            $lookup: {
                from: "students",
                localField: "_id",
                foreignField: "class",
                as: "studentsDetails",


            }
        },

        {
            $addFields: {
                totalStudents: {
                    $size: "$studentsDetails"
                }
            }
        },


    ])
    if (!studentAggregate.length) {
        throw new ApiError(500, "Failed to fetch students detail, please try again")
    }
    const totalStudents = studentAggregate[0].totalStudents;
    const attendanceStats = await Student.aggregate([
        {
            $match: {
                class: getClass?._id
            }
        },
        {
            $unwind: "$attendance",
        },
        {
            $match: {
                $expr: {
                    $eq: [
                        { $dateToString: { format: "%Y-%m-%d", date: "$attendance.date" } },
                        formattedDate
                    ]
                }
            }
        },

        {
            $group: {
                _id: "$attendance.status",
                students: {
                    $push: {
                        Name: "$Name",
                        EnrollmentNo: "$EnrollmentNo",
                    },
                },
                count: { $sum: 1 },
            },
        },
    ]);

    let presentStudents = [], absentStudents = [], totalPresent = 0, totalAbsent = 0;
    attendanceStats.forEach((record) => {
        if (record._id === "Present") {
            presentStudents = record.students;
            totalPresent = record.count;
        }
        else if (record._id === "Absent") {
            absentStudents = record.students;
            totalAbsent = record.count;
        }
    })


    const attendancePercentage = totalStudents > 0 ? ((totalPresent / totalStudents) * 100).toFixed(2) : 0;

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            {
                classId,
                date: formattedDate,
                totalStudents,
                totalPresent,
                totalAbsent,
                attendancePercentage,
                presentStudents,
                absentStudents

            },
            "Dashboard stats fetched Successfully"
        ))
})

const downloadAttendanceReport = asyncHandler(async (req, res) => {
    const { classId } = req.params;
    const { date } = req.query;
    const attendanceDate = date ? new Date(date) : new Date();
    // console.log(attendanceDate);


    const formattedDate = attendanceDate.toISOString().split("T")[0];
    // console.log(formattedDate);

    // console.log(attendanceDate);

    if (!isValidObjectId(classId)) {
        throw new ApiError(400, "Invalid classId");
    }


    const getClass = await Class.findById(classId);
    if (!getClass) {
        throw new ApiError(400, "Class Not Found")
    }

    const attendanceStats = await Student.aggregate([
        {
            $match: {
                class: getClass?._id
            }
        },
        {
            $unwind: "$attendance",
        },
        {
            $match: {
                $expr: {
                    $eq: [
                        { $dateToString: { format: "%Y-%m-%d", date: "$attendance.date" } },
                        formattedDate
                    ]
                }
            }
        },
        {
            $project: {
                Name: 1,
                EnrollmentNo: 1,
                status: "$attendance.status"
            }
        }


    ]);

    if (!attendanceStats.length) {
        throw new ApiError(400, "Failed to Fetched attendace records")
    }
    const __fileName = `Attendance_Report_${classId}_${attendanceDate.toISOString().split("T")[0]}.csv`;
    // const __dirname = path.dirname(__fileName);
    const __dirname = path.resolve();

    const downloadsDir = path.join(__dirname, "public/downloads");
    if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir, {
            recursive: true
        })
    }

    const filePath = path.join(downloadsDir, __fileName);
    //now create csv writer

    const csvWriter = createObjectCsvWriter({
        path: filePath,
        header: [
            {
                id: "Name",
                title: "Student Name"
            },
            {
                id: "EnrollmentNo",
                title: "Enrollment No"
            },
            {
                id: "status",
                title: "Attendance Status"
            }
        ]
    })

    await csvWriter.writeRecords(attendanceStats);

    // const fileUrl = `${req.protocol}://${(req.get("host"))}/downloads/${__fileName}`;

    // console.log(fileUrl);
    
    // res.download(filePath, __fileName, (err) => {
    //     if (err) {
    //         console.error("Error downloading file", err);
    //         res.status(500)
    //             .json({ message: "Error downloading file" });
    //     }
    //     fs.unlinkSync(filePath);


    // })

    //upload in cloudinary
    const fileupload = await uploadOnCloudinary(filePath);
    console.log(fileupload);
    
    if(!fileupload)
    {
        throw new ApiError(400, "File is required on cloudinary");
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
        {downloadUrl: fileupload.url},
            "Attendance report generated Successfully"
        ))
})


export {
    getDashBoardStats,
    downloadAttendanceReport
}