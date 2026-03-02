import express from "express"
import {
    getActiveAlerts,
    getAllAlerts,
    resolveAlert
} from "../controllers/Alert.Controller.js"
import { userAuth } from "../middleware/Auth.middleware.js";
const router = express.Router();

router.use(userAuth)

router.get("/", getAllAlerts);
router.get("/active", getActiveAlerts);
router.patch("/:id/resolve", resolveAlert);

export default router;