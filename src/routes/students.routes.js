import { 
    addStudents,
    getStuentByClass,
    markAttendance,
    getStudetAttendance,
    getClassAttendance,
    // getClassAttendanceByDate
 } from "../controllers/student.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { Router } from "express";

const router = Router();


router.route("/add/students").post(addStudents)

router.route("/get/student/details/:classId").post(getStuentByClass, verifyJWT)
router.route("/mark/attendance/:studentId").post(markAttendance, verifyJWT)
router.route("/get/status/:studentId").get(getStudetAttendance, verifyJWT);
router.route("/get/class/attendance/:classId").get(getClassAttendance, verifyJWT)
// router.route("/get/attendance/bydate/:classId").get(getClassAttendanceByDate)
export default router;