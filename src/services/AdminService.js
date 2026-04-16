import axios from "axios";

export default {
    getAllUsers() {
        return axios.get('/api/admin/users', { withCredentials: true });
    }
}
