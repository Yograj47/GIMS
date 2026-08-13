import { Router } from "express";

import * as userController from "./user.controller.js";

import {
    authenticate,
    authorize,
} from "../../shared/middleware/index.js";

import {
    PERMISSIONS,
} from "../../shared/constants/index.js";

const router = Router();

router.use(authenticate);

router.get(
    "/me",
    userController.getMe
);

router.get(
    "/",
    authorize(PERMISSIONS.USER_READ),
    userController.getAllUsers
);

router.patch(
    "/profile",
    userController.updateProfile
);

router.patch(
    "/password",
    userController.updatePassword
);

export default router;