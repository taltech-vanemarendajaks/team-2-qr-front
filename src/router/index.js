import {createRouter, createWebHistory} from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from "@/views/LoginView.vue";
import NewAccountView from "@/views/NewAccountView.vue";
import ItemsView from "@/views/ItemsView.vue";
import ErrorView from "@/views/ErrorView.vue";
import ItemView from "@/views/ItemView.vue";
import SessionStorageService from "@/services/SessionStorageService";
import LoginService from "@/services/LoginService";

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

]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

router.beforeEach(async (to, from, next) => {
    if (!to.meta.requiresAuth) {
        return next();
    }

    if (SessionStorageService.isLoggedIn()) {
        return next();
    }

    try {
        const response = await LoginService.getCurrentUser();
        const user = response.data;

        sessionStorage.setItem('userId', user.userId);
        sessionStorage.setItem('roleName', user.roleName);
        SessionStorageService.setUsername(user.username);

        next();
    } catch {
        sessionStorage.clear();
        next({ name: 'loginRoute' });
    }
});

router.beforeEach(async (to, from, next) => {
    if (!to.meta.requiresAuth) {
        return next();
    }

    try {
        const response = await LoginService.getCurrentUser();
        const user = response.data;

        sessionStorage.setItem('userId', user.userId);
        sessionStorage.setItem('roleName', user.roleName);
        SessionStorageService.setUsername(user.username);

        next();
    } catch {
        sessionStorage.clear();
        next({ name: 'loginRoute' });
    }
});

export default router
