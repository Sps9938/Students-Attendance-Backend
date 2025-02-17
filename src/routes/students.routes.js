import { 
    addStudents
 } from "../controllers/student.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { Router } from "express";

const router = Router();

router.use(verifyJWT);
router.route("/add/students").post(addStudents)


export default router;