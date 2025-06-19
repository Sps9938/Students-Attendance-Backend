import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { Router } from "express";
import {
    createClass,
    DeleteClass,
    deleteClass,
    DownLoadClassReport,
    getAllClass,
    getDeletedClass,
    getDeletedClasses,
    getSingleClass,
    // handleAllDeleteClass,
    makeDeleteDeletedClass,
    updateClass
} from "../controllers/class.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
const router = Router();

router.route("/download/classReport").get(DownLoadClassReport);

// router.route("/getAllDeletedClasses").get(handleAllDeleteClass)
router.use( verifyJWT );
router.route("/create-class").post(createClass)
router.route("/update/class/:classId").post(updateClass)
router.route("/delete/class/:classId").delete(deleteClass)
router.route("/get/AllClass").get(getAllClass)
router.route("/get/single/class/:classId").get(getSingleClass)

router.route("/delete-with-archive/:classId").post(
    upload.single("pdf"),
    DeleteClass
)
router.route("/get/delete/class/:classId").get(getDeletedClass);
router.route("/get/all-deleted-classes").get(getDeletedClasses);

router.route("/makedeleteAllDeletedClasses/:classId").delete(makeDeleteDeletedClass);

export default router;