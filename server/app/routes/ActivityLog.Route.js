import express from "express"
import {
    createActivityLog,
    getActivityLogs
} from "../controllers/ActivityLog.Controller.js"
import { userAuth } from "../middleware/userAuth.js"
const router = express.Router();

router
    .route("/")
    .get(userAuth, getActivityLogs)
    .post(userAuth, createActivityLog);

export default router;