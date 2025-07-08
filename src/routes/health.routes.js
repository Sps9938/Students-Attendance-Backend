import { Router } from "express";
import { pingController } from "../controllers/healthCheck";


const router = Router();


router.route("/ping").get(pingController)



export default router;