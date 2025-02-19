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
                    Enumerator: ['Present', "Absent"],
                    required: true,
                },
            },
        ],
        // totalStudents: {
        //     type: Number,
        //     required: true,
        // }
    }, {timestamps: true}
)

export const Student = mongoose.model("Student", studentSchema);