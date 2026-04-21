import api from "./api";

export default {
    getAllUsers() {
        return api.get('/api/admin/users', { withCredentials: true });
    }
}
