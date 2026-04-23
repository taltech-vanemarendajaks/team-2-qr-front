import api from "./api";

export default {
    forgotPassword(email) {
        return api.post("/api/auth/forgot-password", { email });
    },

    resetPassword(token, newPassword) {
        return api.post("/api/auth/reset-password", { token, newPassword });
    },

    changePassword(currentPassword, newPassword) {
        return api.post("/api/auth/change-password",
            { currentPassword, newPassword },
            { withCredentials: true }
        );
    }
}
