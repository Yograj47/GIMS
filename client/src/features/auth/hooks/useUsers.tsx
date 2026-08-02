import { useAuthStore } from "@/store/authStore";

import { userService } from "../api/user.service";

import { notify } from "@/lib/toast";

import type { UserData } from "@/types/user";

export const useUsers = () => {
    const {
        users,
        setUsers,
        setUser,
        user,
        isLoading,
        setLoading,
    } = useAuthStore();

    const fetchUsers =
        async () => {
            try {
                setLoading(true);

                const response =
                    await userService.getUsers();

                setUsers(
                    response.data || []
                );
            } finally {
                setLoading(false);
            }
        };

    const updateRole =
        async (
            userId: string,
            role: string
        ) => {
            try {
                setLoading(true);

                const response =
                    await userService.updateRole(
                        userId,
                        role
                    );

                const updatedUser =
                    response.data as UserData;

                setUsers(
                    users.map((u) =>
                        u._id === userId
                            ? updatedUser
                            : u
                    )
                );

                if (
                    user?._id ===
                    userId
                ) {
                    setUser(
                        updatedUser
                    );
                }

                notify.success(
                    "Role updated successfully"
                );

                return true;
            } finally {
                setLoading(false);
            }
        };

    const removeUser =
        async (
            userId: string
        ) => {
            try {
                setLoading(true);

                await userService.removeUser(
                    userId
                );

                setUsers(
                    users.filter(
                        (u) =>
                            u._id !==
                            userId
                    )
                );

                notify.success(
                    "User removed successfully"
                );

                return true;
            } finally {
                setLoading(false);
            }
        };

    const updateProfile =
        async (
            name: string,
            email: string
        ) => {
            try {
                setLoading(true);

                const response =
                    await userService.updateProfile(
                        name,
                        email,
                    );

                setUser(
                    response.data ||
                    null
                );

                notify.success(
                    "Profile updated successfully"
                );

                return true;
            } finally {
                setLoading(false);
            }
        };

    const updatePassword =
        async (
            currentPassword: string,
            newPassword: string
        ) => {
            try {
                setLoading(true);

                await userService.updatePassword(
                    currentPassword,
                    newPassword,
                );

                notify.success(
                    "Password updated successfully"
                );

                return true;
            } finally {
                setLoading(false);
            }
        };

    return {
        users,
        isLoading,

        fetchUsers,
        updateRole,
        removeUser,
        updateProfile,
        updatePassword,
    };
};