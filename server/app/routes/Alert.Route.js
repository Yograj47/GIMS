import express from "express"
import {
    createAlert,
    getAlerts,
    updateAlertById
} from "../controllers/Alert.Controller.js"
import { userAuth } from "../middleware/userAuth.js"
const router = express.Router();

router
    .route("/")
    .get(userAuth, getAlerts)
    .post(userAuth, createAlert);
router
    .route("/:id")
    .put(userAuth, updateAlertById); 

export default router;