import api from "./api";

export default {
    login(email, password) {
        return api.post(
            "/api/auth/login",
            { email, password },
            { withCredentials: true }
        );
    },

    googleLogin(idToken) {
        return api.post(
            "/api/auth/google",
            { idToken },
            { withCredentials: true }
        );
    },

    getCurrentUser() {
        return api.get("/api/auth/me", {
            withCredentials: true
        });
    },

    logout() {
        return api.post(
            "/api/auth/logout",
            {},
            { withCredentials: true }
        );
    }
};