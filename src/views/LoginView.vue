<template>
  <div class="container text-center">
    <div>
      <h1>MyStuffLabelled</h1>
    </div>
    <div class="row justify-content-center mb-3">
      <div class="col col-6">
        <AlertDanger :alert-message="alertMessage" @event-alert-box-closed="resetAlertMessage"/>
      </div>
    </div>
    <div class="container text-center">
      <div class="row">
        <div>
          <LoginCreateAccountMenu/>
        </div>
      </div>
    </div>
    <div class="container text-center">
      <div class="row justify-content-center">
        <div class="col-10 col-md-6 col-lg-4">
          <EmailInput
              :email="email"
              :email-error="emailError"
              @event-email-updated="setEmail"/>

          <PasswordInput
              :password="password"
              :password-error="passwordError"
              @event-password-updated="setPassword"
          />

          <div class="form-floating">
            <button @click="processLogin"
                    type="button"
                    class="btn btn-custom btn-large"
                    :disabled="cooldownRemaining > 0"
            >
              <span v-if="cooldownRemaining === 0">Go!</span>
              <span v-else>Try again in {{ cooldownRemaining }}s</span>
            </button>
          </div>

          <div class="mt-3 text-muted small">— or —</div>
          <div id="google-signin-button" class="mt-2 d-flex justify-content-center"></div>
        </div>
      </div>
    </div>
    <div v-if="showSupportVerify" class="row justify-content-center mt-4 mb-5">
      <div class="col-10 col-md-8 col-lg-6 text-start">
        <div class="alert alert-info">
          Too many failed login attempts ({{ failedLoginCount }}).
          To contact the admin, please verify ownership with your email and a QR token.
        </div>
        <SupportUnlockAndRequest :email="email.trim()"/>
      </div>
    </div>

  </div>
</template>

<style scoped>
h1 {
  margin-top: 30px; /* to push the h1 lower */
  margin-bottom: 40px; /*to push the next block lower*/
}
</style>

<script>
import LoginService from "@/services/LoginService";
import AlertDanger from "@/modal/AlertDanger.vue";
import NavigationService from "@/services/NavigationService";
import SessionStorageService from "@/services/SessionStorageService";
import LoginCreateAccountMenu from "@/components/LoginCreateAccountMenu.vue";
import EmailInput from "@/components/inputs/EmailInput.vue";
import PasswordInput from "@/components/inputs/PasswordInput.vue";
import EmailService from "@/services/EmailService";
import PasswordService from "@/services/PasswordService";
import SupportUnlockAndRequest from "@/components/SupportUnlockAndRequest.vue";

