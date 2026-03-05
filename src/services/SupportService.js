import axios from "axios";

export default {
    verifyQr(username, email, qrToken) {
        return axios.post("/api/support/verify-qr", {
            username,
            email,
            qrToken
        });
    },

    createSupportRequest(supportToken, message) {
        return axios.post("/api/support/request", {
            supportToken,
            message
        });
    }
};