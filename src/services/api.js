import axios from "axios";

const api = axios.create({ withCredentials: true });

api.interceptors.request.use(config => {
    if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase())) {
        const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('XSRF-TOKEN='))
            ?.split('=')[1];
        if (token) {
            config.headers['X-XSRF-TOKEN'] = decodeURIComponent(token);
        }
    }
    return config;
});

export default api;
