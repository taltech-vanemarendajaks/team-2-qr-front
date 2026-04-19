import axios from "axios";

export default {

    sendGetQrCodeRequest(itemId) {
        return axios.get('/api/qr-code', {
            params: { itemId: itemId },
            withCredentials: true
        })
    },
}
