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
    //TODO-> 1st to Reeacive a temporary form from cR
    //After that teacher only add the student after verifyed
    // if (classData?.teacherId.toString() !== req.user?._id.toString()) {
    //     throw new ApiError(400, "You can not add students as you are not the owner");
    // }
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
    const { classId } = req.params;

    if (!isValidObjectId(classId)) {
        throw new ApiError(400, "Invalid classId");
    }

    const getClass = await Class.findById(classId);
    if (!getClass) {
        throw new ApiError(400, "classId Not Found");
    }

    const studentAggregate = await Class.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(getClass._id)
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
        $addFields: {
        totalStudents: { $size: "$students" },
        students: {
        $map: {
        input: "$students",
        as: "student",
        in: {
            _id: "$$student._id",
            Name: "$$student.Name",
            EnrollmentNo: "$$student.EnrollmentNo",
            attendance: "$$student.attendance",
            percentage: {
            $cond: [
                { $gt: [{ $size: "$$student.attendance" }, 0] },
                {
                $multiply: [
                    {
                $divide: [
                    {
                    $size: {
                    $filter: {
                        input: "$$student.attendance",
                        as: "att",
                        cond: { $eq: ["$$att.status", "Present"] }
                    }
                }
                },
                { $size: "$$student.attendance" }
                ]
            },
                    100
                ]
                },
                0
                ]
            }
        }
        }
        }
        }
        },
        {
            $project: {
                totalStudents: 1,
                students: 1
            }
        }
    ]);

    if (!studentAggregate.length) {
        throw new ApiError(500, "Failed to fetch students detail, please try again");
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            studentAggregate[0],
            "Student details fetched successfully"
        ));
});


const markAttendance = asyncHandler(async (req, res) => {
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

    const existing = student.attendance.find(
        (att) => att.date.toISOString().split("T")[0] === date
    );

    if (existing) {
        existing.status = status;
    } else {
        student.attendance.push({ date: new Date(), status });
    }

    // ✅ Calculate attendance percentage
    const totalClasses = student.attendance.length;
    const presentDays = student.attendance.filter(att => att.status === 'Present').length;
    const percentage = Math.round((presentDays / totalClasses) * 100);

    student.percentage = percentage; // Add a new `percentage` field in your schema if not present

    await student.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            { status, percentage },
            "Attendance marked successfully"
        )
    );
});


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

// const getClassAttendanceByDate = asyncHandler(async (req, res) => {
//     //get classId
//     //check valid classId
//     //get date
//     //pipeline
//     const { classId } = req.params;
//     const { date } = req.query;
//     if (!isValidObjectId(classId)) {
//         throw new ApiError(400, "Invalid classId");
//     }
//     if (!date) {
//         throw new ApiError(400, "Date is required");
//     }
//     const getClass = await Class.findById(classId);
//     if (!getClass) {
//         throw new ApiError(400, "ClassId Not Found");
//     }
//     const studentAggregate = await Class.aggregate([
//         {
//             $match: {
//                 _id: new mongoose.Types.ObjectId(getClass?._id)
//             }
//         },
//         {
//             $lookup: {
//                 from: "students",
//                 localField: "_id",
//                 foreignField: "class",
//                 as: "students"
//             }
//         },
//         {
//             $unwind: "$students"
//         },
//         {
//             $addFields: {
//                 presentCount: {
//                     $size: {
//                         $filter: {
//                             input: "$students.attendance",
//                             as: "att",
//                             cond: {
//                                 $and: [
//                                     {
//                                         $eq: [
//                                             { $dateToString: { format: "%Y-%m-%d", date: "$$att.date" } },
//                                             date
//                                         ]
//                                     },
//                                     { $eq: ["$$att.status", "Present"] }
//                                 ]
//                             }
//                         }
//                     }
//                 },
//                 absentCount: {
//                     $size: {
//                         $filter: {
//                             input: "$students.attendance",
//                             as: "att",
//                             cond: {
//                                 $and: [
//                                     {
//                                         $eq: [
//                                             { $dateToString: { format: "%Y-%m-%d", date: "$$att.date" } },
//                                             date
//                                         ]
//                                     },
//                                     { $eq: ["$$att.status", "Absent"] }
//                                 ]
//                             }
//                         }
//                     }
//                 },
//             }
//         },
//         {
//             $group: {
//                 _id: "$_id",
//                 students: {
//                     $push: {
//                         Name: "$students.Name",
//                         EnrollmentNo: "$students.EnrollmentNo",
//                         attendance: "$students.attendance",
//                         presentOnDate: "$presentCount",
//                         absentOnDate: "$absentCount"
//                     }
//                 },
//                 totalClassPresentOnDate: { $sum: "$presentCount" },
//                 totalClassAbsentOnDate: { $sum: "$absentCount" }
//             }
//         },
//         {
//             $project: {
//                 students: 1,
//                 totalClassPresentOnDate: 1,
//                 totalClassAbsentOnDate: 1
//             }
//         }

//     ])
//     if (!studentAggregate.length) {
//         throw new ApiError(500, "Failed to Fetch attendance details for the given date");
//     }

//     return res
//         .status(200)
//         .json(new ApiResponse(
//             200,
//             studentAggregate[0],
//             `Student attendance details for ${date}) fetched successfully`

//         ))

// })

export {
    addStudents,
    getStuentByClass,
    markAttendance,
    getStudetAttendance,
    getClassAttendance,
    // getClassAttendanceByDate
}