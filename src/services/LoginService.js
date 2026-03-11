import axios from "axios";

export default {
    login(email, password) {
        return axios.post("/api/auth/login", {
            email,
            password,
        });
    },
    googleLogin(idToken) {
        return axios.post("/api/auth/google", { idToken });
    }
}
