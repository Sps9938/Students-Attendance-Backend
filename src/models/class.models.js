import mongoose, {Schema} from "mongoose";

const classSchema = new Schema(
    {
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
       classToken: {
        type: String,
        unique: true,
        required: true,
       },
       link: {
        type: String,
        required: true,
       },
    }, {timestamps: true}
)


export const Class = mongoose.model("Class", classSchema);