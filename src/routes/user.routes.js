import { Router } from "express";
import { 
    register,
    loginUser,
    logoutUser,
    getCurrentUser,
    updateUserDetails,
    changeCurrentPassword,
    forgetUserPassword,
    sendOtp,
    verifyOtp
 } from "../controllers/user.controllers.js";

import { verifyJWT } from "../middlewares/auth.middlewares.js";
const router = Router();


router.route("/register").post(register);
router.route("/login").patch(loginUser);
router.route("/logout").patch(verifyJWT, logoutUser)
router.route("/get-user").get(verifyJWT, getCurrentUser)
router.route("/update-user-details").patch(verifyJWT,updateUserDetails)
router.route("/change-password").patch(verifyJWT, changeCurrentPassword)
router.route("/forget-password").patch(forgetUserPassword)
router.route("/request-otp").post(sendOtp)
router.route("/verify-otp").post(verifyOtp)
export default router;