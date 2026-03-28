import axios from "axios";
import { notify } from "./toast";

const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': "application/json",
    }
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const { status, config } = error.response || {};


        if (status === 429) {
            const retryAfter = error.response?.data?.retryAfter || 60;
            const message = error.response?.data?.message ||
                `Too many requests. Try again in ${retryAfter} seconds`;

            notify.error(message);
            return Promise.reject(error);
        }

        // Handle 401 Unauthorized (Not logged in)
        const isUnauthorized = status === 401;
        const isProfileCheck = config?.url?.includes("/users/profile");


        if (isUnauthorized) {
            if (isProfileCheck) {
                // Silent fail for initial auth check
                return Promise.reject(error);
            }
        }

        // Handle 403 Forbidden (Permissions changed/Stale Token)
        if (status === 403) {
            const message = error.response?.data?.message || "Access denied: Permissions updated.";
            notify.error(`${message} Please re-login if this persists.`);

            return Promise.reject(error);
        }

        // Show error notification for everything else (500, 400, etc.)
        const message = error.response?.data?.message || "Something went wrong";
        notify.error(message);

        return Promise.reject(error);
    }
);

export default api;