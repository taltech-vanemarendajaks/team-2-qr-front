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

      <div v-if="!submitted" class="auth-form">
        <p class="forgot-hint">Enter your email and we'll send you a password reset link.</p>

        <EmailInput
            :email="email"
            :email-error="emailError"
            @event-email-updated="setEmail"/>

        <button @click="processRequest" type="button" class="auth-submit-btn">
          Send reset link
        </button>

        <div class="forgot-back-link">
          <router-link to="/login">Back to login</router-link>
        </div>
      </div>

      <div v-else class="auth-success-state">
        <p class="auth-redirect-note">
          If an account with that email exists, a reset link has been sent. Check your inbox.
        </p>
        <div class="forgot-back-link">
          <router-link to="/login">Back to login</router-link>
        </div>
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
import EmailInput from "@/components/inputs/EmailInput.vue";
import EmailService from "@/services/EmailService";
import PasswordResetService from "@/services/PasswordResetService";
import NavigationService from "@/services/NavigationService";

export default {
  name: 'ForgotPasswordView',
  components: {AlertDanger, AlertSuccess, EmailInput},
  data() {
    return {
      email: '',
      emailError: '',
      alertMessage: '',
      successMessage: '',
      submitted: false,
    }
  },
  methods: {
    setEmail(email) {
      this.email = email
    },
    processRequest() {
      this.emailError = EmailService.validateSignupEmail(this.email)
      if (this.emailError) return

      PasswordResetService.forgotPassword(this.email.trim())
          .then(() => this.handleSuccess())
          .catch(error => this.handleError(error))
    },
    handleSuccess() {
      this.submitted = true
    },
    handleError(error) {
      const status = error?.response?.status
      if (status === 429) {
        this.showAlert('Too many attempts. Please wait before trying again.')
        return
      }
      if (status === 400) {
        this.showAlert(error?.response?.data?.message || 'Please check your input.')
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
