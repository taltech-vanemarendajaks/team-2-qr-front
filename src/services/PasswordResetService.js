import axios from "axios";

export default {
    forgotPassword(email) {
        return axios.post("/api/auth/forgot-password", { email });
    },

    resetPassword(token, newPassword) {
        return axios.post("/api/auth/reset-password", { token, newPassword });
    },

    changePassword(currentPassword, newPassword) {
        return axios.post("/api/auth/change-password",
            { currentPassword, newPassword },
            { withCredentials: true }
        );
    }
}
