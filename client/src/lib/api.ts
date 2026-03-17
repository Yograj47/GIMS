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
        
        // 1. Handle 401 Unauthorized (Not logged in)
        const isUnauthorized = status === 401;
        const isProfileCheck = config?.url?.includes("/users/profile");

        if (isUnauthorized) {
            if (isProfileCheck) {
                // Silent fail for initial auth check
                return Promise.reject(error);
            }
            // Optional: Redirect to login or clear store here
        }

        // 2. Handle 403 Forbidden (Permissions changed/Stale Token)
        if (status === 403) {
            const message = error.response?.data?.message || "Access denied: Permissions updated.";
            notify.error(`${message} Please re-login if this persists.`);
            
            // Logic: If they hit a 403, they likely have a stale token. 
            // You could optionally trigger a logout here if you want to be strict.
            return Promise.reject(error);
        }

        // 3. Show error notification for everything else (500, 400, etc.)
        const message = error.response?.data?.message || "Something went wrong";
        notify.error(message);
        
        return Promise.reject(error);
    }
);

export default api;