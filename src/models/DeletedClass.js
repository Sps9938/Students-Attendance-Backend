import mongoose, { Schema } from "mongoose";
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
       teacherId: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        deletedAt: {type: Date, default: Date.now},
        pdfUrl: {
            type: String,
            // required: true,
        }
})

export const DeletedClass = mongoose.model("DeletedClass", DeletedClassSchema)