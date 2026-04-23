import api from "./api";

export default {

    sendPostItemRequest(item) {
        return api.post('/api/item', item, {
            withCredentials: true
        })
    },

    sendGetItemsRequest() {
        return api.get('/api/item/all', {
            withCredentials: true
        })
    },

    sendGetItemRequest(itemId) {
        return api.get('/api/item', {
            params: { itemId: itemId },
            withCredentials: true
        })
    },

    sendPutItemRequest(itemId, item) {
        return api.put('/api/item', item, {
            params: { itemId: itemId },
            withCredentials: true
        })
    },

    sendDeleteItem(itemId) {
        return api.delete('/api/item', {
            params: { itemId: itemId },
            withCredentials: true
        })
    },

    sendDeleteItemImageRequest(itemId, imageId) {
        return api.delete(`/api/item/${itemId}/images/${imageId}`, {
            withCredentials: true
        });
    },

}
