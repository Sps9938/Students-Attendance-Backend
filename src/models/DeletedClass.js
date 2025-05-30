import mongoose from "mongoose";
const DeletedClassSchema = new mongoose.Schema({
     className: {
            type: String,
            required: true,
        },
        courseName: {
            type: String,
            required: true,
        },
        yearBatch: {
            type: String,
            required: true,
        },
        teacherName: {
            type: String,
            required: true,
        },
        deletedAt: {type: Date, default: Date.now},
        pdfUrl: {
            type: String,
            // required: true,
        }
})

export const DeletedClass = mongoose.model("DeletedClass", DeletedClassSchema)