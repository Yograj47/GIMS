import express from "express";
const router = express.Router();
import { userAuth } from "../middleware/Auth.middleware.js";
import { getGeneralSettings, updateGeneralSettings } from "../controllers/Setting.Controller.js";
import rbac from "../middleware/Role.middleware.js";

router.route("/general")
    .get(userAuth, rbac("generalSetting:read"), getGeneralSettings)
    .put(userAuth, rbac("generalSetting:write"), updateGeneralSettings);

export default router;