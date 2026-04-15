import {createRouter, createWebHistory} from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from "@/views/LoginView.vue";
import NewAccountView from "@/views/NewAccountView.vue";
import ItemsView from "@/views/ItemsView.vue";
import ErrorView from "@/views/ErrorView.vue";
import ItemView from "@/views/ItemView.vue";
import SessionStorageService from "@/services/SessionStorageService";
import LoginService from "@/services/LoginService";
import NotAuthorizedView from "@/views/NotAuthorizedView.vue";
import ForgotPasswordView from "@/views/ForgotPasswordView.vue";
import ResetPasswordView from "@/views/ResetPasswordView.vue";
import ChangePasswordView from "@/views/ChangePasswordView.vue";

const routes = [
    {
        path: '/',
        name: 'homeRoute',
        component: HomeView
    },
    {
        path: '/login',
        name: 'loginRoute',
        component: LoginView
    },
    {
        path: '/new-account',
        name: 'newAccountRoute',
        component: NewAccountView
    },
    {
        path: '/items',
        name: 'itemsRoute',
        component: ItemsView,
        meta: { requiresAuth: true }
    },
    {
        path: '/item',
        name: 'itemRoute',
        component: ItemView,
        meta: { requiresAuth: true }
    },
    {
        path: '/error',
        name: 'errorRoute',
        component: ErrorView
    },
    {
        path: '/not-authorized',
        name: 'notAuthorizedRoute',
        component: NotAuthorizedView
    },
    {
        path: '/forgot-password',
        name: 'forgotPasswordRoute',
        component: ForgotPasswordView
    },
    {
        path: '/reset-password',
        name: 'resetPasswordRoute',
        component: ResetPasswordView
    },
    {
        path: '/change-password',
        name: 'changePasswordRoute',
        component: ChangePasswordView,
        meta: { requiresAuth: true }
    },
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

router.beforeEach(async (to, from, next) => {
    if (!to.meta.requiresAuth) {
        return next();
    }

    try {
        const needsFreshUserCheck =
            !SessionStorageService.isLoggedIn() || to.meta.requiresAdmin;

        if (needsFreshUserCheck) {
            const response = await LoginService.getCurrentUser();
            const user = response.data;
            SessionStorageService.setLoggedInUser(user);
        }

        if (to.meta.requiresAdmin && !SessionStorageService.isAdmin()) {
            return next({ name: 'notAuthorizedRoute' });
        }

        return next();
    } catch {
        SessionStorageService.clearUserSession();
        return next({ name: 'loginRoute' });
    }
});

export default router
