import api from "./api";

export default {

    sendPostUserRequest(user) {
        return api.post('/api/auth/signup', user, {
            withCredentials: true
        })
    },

}
