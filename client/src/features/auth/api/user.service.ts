import api from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type { UserData } from "@/types/user";

const BASE_URL = "/users";

export const userService = {
    createStaff: async (payload: { name: string; email: string; password: string }) => {
        await api.post("/auth/users/staff", payload);
    },

    getMe: async () => {
        const { data } =
            await api.get<
                ApiResponse<UserData>
            >(
                `${BASE_URL}/me`
            );

        return data;
    },

    getUsers: async () => {
        const { data } =
            await api.get<
                ApiResponse<UserData[]>
            >(
                `${BASE_URL}`
            );

        return data;
    },

    updateProfile: async (
        name: string | undefined,
        email: string | undefined,
        contact?: Pick<UserData, "phone" | "deliveryAddress">
    ) => {
        const { data } =
            await api.patch<
                ApiResponse<UserData>
            >(
                `${BASE_URL}/profile`,
                {
                    name,
                    email,
                    ...contact,
                }
            );

        return data;
    },

    updatePassword: async (
        currentPassword: string,
        newPassword: string
    ) => {
        const { data } =
            await api.patch<
                ApiResponse
            >(
                `${BASE_URL}/password`,
                {
                    currentPassword,
                    newPassword,
                }
            );

        return data;
    },

    updateRole: async (
        userId: string,
        role: string
    ) => {
        const { data } =
            await api.patch<
                ApiResponse<UserData>
            >(
                `/auth/users/${userId}/role`,
                { role }
            );

        return data;
    },

    removeUser: async (
        userId: string
    ) => {
        const { data } =
            await api.delete<
                ApiResponse
            >(
                `/auth/users/${userId}`
            );

        return data;
    },
};
