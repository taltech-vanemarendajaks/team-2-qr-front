import axios from "axios";

export default {
    login(email, password) {
        return axios.post(
            "/api/auth/login",
            { email, password },
            { withCredentials: true }
        );
    },

    googleLogin(idToken) {
        return axios.post(
            "/api/auth/google",
            { idToken },
            { withCredentials: true }
        );
    },

    getCurrentUser() {
        return axios.get("/api/auth/me", {
            withCredentials: true
        });
    },

    logout() {
        return axios.post(
            "/api/auth/logout",
            {},
            { withCredentials: true }
        );
    }
};