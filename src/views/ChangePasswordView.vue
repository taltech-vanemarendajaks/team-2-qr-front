<template>
  <section class="change-password-page">
    <div class="change-password-card">
      <div class="auth-alert">
        <AlertDanger :alert-message="alertMessage" @event-close="resetAlertMessage"/>
        <AlertSuccess :alert-message="successMessage" @event-close="resetSuccessMessage"/>
      </div>

      <div class="auth-form">
        <h2 class="change-password-title">Change Password</h2>

        <p class="change-password-rules">
          New password must be at least 8 characters and contain one letter and one number.
        </p>

        <div class="change-password-field-group">
          <label class="change-password-field-label">Current Password*</label>
          <PasswordInput
              :password="currentPassword"
              :password-error="currentPasswordError"
              @event-password-updated="setCurrentPassword"/>
        </div>

        <div class="change-password-field-group">
          <label class="change-password-field-label">New Password*</label>
          <PasswordInput
              :password="newPassword"
              :password-error="newPasswordError"
              @event-password-updated="setNewPassword"/>
        </div>

        <div class="change-password-field-group">
          <label class="change-password-field-label">Confirm New Password*</label>
          <PasswordInput
              :password="confirmPassword"
              :password-error="confirmPasswordError"
              @event-password-updated="setConfirmPassword"/>
        </div>

        <button @click="processChange" type="button" class="auth-submit-btn">
          Save New Password
        </button>

        <div class="change-password-back-link">
          <button type="button" class="modal-button" @click="$router.push('/items')"><font-awesome-icon icon="chevron-left" /> Back to Items</button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.change-password-page {
  flex: 1;
  background-color: var(--bg);
  padding: 1.5rem 1rem;
}

.change-password-card {
  width: min(100%, 26rem);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.change-password-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text, #1a1a1a);
  text-align: center;
}

.change-password-rules {
  margin: 0;
  font-size: 0.85rem;
  color: var(--muted);
  text-align: center;
  line-height: 1.5;
}

.change-password-field-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.change-password-field-label {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--muted);
}

.change-password-back-link {
  text-align: center;
  font-size: 0.9rem;
}
</style>

<script>
import AlertDanger from "@/modal/AlertDanger.vue";
import AlertSuccess from "@/modal/AlertSuccess.vue";
import PasswordInput from "@/components/inputs/PasswordInput.vue";
import PasswordService from "@/services/PasswordService";
import PasswordResetService from "@/services/PasswordResetService";
import NavigationService from "@/services/NavigationService";

export default {
  name: 'ChangePasswordView',
  components: {AlertDanger, AlertSuccess, PasswordInput},
  data() {
    return {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      currentPasswordError: '',
      newPasswordError: '',
      confirmPasswordError: '',
      alertMessage: '',
      successMessage: '',
    }
  },
  methods: {
    setCurrentPassword(password) {
      this.currentPassword = password
    },
    setNewPassword(password) {
      this.newPassword = password
    },
    setConfirmPassword(password) {
      this.confirmPassword = password
    },
    processChange() {
      this.clearErrors()

      if (!this.currentPassword) {
        this.currentPasswordError = 'Please enter your current password.'
        return
      }

      this.newPasswordError = PasswordService.validateSignupPassword(this.newPassword)
      if (this.newPasswordError) return

      if (this.newPassword !== this.confirmPassword) {
        this.confirmPasswordError = 'Passwords do not match.'
        return
      }

      PasswordResetService.changePassword(this.currentPassword, this.newPassword)
          .then(() => this.handleSuccess())
          .catch(error => this.handleError(error))
    },
    handleSuccess() {
      this.currentPassword = ''
      this.newPassword = ''
      this.confirmPassword = ''
      this.successMessage = 'Password changed successfully.'
    },
    handleError(error) {
      const status = error?.response?.status
      const errorCode = error?.response?.data?.errorCode

      if (status === 400 && errorCode === 552) {
        this.showAlert('Current password is incorrect. Please try again.')
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
    resetSuccessMessage() {
      this.successMessage = ''
    },
    clearErrors() {
      this.currentPasswordError = ''
      this.newPasswordError = ''
      this.confirmPasswordError = ''
      this.alertMessage = ''
      this.successMessage = ''
    },
  }
}
</script>
