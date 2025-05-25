import { Class } from "../models/class.models.js";
import { User } from "../models/user.models.js";
import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import crypto from "crypto";
const createClass = asyncHandler(async (req, res) => {
    //get className, courseName, yearBatch
    //create playlist using mongoose


    const { className, courseName, yearBatch } = req.body;
    if (
        [className, courseName, yearBatch].some((field) => (field ?? "").trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }
    const classToken = crypto.randomBytes(10).toString('hex');
    const classLink = `http://localhost:4000/class/form/${classToken}`;




    const creratedClass = await Class.create({
        className,
        courseName,
        yearBatch,
        teacherId: req.user?._id,
        classToken,
        link: classLink
    })
    if (!creratedClass) {
        throw new ApiError(500, "Failed to create Class Please try again");
    }
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            creratedClass,
            "Class created Successfully"
        ))
})

const updateClass = asyncHandler(async (req, res) => {
    const { className, courseName, yearBatch } = req.body;
    if (!(className && courseName && yearBatch)) {
        throw new ApiError(400, "All fields are required");
    }
    const { classId } = req.params;
    if (!isValidObjectId(classId)) {
        throw new ApiError(400, "Invalid classId")
    }
    const getclass = await Class.findById(classId);
    if (!getclass) {
        throw new ApiError(400, "Class Not Found, Please enter valid classId");
    }
    if (getclass?.teacherId.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "You can not edit the classDetails as you are not the owner");
    }

    const updateDetails = await Class.findByIdAndUpdate(
        getclass?._id,
        {
            $set: {
                className,
                courseName,
                yearBatch
            }
        },
        {new: true}

    )
    if(!updateDetails)
    {
        throw new ApiError(500, "Failed to Update the class, Please try again");
    }

    return res
    .status(200)
    .json(new ApiResponse(
        200, 
        updateDetails,
        "Class Updated Successfully"
    ))
})

const deleteClass = asyncHandler(async(req, res) => {
    //get classId
    //check valid classId
    //check onwerId match with userId
    //delete class
    const { classId } = req.params;
    if(!isValidObjectId(classId))
    {
        throw new ApiError(400, "Invalid classId");
    }
    const getclass = await Class.findById(classId);
    if(!getclass)
    {
        throw new ApiError(400, "classId is Not Found")
    }
    if(getclass?.teacherId.toString() !== req.user?._id.toString())
    {
        throw new ApiError(400, "You can not delete the class as you are not the owner");
    }

    const deleteClass = await Class.findByIdAndDelete(getclass?._id)
    if(!deleteClass)
    {
        throw new ApiError(500, "Failed to delete the class, Please try again");
    }
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        {},
        "Class Deleted Successfully"
    ))
})


const getAllClass = asyncHandler(async (req, res) => {
    const teacherId = req.user?._id;

    if (!teacherId) {
        throw new ApiError(401, "Unauthorized. Please login");
    }

    const classes = await Class.find({ teacherId })

    if (!classes || classes.length === 0) {
        throw new ApiError(404, "No classes found for this teacher");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            classes,
            "Classes fetched successfully"
        )
    );
});


const getSingleClass = asyncHandler(async(req, res) => {
    const teacherId = req.user?._id;
    const {classId} = req.params;

    if(!teacherId){
        throw new ApiError(401, "Unauthorized Please Login");

    }
    if(!classId){
        throw ApiError(400, "Class Id is Required");
    }

    const singleClass = await Class.findOne({
        teacherId,
        _id: classId
    })

    if(!singleClass){
        throw new ApiError(404, "Classs not Found for this teacher");

    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            singleClass,
            "Class Fethed Successfully"
        )
    )
})
  

export {
    createClass,
    updateClass,
    deleteClass,
    getAllClass,
    getSingleClass
}