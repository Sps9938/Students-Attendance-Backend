import { Router } from "express";
import { register } from "../controllers/teacher.controllers.js";

const router = Router();

router.route("/register").get(register);

export default router;