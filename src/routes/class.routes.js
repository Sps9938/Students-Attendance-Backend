import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { Router } from "express";
import {
    createClass,
    deleteClass,
    getAllClass,
    updateClass
} from "../controllers/class.controllers.js";

const router = Router();

router.use( verifyJWT );
router.route("/create-class").post(createClass)
router.route("/update/class/:classId").post(updateClass)
router.route("/delete/class/:classId").delete(deleteClass)
router.route("/get/AllClass").get(getAllClass)

export default router;