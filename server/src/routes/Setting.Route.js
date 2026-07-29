import express from "express";
import { userAuth } from "../middleware/Auth.middleware.js";
import { getGeneralSettings, updateGeneralSettings } from "../controllers/Setting.Controller.js";
import rbac from "../middleware/Role.middleware.js";

const router = express.Router();
router.use(userAuth);

router.route("/general")
    .get(rbac("generalSetting:read"), getGeneralSettings)
    .put(rbac("generalSetting:write"), updateGeneralSettings);

export default router;