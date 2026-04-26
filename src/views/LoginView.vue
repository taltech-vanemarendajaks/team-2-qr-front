<template>
  <section class="auth-page">
    <div class="auth-card">
      <router-link to="/" class="auth-logo-link" aria-label="Go to home page">
        <img src="@/assets/images/logo.webp" alt="Tagly logo" class="auth-logo" />
      </router-link>

      <div class="auth-alert">
        <AlertDanger
            :alert-message="alertMessage"
            @event-close="resetAlertMessage"
        />
      </div>

      <div class="auth-switch">
        <LoginCreateAccountMenu />
      </div>

      <div class="auth-form">
        <EmailInput
            :email="email"
            :email-error="emailError"
            @event-email-updated="setEmail"
        />

        <PasswordInput
            :password="password"
            :password-error="passwordError"
            @event-password-updated="setPassword"
        />

        <div class="login-forgot-link">
          <router-link to="/forgot-password">Forgot password?</router-link>
        </div>

        <button
            @click="processLogin"
            type="button"
            class="auth-submit-btn"
        >
          Log in
        </button>

        <GoogleSignInButton
            @success="handleGoogleLoginResponse"
            @error="handleGoogleLoginError"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.login-forgot-link {
  text-align: right;
  font-size: 0.9rem;
  margin-top: -0.25rem;
}
</style>

<script>
import "@/assets/css/views/auth-view.css";
import LoginService from "@/services/LoginService";
import AlertDanger from "@/modal/AlertDanger.vue";
import NavigationService from "@/services/NavigationService";
import SessionStorageService from "@/services/SessionStorageService";
import LoginCreateAccountMenu from "@/components/LoginCreateAccountMenu.vue";
import EmailInput from "@/components/inputs/EmailInput.vue";
import PasswordInput from "@/components/inputs/PasswordInput.vue";
import EmailService from "@/services/EmailService";
import PasswordService from "@/services/PasswordService";
import GoogleSignInButton from "@/components/GoogleSignInButton.vue";

export default {
  name: 'LoginView',
  components: {
    PasswordInput,
    EmailInput,
    LoginCreateAccountMenu,
    AlertDanger,
    GoogleSignInButton
  },
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
    }
  },
  methods: {
    setEmail(email) {
      this.email = email
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
          .then(response => this.handleLoginResponse(response))
          .catch(error => this.handleLoginError(error))
    },

    handleLoginResponse(response) {
      this.loginResponse = response.data
      SessionStorageService.setLoggedInUser(this.loginResponse)
      this.updateNavMenuUserIsLoggedIn()
      const redirect = this.$route.query.redirect
      if (redirect && redirect.startsWith('/')) {
        NavigationService.navigateTo(redirect)
      } else {
        NavigationService.navigateToItemsView()
      }
    },

    updateNavMenuUserIsLoggedIn() {
      this.$emit('event-user-logged-in')
    },

    handleLoginError(error) {
      const status = error?.response?.status
      this.errorResponse = error?.response?.data || { message: 'Unknown error', errorCode: 0 }
      if (status === 403 && this.errorResponse.errorCode === 111) {
        this.password = ''
        this.showAlert('Incorrect email or password.')
        return
      }
      if (status === 429) {
        this.password = ''
        this.showAlert(
            'Too many attempts. Please try again in a moment. You can also reset your password using the "Forgot password?" link.'
        )
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
    },

    resetAlertMessage() {
      this.alertMessage = ''
    },

    handleGoogleLoginResponse(response) {
      this.handleLoginResponse(response)
    },

    handleGoogleLoginError(error) {
      this.handleLoginError(error)
    },
  },
}
</script>
