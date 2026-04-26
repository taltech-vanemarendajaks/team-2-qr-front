import router from "@/router";
import SessionStorageService from "@/services/SessionStorageService";

function safePush(route) {
    router.push(route).catch(() => {});
}

export default {
    navigateToLoginView() {
        safePush({name: 'loginRoute'})
    },
    navigateToForgotPasswordView() {
        safePush({name: 'forgotPasswordRoute'})
    },
    navigateToChangePasswordView() {
        safePush({name: 'changePasswordRoute'})
    },
    navigateToItemsView() {
        safePush({name: 'itemsRoute'})
    },
    navigateToErrorView() {
        safePush({name: 'errorRoute'})
    },
    navigateToHomeView() {
        safePush({name: 'homeRoute'})
    },
    navigateToEditItem(itemId) {
        SessionStorageService.setItemMode('edit');
        safePush({
            name: 'itemRoute',
            query: {itemId: itemId}
        });

    },
    navigateToAddItem() {
        SessionStorageService.clearItemMode();
        safePush({name: 'itemRoute'});
    },

    navigateToItemView(itemId) {
        SessionStorageService.clearItemMode();
        safePush({
            name: 'itemRoute',
            query: {
                itemId: itemId
            }
        })
    },
    navigateTo(path) {
        safePush(path);
    },
    navigateToDeleteItemModal(itemId) {
        SessionStorageService.setItemMode('delete');
        safePush({
            name: 'itemRoute',
            query: {itemId}
        });
    },

}