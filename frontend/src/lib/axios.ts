import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
    baseURL: baseURL,
    headers: {
        "Content-Type": "application/json",
    }
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
})

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If the error is a 401 Unauthorized, try to refresh the token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Attempt to refresh the token
            const refreshToken = localStorage.getItem("refresh_token");
            if (!refreshToken) {
                // If no refresh token is available, redirect to login
                window.location.href = "/auth";
                return Promise.reject(error);
            }

            try {
                const res = await axios.post(`${baseURL}/api/auth/refresh`, {
                    refresh: refreshToken
                })

                const newToken = res.data.data.auth_token;
                const newRefreshToken = res.data.data.refresh;
                localStorage.setItem("access_token", newToken);
                localStorage.setItem("refresh_token", newRefreshToken);

                originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                console.error("Refresh token failed:", refreshError);
                // If refresh fails, redirect to login
                localStorage.clear();
                window.location.href = "/auth";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
)

export default api;