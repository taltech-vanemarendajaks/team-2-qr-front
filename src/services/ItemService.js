import axios from "axios";

export default {

    sendPostItemRequest(item) {
        return axios.post('/api/item', item, {
            withCredentials: true
        })
    },

    sendGetItemsRequest() {
        return axios.get('/api/item/all', {
            withCredentials: true
        })
    },

    sendGetItemRequest(itemId) {
        return axios.get('/api/item', {
            params: { itemId: itemId },
            withCredentials: true
        })
    },

    sendPutItemRequest(itemId, item) {
        return axios.put('/api/item', item, {
            params: { itemId: itemId },
            withCredentials: true
        })
    },

    sendDeleteItem(itemId) {
        return axios.delete('/api/item', {
            params: { itemId: itemId },
            withCredentials: true
        })
    },

    sendDeleteItemImageRequest(itemId, imageId) {
        return axios.delete(`/api/item/${itemId}/images/${imageId}`, {
            withCredentials: true
        });
    },

}
