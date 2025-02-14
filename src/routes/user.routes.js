import { Router } from "express";
import { 
    register,
    loginUser,
    logoutUser,
    getCurrentUser
 } from "../controllers/user.controllers.js";

import { verifyJWT } from "../middlewares/auth.middlewares.js";
const router = Router();


router.route("/register").post(register);
router.route("/login").patch(loginUser);
router.route("/logout").patch(verifyJWT, logoutUser)
router.route("/get-user").get(verifyJWT, getCurrentUser)
export default router;