import axios from "axios";

export default {

    sendPostUserRequest(user) {
        return axios.post('/api/auth/signup', user, {
            withCredentials: true
        })
    },

}
