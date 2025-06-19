import { 
    addStudents,
    getStuentByClass,
    markAttendance,
    getStudetAttendance,
    getClassAttendance,
    getEachStudentAttendance,
    deleteStudentById,
    checkStudentDuplicates,
    // fordeletingAllStudents,
    // getClassAttendanceByDate
 } from "../controllers/student.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { Router } from "express";

const router = Router();


router.route("/add/students/:classId").post(addStudents)

router.route("/get/student/details/:classId").get(verifyJWT, getStuentByClass)
router.route("/mark/attendance/:studentId").post(verifyJWT, markAttendance)
router.route("/get/status/:studentId").get(verifyJWT, getStudetAttendance);
router.route("/get/class/attendance/:classId").get(verifyJWT, getClassAttendance)
router.route("/get/each/student/details/:studentId").get(verifyJWT, getEachStudentAttendance)
router.route("/delete/student/:studentId").delete(verifyJWT, deleteStudentById)
router.route("/check/duplicates/:classId").post(checkStudentDuplicates)
// router.route("/get/attendance/bydate/:classId").get(getClassAttendanceByDate)

// router.route("/getAllStudents").get(fordeletingAllStudents)
export default router;