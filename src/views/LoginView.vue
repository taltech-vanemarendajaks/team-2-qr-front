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
            >
              Go!
            </button>
          </div>

          <GoogleSignInButton
              @success="handleGoogleLoginResponse"
              @error="handleGoogleLoginError"
          />

        </div>
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
      NavigationService.navigateToItemsView()
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
            'Too many attempts. Please try again in a moment. If you’re having trouble remembering your password, password reset via email will be available soon.'
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