export default {
  name: 'LoginView',
  components: {PasswordInput, EmailInput, LoginCreateAccountMenu, AlertDanger, SupportUnlockAndRequest},
  data() {
    return {
      email: '',
      password: '',
      alertMessage: '',
      emailError: '',
      passwordError: '',

      loginResponse: {
        userId: 0,
        roleName: '',
        username: ''
      },

      errorResponse: {
        message: '',
        errorCode: 0
      },

      failedLoginCount: 0,
      showSupportVerify: false,
      cooldownSeconds: 30,
      cooldownRemaining: 0,
      cooldownTimer: null,
    }
  },
  methods: {
    setEmail(email) {
      this.email = email
      this.loadFailCount()
      this.loadCooldown()
    },
    setPassword(password) {
      this.password = password
    },
    processLogin() {
      this.resetValidationErrors()
      this.emailError = EmailService.validateSignupEmail(this.email)
      this.passwordError = PasswordService.validateLoginPassword(this.password)

      if (this.emailError || this.passwordError) return
      this.executeLogin()
    },
    resetValidationErrors() {
      this.emailError = ''
      this.passwordError = ''
    },
    executeLogin() {
      const trimmedEmail = this.email.trim()
      LoginService.login(trimmedEmail, this.password)
          .then(response => this.handleLoginResponse(response, trimmedEmail))
          .catch(error => this.handleLoginError(error))
    },
    handleLoginResponse(response, trimmedEmail) {
      this.resetFailCount()
      this.loginResponse = response.data
      this.setSessionStorageItems(trimmedEmail)
      this.updateNavMenuUserIsLoggedIn()
      NavigationService.navigateToItemsView()
    },
    setSessionStorageItems(trimmedEmail) {
      sessionStorage.setItem('userId', this.loginResponse.userId)
      sessionStorage.setItem('roleName', this.loginResponse.roleName)
      SessionStorageService.setUsername(this.loginResponse.username)
    },
    updateNavMenuUserIsLoggedIn() {
      this.$emit('event-user-logged-in')
    },
    handleLoginError(error) {
      const status = error?.response?.status
      this.errorResponse = error?.response?.data || {message: 'Unknown error', errorCode: 0}
      if (status === 403 && this.errorResponse.errorCode === 111) {
        this.password = ''
        this.incrementFailCount()
        this.showAlert(this.errorResponse.message)
        return
      }
      if (status === 400) {
        this.showAlert(this.errorResponse.message || 'Please check your input')
        return
      }
      NavigationService.navigateToErrorView()
    },
    showAlert(message) {
      this.alertMessage = message
      setTimeout(this.resetAlertMessage, 4000)
    },
    resetAlertMessage() {
      this.alertMessage = ''
    },
    getFailKey() {
      const u = (this.email || '').trim().toLowerCase()
      return u ? `loginFailCount:${u}` : 'loginFailCount'
    },
    loadFailCount() {
      const raw = localStorage.getItem(this.getFailKey())
      this.failedLoginCount = Number(raw || 0)
      this.showSupportVerify = this.failedLoginCount >= 3
    },
    incrementFailCount() {
      const next = this.failedLoginCount + 1
      this.failedLoginCount = next
      localStorage.setItem(this.getFailKey(), String(next))
      this.showSupportVerify = next >= 3
      if (next === 3) {
        this.startCooldown()
      }
    },
    resetFailCount() {
      this.failedLoginCount = 0
      localStorage.removeItem(this.getFailKey())
      this.showSupportVerify = false
      this.cooldownRemaining = 0
      if (this.cooldownTimer) {
        clearInterval(this.cooldownTimer)
        this.cooldownTimer = null
      }
      localStorage.removeItem(this.getCooldownKey())
    },

    getCooldownKey() {
      const u = (this.email || '').trim().toLowerCase()
      return u ? `loginCooldownUntil:${u}` : 'loginCooldownUntil'
    },

    startCooldown() {
      const until = Date.now() + this.cooldownSeconds * 1000
      localStorage.setItem(this.getCooldownKey(), String(until))
      this.startCooldownTimer(until)
    },

    loadCooldown() {
      const untilRaw = localStorage.getItem(this.getCooldownKey())
      if (!untilRaw) return

      const until = Number(untilRaw)
      if (Date.now() >= until) {
        localStorage.removeItem(this.getCooldownKey())
        return
      }

      this.startCooldownTimer(until)
    },

    handleGoogleCredential(response) {
      LoginService.googleLogin(response.credential)
        .then(res => this.handleLoginResponse(res, ''))
        .catch(err => this.handleLoginError(err))
    },

    startCooldownTimer(until) {
      if (this.cooldownTimer) clearInterval(this.cooldownTimer)

      this.cooldownRemaining = Math.ceil((until - Date.now()) / 1000)

      this.cooldownTimer = setInterval(() => {
        const remaining = Math.ceil((until - Date.now()) / 1000)

        if (remaining <= 0) {
          clearInterval(this.cooldownTimer)
          this.cooldownTimer = null
          this.cooldownRemaining = 0
          localStorage.removeItem(this.getCooldownKey())
          return
        }

        this.cooldownRemaining = remaining
      }, 1000)
    },

  },
  mounted() {
    this.loadFailCount()
    this.loadCooldown()
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: '243775297136-iqgo5kt2fk9sftst4g424squijhp4koc.apps.googleusercontent.com',
        callback: this.handleGoogleCredential,
      })
      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        { theme: 'outline', size: 'large', width: 280 }
      )
    }
  },

}
</script>
