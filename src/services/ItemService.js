import axios from "axios";

export default {

    sendPostItemRequest(userId, item) {
        return axios.post('/api/item', item, {
            params: {
                userId: userId
            }
        })
    },

    sendGetItemsRequest(userId) {
        return axios.get('/api/item/all', {
            params: {
                userId: userId
            }
        })
    },

    sendGetItemRequest(itemId) {
        return axios.get('/api/item', {
            params: {
                itemId: itemId
            }
        })
    },
    sendPutItemRequest(itemId, item) {
        return axios.put('/api/item', item, {
            params: {
                itemId: itemId
            }
        })
    },

    sendDeleteItem(itemId) {
        return axios.delete('/api/item', {
            params: {
                itemId: itemId
            }
        })
    },

    sendDeleteItemImageRequest(itemId, imageId) {
        return axios.delete(`/api/item/${itemId}/images/${imageId}`);
    },

}