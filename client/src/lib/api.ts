import axios from "axios";
import { notify } from "./toast";

const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    headers: {
        'Content-Type': "application/json",
    }
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || "Something went wrong";
        notify.error(message);
        return Promise.reject(error)
    }
)

export default api;