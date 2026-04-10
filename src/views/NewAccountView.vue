<template>
  <div class="container text-center">
    <div>
      <h1>MyStuffLabelled</h1>
    </div>
    <div class="row justify-content-center mb-3">
      <div class="col col-6">
        <AlertSuccess :alert-message="alertSuccessMessage"/>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <LoginCreateAccountMenu/>
      </div>
    </div>
    <div v-if="displayAddUserForm" class="row justify-content-center">
      <div class="col col-4">
        <UsernameInput :username="user.username" :username-error="usernameError"
                       @event-username-updated="setUserUsername"/>
        <PasswordInput :password="user.password" :password-error="passwordError"
                       @event-password-updated="setUserPassword"/>
        <EmailInput :email="user.email" :email-error="emailError"
                      @event-email-updated = "setUserEmail"/>
        <div class="form-floating">
          <button @click="addNewUser" type="button" class="btn btn-custom btn-large">Sign up!</button>
        </div>
        <GoogleSignInButton
            @success="handleGoogleLoginResponse"
            @error="handleGoogleLoginError"
        />
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
import AlertSuccess from "@/modal/AlertSuccess.vue";
import LoginCreateAccountMenu from "@/components/LoginCreateAccountMenu.vue";
import UserService from "@/services/UserService";
import NavigationService from "@/services/NavigationService";
import UsernameInput from "@/components/inputs/UsernameInput.vue";
import PasswordInput from "@/components/inputs/PasswordInput.vue";
import EmailInput from "@/components/inputs/EmailInput.vue";
import UsernameService from "@/services/UsernameService";
import PasswordService from "@/services/PasswordService";
import EmailService from "@/services/EmailService";
import GoogleSignInButton from "@/components/GoogleSignInButton.vue";
import SessionStorageService from "@/services/SessionStorageService";

export default {
  name: 'NewAccountView',
  components: {EmailInput, PasswordInput, UsernameInput, LoginCreateAccountMenu, AlertSuccess, GoogleSignInButton},
  data() {
    return {
      alertSuccessMessage: '',
      displayAddUserForm: true,

      usernameError: '',
      passwordError: '',
      emailError: '',

      user: {
        username: '',
        password: '',
        email: ''
      },

      errorResponse: {
        message: '',
        errorCode: 0
      },

      loginResponse: {
        userId: 0,
        roleName: '',
        username: ''
      },
    }
  },
  methods: {

    addNewUser() {
      this.resetValidationErrors()
      this.validateFromInput()
      if (!this.formInputIsCorrect()) return

      const payload = {
        username: this.user.username.trim(),
        password: this.user.password,
        email: this.user.email.trim()
      }

      UserService.sendPostUserRequest(payload)
          .then(() => this.handleAddNewUserResponse(payload.username))
          .catch(error => this.handleAddNewUserError(error))
    },

    handleAddNewUserResponse(trimmedUsername) {
      this.hideAddUserForm()
      this.alertSuccessMessage = 'New user "' + trimmedUsername + '" added! You can now login'
      setTimeout(NavigationService.navigateToLoginView, 8000)
    },

    hideAddUserForm() {
      this.displayAddUserForm = false
    },

    validateFromInput() {
      this.usernameError = UsernameService.validateSignupUsername(this.user.username)
      this.passwordError = PasswordService.validateSignupPassword(this.user.password)
      this.emailError = EmailService.validateSignupEmail(this.user.email)
    },

    formInputIsCorrect() {
      return this.usernameError === '' && this.passwordError === '' && this.emailError === ''
    },

    handleAddNewUserError(error) {

      const status = error?.response?.status
      this.errorResponse = error?.response?.data || {message: 'Unknown error', errorCode: 0}

      if (status === 403 && this.errorResponse.errorCode === 222) {
        this.usernameError = this.errorResponse.message
        return
      }
      if (status === 403 && this.errorResponse.errorCode === 223) {
        this.emailError = this.errorResponse.message
        return
      }
      if (status === 400) {
        const msg = this.errorResponse.message || 'Please check your input'
        if (msg.toLowerCase().includes('username')) this.usernameError = msg
        else if (msg.toLowerCase().includes('password')) this.passwordError = msg
        else if (msg.toLowerCase().includes('email')) this.emailError = msg
        else this.emailError = msg
        return
      }
      NavigationService.navigateToErrorView()
    },

    handleGoogleLoginResponse(response) {
      this.resetValidationErrors()
      this.loginResponse = response.data
      SessionStorageService.setLoggedInUser(this.loginResponse)
      this.updateNavMenuUserIsLoggedIn()
      NavigationService.navigateToItemsView()
    },

    updateNavMenuUserIsLoggedIn() {
      this.$emit('event-user-logged-in')
    },

    handleGoogleLoginError(error) {
      this.resetValidationErrors()
      const status = error?.response?.status
      this.errorResponse = error?.response?.data || { message: 'Unknown error', errorCode: 0 }

      if (status === 403 || status === 400) {
        this.emailError = this.errorResponse.message || 'Google sign-in failed'
        return
      }

      NavigationService.navigateToErrorView()
    },

    resetValidationErrors() {
      this.usernameError = ''
      this.passwordError = ''
      this.emailError = ''
    },
    setUserUsername(username) {
      this.user.username = username
    },
    setUserPassword(password) {
      this.user.password = password
    },
    setUserEmail(email) {
      this.user.email = email
    }
  },
}
</script>