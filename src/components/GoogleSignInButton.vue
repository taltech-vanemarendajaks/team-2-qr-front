<template>
  <div class="google-signin">
    <div class="google-signin__divider">— or —</div>
    <div ref="googleButtonRef" class="google-signin__button"></div>
  </div>
</template>

<script>
import LoginService from "@/services/LoginService";

const GOOGLE_CLIENT_ID = '243775297136-iqgo5kt2fk9sftst4g424squijhp4koc.apps.googleusercontent.com';

export default {
  name: 'GoogleSignInButton',
  emits: ['success', 'error'],

  methods: {
    handleGoogleCredential(response) {
      LoginService.googleLogin(response.credential)
          .then(res => this.$emit('success', res))
          .catch(err => this.$emit('error', err))
    },

    renderGoogleButton() {
      if (!window.google || !this.$refs.googleButtonRef) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: this.handleGoogleCredential,
      });

      this.$refs.googleButtonRef.innerHTML = '';

      window.google.accounts.id.renderButton(
          this.$refs.googleButtonRef,
          {
            theme: 'outline',
            size: 'large',
            width: 280
          }
      );
    }
  },

  mounted() {
    this.renderGoogleButton();
  }
}
</script>