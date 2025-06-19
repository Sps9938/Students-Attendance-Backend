import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { Router } from "express";
import {
    createClass,
    DeleteClass,
    deleteClass,

    getAllClass,
    getDeletedClass,
    getDeletedClasses,
    getSingleClass,
    updateClass
} from "../controllers/class.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
const router = Router();

// router.route("/download/classReport").get(DownLoadClassReport);
router.use( verifyJWT );
router.route("/create-class").post(createClass)
router.route("/update/class/:classId").post(updateClass)
router.route("/delete/class/:classId").delete(deleteClass)
router.route("/get/AllClass").get(getAllClass)
router.route("/get/single/class/:classId").get(getSingleClass)

router.route("/delete-with-archive/:classId").post(DeleteClass)
router.route("/get/delete/class/:classId").get(getDeletedClass);
router.route("/get/all-deleted-classes").get(getDeletedClasses);

export default router;