import express from "express"
import {
    createAlert,
    getAlerts,
} from "../controllers/Alert.Controller.js"
import { userAuth } from "../middleware/Auth.middleware.js";
import rbac from "../middleware/Role.middleware.js";
const router = express.Router();

router
    .route("/")
    .get(userAuth, rbac("alert:read"), getAlerts)
    .post(userAuth, createAlert);

export default router;