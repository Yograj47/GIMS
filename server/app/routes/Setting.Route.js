import express from "express";
const router = express.Router();
import { userAuth } from "../middleware/userAuth.js";
import { getGeneralSettings, updateGeneralSettings } from "../controllers/Setting.Controller.js";

router.route("/general")
    .get(userAuth, getGeneralSettings)
    .put(userAuth, updateGeneralSettings);

export default router;