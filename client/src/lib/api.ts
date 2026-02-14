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
        // Check if the request failed because the user is not logged in
        const isUnauthorized = error.response?.status === 401;
        
        // Check if this was the initial profile check (the 'silent' check)
        // Adjust the string to match your actual profile endpoint path
        const isProfileCheck = error.config.url?.includes("/users/profile");

        if (isUnauthorized) {
            if (isProfileCheck) {
                // Return silently. useAuthStore will catch this and set isAuthenticated: false
                // No toast notification is shown.
                return Promise.reject(error);
            }
            
        }

        // Show error notification for everything else
        const message = error.response?.data?.message || "Something went wrong";
        notify.error(message);
        
        return Promise.reject(error);
    }
)

export default api;