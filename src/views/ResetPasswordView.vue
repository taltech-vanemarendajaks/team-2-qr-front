<template>
  <section class="auth-page">
    <div class="auth-card">
      <router-link to="/" class="auth-logo-link" aria-label="Go to home page">
        <img src="@/assets/images/logo.webp" alt="Tagly logo" class="auth-logo" />
      </router-link>

      <div class="auth-alert">
        <AlertDanger :alert-message="alertMessage" @event-close="resetAlertMessage"/>
        <AlertSuccess :alert-message="successMessage"/>
      </div>

      <div v-if="invalidLink" class="auth-success-state">
        <p class="auth-redirect-note">
          This reset link is invalid or missing. Please request a new one.
        </p>
        <div class="forgot-back-link">
          <router-link to="/forgot-password">Request a new reset link</router-link>
        </div>
      </div>

      <div v-else-if="!submitted" class="auth-form">
        <p class="forgot-hint">Enter your new password.</p>

        <PasswordInput
            :password="newPassword"
            :password-error="passwordError"
            @event-password-updated="setPassword"/>

        <button @click="processReset" type="button" class="auth-submit-btn">
          Set new password
        </button>
      </div>

      <div v-else class="auth-success-state">
        <p class="auth-redirect-note">Password reset successfully! Redirecting to login...</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.forgot-hint {
  margin: 0;
  font-size: 0.95rem;
  color: var(--muted);
  text-align: center;
}

.forgot-back-link {
  text-align: center;
  font-size: 0.9rem;
}
</style>

<script>
import "@/assets/css/views/auth-view.css";
import AlertDanger from "@/modal/AlertDanger.vue";
import AlertSuccess from "@/modal/AlertSuccess.vue";
import PasswordInput from "@/components/inputs/PasswordInput.vue";
import PasswordService from "@/services/PasswordService";
import PasswordResetService from "@/services/PasswordResetService";
import NavigationService from "@/services/NavigationService";

export default {
  name: 'ResetPasswordView',
  components: {AlertDanger, AlertSuccess, PasswordInput},
  data() {
    return {
      token: '',
      newPassword: '',
      passwordError: '',
      alertMessage: '',
      successMessage: '',
      submitted: false,
      invalidLink: false,
    }
  },
  mounted() {
    const token = this.$route.query.token
    if (!token) {
      this.invalidLink = true
    } else {
      this.token = token
    }
  },
  methods: {
    setPassword(password) {
      this.newPassword = password
    },
    processReset() {
      this.passwordError = PasswordService.validateSignupPassword(this.newPassword)
      if (this.passwordError) return

      PasswordResetService.resetPassword(this.token, this.newPassword)
          .then(() => this.handleSuccess())
          .catch(error => this.handleError(error))
    },
    handleSuccess() {
      this.submitted = true
      setTimeout(NavigationService.navigateToLoginView, 3000)
    },
    handleError(error) {
      const status = error?.response?.status
      const errorCode = error?.response?.data?.errorCode

      if (status === 400 && errorCode === 551) {
        this.showAlert('This reset link is invalid or has already been used. Please request a new one.')
        return
      }
      if (status === 400) {
        this.showAlert(error?.response?.data?.message || 'Please check your input.')
        return
      }
      if (status === 429) {
        this.showAlert('Too many attempts. Please wait before trying again.')
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
  }
}
</script>
