import mongoose, { Schema } from "mongoose";
const studentSchema = new Schema(
    {
        Name: {
            type: String,
            required: true,
        },
        EnrollmentNo: {
            type: String,
            required: true,
        },
        class: {
            type: Schema.Types.ObjectId,
            ref: "Class",
        },
        attendance: [
            {
                date: {
                    type: Date,
                    default: Date.now
                },
                status: {
                    type: String,
                    enum: ['Present', "Absent"],
                    required: true,
                },
               
                
            },
        ],
        percentage: {
            type: Number,
            default: 0,
        },
     
        // totalStudents: {
        //     type: Number,
        //     required: true,
        // }
    }, {timestamps: true}
)

export const Student = mongoose.model("Student", studentSchema);