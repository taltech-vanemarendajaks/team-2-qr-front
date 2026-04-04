const ITEM_MODE_KEY = 'itemMode';
export default {

    isAdmin() {
        return sessionStorage.getItem('roleName') === 'admin'
    },

    getUserId() {
        return Number(sessionStorage.getItem('userId'))
    },

    isLoggedIn() {
        return !!sessionStorage.getItem('userId')
    },

    setUsername(username) {
        sessionStorage.setItem('username', username)
    },

    getUsername() {
        return sessionStorage.getItem('username')
    },
    setItemMode(mode) {
        sessionStorage.setItem(ITEM_MODE_KEY, mode);
    },

    getItemMode() {
        return sessionStorage.getItem(ITEM_MODE_KEY);
    },

    clearItemMode() {
        sessionStorage.removeItem(ITEM_MODE_KEY);
    }
}