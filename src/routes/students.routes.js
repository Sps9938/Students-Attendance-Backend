import { 
    addStudents,
    getStuentByClass
 } from "../controllers/student.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { Router } from "express";

const router = Router();

router.use(verifyJWT);
router.route("/add/students").post(addStudents)

router.route("/get/student/details/:classId").post(getStuentByClass)
export default router;