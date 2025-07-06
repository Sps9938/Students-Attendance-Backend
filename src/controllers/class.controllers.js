import { Class } from "../models/class.models.js";
import { DeletedClass } from "../models/DeletedClass.js";
import { User } from "../models/user.models.js";
import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import crypto from "crypto";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { runInNewContext } from "vm";
import { URL } from "url";
import path from "path";
import axios from "axios";
import { response } from "express";
const createClass = asyncHandler(async (req, res) => {
    //get className, courseName, yearBatch
    //create playlist using mongoose


    const { className, courseName, yearBatch,Section } = req.body;
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
        Section,
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
    const { className, courseName, yearBatch, Section } = req.body;
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
                Section,
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
  
const DeleteClass = asyncHandler(async(req, res) => {
    const {classId} = req.params;
    // const {pdfUrl}  = req.body;
    const classData = await Class.findById(classId).populate("teacherId");
    if(!classData){
        throw new ApiError(400, "Class Not Found");
    }

    if(!req.file){
        throw new ApiError(400, "PDF file is required");
    }
    // console.log("file path: ", req.file.path);
    
    const fileupload = await uploadOnCloudinary(req.file.path);

    // console.log("url is: ", fileupload.secure_url);
    
    if(!fileupload || !fileupload.secure_url){
        throw new ApiError(500, "Failed to upload PDF to Cloudinary");
    }
    // console.log(pdfUrl);
    
    const deleted = new DeletedClass({
        className: classData.className,
        courseName: classData.courseName,
        yearBatch: classData.yearBatch,
        teacherId: classData.teacherId,
        pdfUrl: fileupload.secure_url
    })

    await deleted.save();

    await Class.findByIdAndDelete(classId);
    return res.status(200)
    .json(new ApiResponse(
        200,
        "Class Archived and Deleted"
    ))

})

const getDeletedClass = asyncHandler(async(req, res)=> {
    const {classId} = req.params;
    if(!isValidObjectId(classId)){
        throw new ApiError(400,"Invalid Delete Class Id");
    }

    const classData = await DeletedClass.findById(classId);

    if(!classData){
        throw new ApiError(400, "Delete Class Not Found");
    }

    return res.status(200)
    .json(new ApiResponse(
        200, 
        classData,
        "Deleted Class Fetched Successfully"
    ))
})

//dashboard for deleted classes
const getDeletedClasses = asyncHandler(async(req, res) => {

    const teacher = await User.findById(req.user?._id).select("-password")
//    console.log("user id is: ", req.user?._id);
   
    if(!teacher){
        throw new ApiError(400, "Unauthorized Request");
    }

    // const queue = await DeletedClass.find({teacherId: teacher._id});
    let classes = await DeletedClass.find({teacherId: teacher._id});
    // console.log("queue size is: ",queue.length);
    // console.log("class leength: ", classes.length);
    

    if(classes.length > 10){
    // const remove = queue.shift();
    // const removeId = remove?._id;
    // const classId = removeId.toString();

    // console.log(classId);
    // console.log(classes[0]._id);


        await DeletedClass.findByIdAndDelete(classes[0]._id);
        classes =  await DeletedClass.find({teacherId: teacher._id});
    }
   

    // await DeletedClass.find({teacherId: teacher._id});
    // console.log("classes are: ", classes);
    
    if(!classes){
        throw new ApiError(400, "Classes Not Found")
    }
  
    return res.status(200)
    .json(new ApiResponse(
        200,
        classes,
        "Deleted Classes Fetched Successfully"
    ))
})

// controllers/downloadController.js



const DownLoadClassReport = asyncHandler (async(req, res) => {
      const fileUrl = req.query.url;

  if (!fileUrl) {
    return res.status(400).send('Missing PDF URL.');
  }

  try {
    const response = await axios.get(fileUrl, {
      responseType: 'stream',
      maxRedirects: 5, // Handle Cloudinary redirects
    });

    // Set headers to trigger download
    res.setHeader('Content-Disposition', 'attachment; filename=ClassReport.pdf');
    res.setHeader('Content-Type', 'application/pdf');

    // Pipe the stream from axios to the response
    response.data.pipe(res);
  } catch (error) {
    console.error('PDF Download Error:', error.message);
    res.status(500).send('Failed to download PDF.');
  }
}) 

// const handleAllDeleteClass = asyncHandler(async(req, res) => {
    
//     const deleteClasses = await DeletedClass.find();
//     // console.log(deleteClasses);
    
//     return res
//     .status(200)
//     .json(new ApiResponse(
//         200,
//         deleteClasses,
//         "All deleted classes fetched successfully"
//     ))
// })

const makeDeleteDeletedClass = asyncHandler(async(req, res) => {

    const {classId} = req.params;
    if(!isValidObjectId(classId)){
        throw new ApiError(400, "Invalid Class id")
    }

    const getclass = await DeletedClass.findById(classId);

    if(!getclass){
        throw new ApiError(400, "classId Not Found")
    }

      if(getclass?.teacherId.toString() !== req.user?._id.toString())
    {
        throw new ApiError(400, "You can not delete the class as you are not the owner");
    }

    await DeletedClass.findByIdAndDelete(getclass?._id);

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        "Deleted Successfully"
    ))
})


export {
    createClass,
    updateClass,
    deleteClass,
    getAllClass,
    getSingleClass,
    DeleteClass,
    getDeletedClass,
    getDeletedClasses,
    DownLoadClassReport,
    // handleAllDeleteClass,
    makeDeleteDeletedClass,
}