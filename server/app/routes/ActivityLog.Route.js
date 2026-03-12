import express from "express"
import {
    getActivityLogs
} from "../controllers/ActivityLog.Controller.js"
import { userAuth } from "../middleware/Auth.middleware.js";
import rbac from "../middleware/Role.middleware.js";

const router = express.Router();
router.use(userAuth);

router
    .route("/")
    .get(rbac("report:read"), getActivityLogs);

export default router;