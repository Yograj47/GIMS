import bcrypt from "bcryptjs";
import User from "../modules/user/user.model.js";

export const seedInitialUsers = async () => {
    try {
        const users = [
            {
                name: process.env.OWNER_NAME,
                email: process.env.OWNER_EMAIL,
                password: process.env.OWNER_PASSWORD,
                role: "owner",
                isVerified: true
            },
            {
                name: process.env.ADMIN_NAME,
                email: process.env.ADMIN_EMAIL,
                password: process.env.ADMIN_PASSWORD,
                role: "admin",
                isVerified: true
            }
        ];

        for (const userData of users) {
            if (!userData.email || !userData.password) continue;

            const existingUser = await User.findOne({ email: userData.email });
            if (existingUser) {
                console.log(`User ${userData.email} already exists.`);
                continue;
            }

            const hashedPassword = await bcrypt.hash(userData.password, 10);
            await User.create({
                name: userData.name,
                email: userData.email,
                password: hashedPassword,
                role: userData.role,
                isVerified: userData.isVerified
            });
            console.log(`User ${userData.email} created successfully.`);
        }
    } catch (error) {
        console.error("Error seeding data:", error);
    }
};