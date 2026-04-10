<template>

  <div v-if="isLoggedIn" class="header-bar">
    <div class="welcome-text">
      Welcome, {{ this.username }}!
    </div>
    <font-awesome-icon
        @click="startLogOutProcess"
        class="logout-icon cursor-pointer"
        icon="fa-solid fa-arrow-right-from-bracket"
    />
    <LogOutModal
        :log-out-modal-is-open="logOutModalIsOpen"
        @event-close-modal="closeLogOutModal"
        @event-log-out-executed="executeLogOut"
    />
  </div>
  <router-view @event-user-logged-in="updateNavMenu"/>
</template>

<script>
import {defineComponent} from "vue";
import LogOutModal from "@/modal/LogOutModal.vue";
import NavigationService from "@/services/NavigationService";
import SessionStorageService from "@/services/SessionStorageService";
import LoginService from "@/services/LoginService";

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