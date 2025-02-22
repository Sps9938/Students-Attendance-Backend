import { Router } from "express";
import { 
    getDashBoardStats,
    downloadAttendanceReport
 } from "../controllers/dashboard.controllers.js";

import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";
const router = Router();

router.use(verifyJWT);

router.route("/dashboard/download/bydate/:classId").post(
    upload.fields([
        {
            name: "studentData",
            maxCount: 1
        }
    ]),
    downloadAttendanceReport
)

router.route("/get/dashboard/stats/:classId").get(getDashBoardStats)
// router.route("/dashboard/download/bydate/:classId").get(downloadAttendanceReport)

export default router;