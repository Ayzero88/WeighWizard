import axios from "axios";

// Runs once at startup (imported by App.js). Puts the saved login token on every
// request, and sends the user back to the login screen when the token expires.
axios.interceptors.request.use((config) => {
    if (!config.url?.includes("/users/login")) {
        const token = localStorage.getItem("wt");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && !error.config?.url?.includes("/users/login")) {
            localStorage.removeItem("up");
            localStorage.removeItem("wt");
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

export default axios;
