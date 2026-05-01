<template>
  <div v-if="isLoggedIn" class="app-header">
    <div class="app-header-row">

      <div class="app-header-logo-wrap">
        <router-link to="/items" aria-label="Go to items">
          <img
              src="@/assets/images/logo.webp"
              alt="Tagly logo"
              class="app-header-logo"
          />
        </router-link>
      </div>

      <div class="app-header-welcome">
        Welcome, <span class="username">{{ username }}</span>!
      </div>

      <div class="app-header-actions">
        <div class="settings-menu-wrap" v-click-outside="closeSettingsMenu">
          <button
              type="button"
              class="app-header-settings"
              @click="toggleSettingsMenu"
              aria-label="Settings"
              :aria-expanded="settingsMenuOpen"
          >
            <font-awesome-icon
                class="settings-icon"
                :class="{ 'settings-icon--open': settingsMenuOpen }"
                icon="fa-solid fa-gear"
            />
          </button>
          <div v-if="settingsMenuOpen" class="settings-dropdown">
            <button type="button" class="settings-dropdown-item" @click="goToChangePassword">
              Change password
            </button>
            <button v-if="isAdmin" type="button" class="settings-dropdown-item" @click="goToAdminPanel">
              Admin panel
            </button>
          </div>
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

    </div>

    <LogOutModal
        :log-out-modal-is-open="logOutModalIsOpen"
        @event-close-modal="closeLogOutModal"
        @event-log-out-executed="executeLogOut"
    />
  </div>

  <div class="app-content">
    <router-view @event-user-logged-in="updateNavMenu" />
  </div>
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
  directives: {
    clickOutside: {
      beforeMount(el, binding) {
        el._clickOutsideHandler = (event) => {
          if (!el.contains(event.target)) {
            binding.value()
          }
        }
        document.addEventListener('click', el._clickOutsideHandler)
      },
      unmounted(el) {
        document.removeEventListener('click', el._clickOutsideHandler)
      }
    }
  },
  data() {
    return {
      isLoggedIn: false,
      isAdmin: false,
      username: '',
      logOutModalIsOpen: false,
      settingsMenuOpen: false
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
            if (!user) {
              sessionStorage.clear()
              this.updateNavMenu()
              return
            }
            sessionStorage.setItem('userId', user.userId)
            sessionStorage.setItem('roleName', user.roleName)
            SessionStorageService.setUsername(user.username)
            this.updateNavMenu()
            if (this.$route.meta.requiresGuest) {
              this.$router.push({ name: 'itemsRoute' })
            }
          })
          .catch(() => {
            sessionStorage.clear()
            this.updateNavMenu()
          })
    },

    toggleSettingsMenu() {
      this.settingsMenuOpen = !this.settingsMenuOpen
    },

    closeSettingsMenu() {
      this.settingsMenuOpen = false
    },

    goToChangePassword() {
      this.closeSettingsMenu()
      NavigationService.navigateToChangePasswordView()
    },

    goToAdminPanel() {
      this.closeSettingsMenu()
      NavigationService.navigateToAdminView()
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