import { Student } from "../models/student.models.js";
import { Class } from "../models/class.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";


const addStudents = asyncHandler(async (req, res) => {
    // get classToken and students(a doc comes for students detalis as a praricular class)

    //then create student document
    const {students } = req.body;
    const {classId} = req.params;
    const classData = await Class.findById(classId)
    if (!classData) {
        throw new ApiError(400, "Invalid class link");
    }
    
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
              students: {
                $sortArray: {
                  input: "$students",
                  sortBy: { EnrollmentNo: 1 }
                }
              }
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
        $round: [
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
            2  
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

   

    const totalClasses = student.attendance.length;
    const presentDays = student.attendance.filter(att => att.status === 'Present').length;
    const percentage = parseFloat(((presentDays / totalClasses) * 100).toFixed(2));
    
    student.percentage = percentage;
   
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

const getEachStudentAttendance = asyncHandler(async(req, res) => {
    const { studentId } = req.params;
    if(!isValidObjectId(studentId)){
        throw new ApiError(400, "Invalid studentId");
    }

    const student = await Student.findById(studentId);
    if(!student){
        throw new ApiError(400, "Student Id Not Found");
    }
    const totalClasses = student.attendance.length;
    const presentCount = student.attendance.filter(entry => entry.status === "Present").length;
    const absentCount = student.attendance.filter(entry => entry.status === "Absent").length;
    const studentInfo = {
        student,
        attendanceSummary: {
            totalClasses,
            TotalPrsent: presentCount,
            TotalAbsent: absentCount,
        }
    }

return res
        .status(200)
        .json(new ApiResponse(
            200,
            studentInfo,
            "Single Student details Fetched Successfully"
        ))

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

const deleteStudentById = asyncHandler(async(req, res) => {
    const {studentId} = req.params;
    if(!isValidObjectId(studentId)){
        throw new ApiError(400, "Invalid student id");
    }
    const student = await Student.findById(studentId).populate("class");


     if(!student){
        throw new ApiError(400, "Student Not Found");
    }
    const classDetails = student.class
// console.log(classDetails);

    if(!classDetails){
        throw new ApiError(400, "user Not Found, your can not delete student");
    }

    // console.log(classDetails?.teacherId.toString());
    // console.log(req.user?._id.toString());
    
    if(classDetails?.teacherId.toString() !== req.user?._id.toString())
    {
        throw new ApiError(400, "You can not delete the class as you are not the owner");
    }

    const deleteStudent = await Student.findByIdAndDelete(student?._id)
    if(!deleteStudent)
    {
        throw new ApiError(500, "Failed to delete the stuedent record, Please try again");
    }

    return res.status(200)
    .json(new ApiResponse(
        200,
        "Student Record SuccessFully deleted"
    ))
})

const checkStudentDuplicates = asyncHandler(async(req, res) => {
    const { students } = req.body;
    const { classId } = req.params;
    if(!isValidObjectId(classId)){
        throw new ApiError(400,"Invalid Class id")
    };
    const cls = await Class.findById(classId);
    if(!cls){
        throw new ApiError(400,"Class Not Found")
    }
     const nameRegexes = students.map(s => new RegExp(`^${s.Name}$`, 'i'));
    const enrollmentRegexes = students.map(s => new RegExp(`^${s.EnrollmentNo}$`, 'i'));
//existing->find duplicates
    const existing = await Student.find({
        class: classId,
        $or: [
            { Name: { $in: nameRegexes }},
            { EnrollmentNo: { $in: enrollmentRegexes}}
        ]
    })
//store duplicates
    const duplicates = existing.map( s => ({
       Name: s.Name,
       EnrollmentNo: s.EnrollmentNo 
    }))

    // if(!duplicates){

    // }
    return res.status(200)
    .json(new ApiResponse(
        200,
        duplicates,
       `${duplicates.length} Duplicates student find Successfully`
    ))

})
// const duplicateEntry = asyncHandler(async(req, res)=> {
//     const {classId} = req.params;
//     if(!classId){
//         throw new ApiError(400, "Invalid class Id");
//     }
    
// })

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
    getEachStudentAttendance,
    deleteStudentById,
    checkStudentDuplicates,
    // getClassAttendanceByDate
}