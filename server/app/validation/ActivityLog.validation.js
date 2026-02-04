import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

export const activityLogSchema = z.object({
    performedBy: objectId,
    action: z.enum([
        "create",
        "update",
        "delete",
        "login",
        "logout"
    ]),
    type: z.enum([
        "product",
        "category",
        "supplier",
        "user",
        "alert"
    ]),
    message: z
        .string()
        .min(3, "Log message must be at least 3 characters")
        .trim(),
});
