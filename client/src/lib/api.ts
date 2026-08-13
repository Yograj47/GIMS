import axios from "axios";
import { notify } from "./toast";

const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const data = error.response?.data;
        const config = error.config;

        const message =
            data?.message ||
            data?.error ||
            "Something went wrong";

        // Network / server unavailable
        if (!error.response) {
            notify.error(
                "Unable to connect to server."
            );
            return Promise.reject(error);
        }

        // Rate limiting
        if (status === 429) {
            const retryAfter =
                data?.retryAfter || 60;

            notify.error(
                `${message} (Retry in ${retryAfter}s)`
            );

            return Promise.reject(error);
        }

        // Silent auth check
        const silentRoutes = [
            "/users/me",
        ];

        const isSilentRequest =
            silentRoutes.some((route) =>
                config?.url?.includes(route)
            );

        if (
            status === 401 &&
            isSilentRequest
        ) {
            return Promise.reject(error);
        }

        // Permission issue
        if (status === 403) {
            notify.error(
                `${message} Please re-login if this persists.`
            );

            return Promise.reject(error);
        }

        // Validation errors from backend
        if (
            status === 400 &&
            Array.isArray(data?.errors)
        ) {
            notify.error(
                data.errors[0]?.message ||
                message
            );

            return Promise.reject(error);
        }

        notify.error(message);

        return Promise.reject(error);
    }
);

export default api;