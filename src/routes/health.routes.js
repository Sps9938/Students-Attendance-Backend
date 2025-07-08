import { Router } from "express";
import { pingController } from "../controllers/healthCheck.controllers.js";


const router = Router();


router.route("/ping").get(pingController)



export default router;