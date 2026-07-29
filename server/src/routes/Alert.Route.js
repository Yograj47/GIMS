import express from "express";
import {
    getActiveAlerts,
    getAllAlerts,
    acknowledgeAlert
} from "../controllers/Alert.Controller.js";
import { userAuth } from "../middleware/Auth.middleware.js";
import rbac from "../middleware/Role.middleware.js"; 

const router = express.Router();

router.use(userAuth);
router.get("/", rbac("alert:read"), getAllAlerts);
router.get("/active", rbac("alert:read"), getActiveAlerts);
router.patch('/:id/acknowledge', acknowledgeAlert);

export default router;