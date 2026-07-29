import ROLES from "../config/permission.js";

const rbac = (action) => {
    return (req, res, next) => {
        const { role } = req.user;

        // Admin has access to everything
        if (role === 'admin') {
            return next();
        }

        // Check if the user's role has the required permission
        const permissions = ROLES[role] || [];
        if (permissions.includes(action)) {
            return next();
        }
        res.status(403).json({ status: "Error", message: "Forbidden: You don't have permission to perform this action" });

    }
}

export default rbac;