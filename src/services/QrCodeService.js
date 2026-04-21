import api from "./api";

export default {

    sendGetQrCodeRequest(itemId) {
        return api.get('/api/qr-code', {
            params: { itemId: itemId },
            withCredentials: true
        })
    },
}
