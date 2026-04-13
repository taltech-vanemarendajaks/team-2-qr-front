<template>
  <div v-if="isLoggedIn" class="app-header">
    <div class="app-header-row">

      <div class="app-header-logo-wrap">
        <img
            src="@/assets/images/logo.webp"
            alt="Tagly logo"
            class="app-header-logo"
        />
      </div>

      <div class="app-header-welcome">
        Welcome, <span class="username">{{ username }}</span>!
      </div>

      <button
          type="button"
          class="app-header-logout"
          @click="startLogOutProcess"
          aria-label="Log out"
      >
        <font-awesome-icon
            class="logout-icon"
            icon="fa-solid fa-arrow-right-from-bracket"
        />
      </button>

    </div>

    <LogOutModal
        :log-out-modal-is-open="logOutModalIsOpen"
        @event-close-modal="closeLogOutModal"
        @event-log-out-executed="executeLogOut"
    />
  </div>

  <router-view @event-user-logged-in="updateNavMenu" />
</template>

<script>
import {defineComponent} from "vue";
import LogOutModal from "@/modal/LogOutModal.vue";
import NavigationService from "@/services/NavigationService";
import SessionStorageService from "@/services/SessionStorageService";
import LoginService from "@/services/LoginService";

import "@/assets/css/components/header.css";

export default defineComponent({
  name: 'App',
  components: {LogOutModal},
  data() {
    return {
      isLoggedIn: false,
      isAdmin: false,
      username: '',
      logOutModalIsOpen: false
    }
  },
  methods: {
    startLogOutProcess() {
      this.openLogOutModal()
    },

    openLogOutModal() {
      this.logOutModalIsOpen = true
    },

    closeLogOutModal() {
      this.logOutModalIsOpen = false
    },

    executeLogOut() {
      this.closeLogOutModal()
      LoginService.logout()
          .finally(() => {
            sessionStorage.clear()
            this.updateNavMenu()
            NavigationService.navigateToHomeView()
          })
    },

    restoreSession() {
      LoginService.getCurrentUser()
          .then(response => {
            const user = response.data
            sessionStorage.setItem('userId', user.userId)
            sessionStorage.setItem('roleName', user.roleName)
            SessionStorageService.setUsername(user.username)
            this.updateNavMenu()
          })
          .catch(() => {
            sessionStorage.clear()
            this.updateNavMenu()
          })
    },

    updateNavMenu() {
      this.isLoggedIn = SessionStorageService.isLoggedIn()
      this.isAdmin = SessionStorageService.isAdmin()
      this.username = SessionStorageService.getUsername()
    },

  },
  beforeMount() {
    this.restoreSession()
  }
})
</script>