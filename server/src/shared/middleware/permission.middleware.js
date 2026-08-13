import {
    ROLE_PERMISSIONS
} from "../constants/index.js";

export const authorize =
    (...requiredPermissions) =>
        (req, res, next) => {
            const role = req.user.role;

            const permissions =
                ROLE_PERMISSIONS[role] || [];

            const allowed =
                requiredPermissions.every(
                    permission =>
                        permissions.includes(permission)
                );

            if (!allowed) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You do not have permission to perform this action",
                });
            }

            next();
        };