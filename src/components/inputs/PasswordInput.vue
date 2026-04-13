<template>
  <div class="auth-field">
    <div class="auth-field__control">
      <input
          :value="password"
          :type="showPassword ? 'text' : 'password'"
          class="auth-field__input auth-field__input--with-toggle"
          :class="{ 'auth-field__input--invalid': passwordError }"
          placeholder="Password"
          @input="$emit('event-password-updated', $event.target.value)"
      >

      <label class="auth-field__label">Password</label>

      <button
          type="button"
          class="auth-field__toggle"
          @click="togglePassword"
          :aria-label="showPassword ? 'Hide password' : 'Show password'"
      >
        <font-awesome-icon
            :icon="showPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"
        />
      </button>
    </div>

    <div class="auth-field__error">
      {{ passwordError }}
    </div>
  </div>
</template>

<script>
import "@/assets/css/components/auth-input.css";

export default {
  name: "PasswordInput",
  props: {
    password: String,
    passwordError: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      showPassword: false
    }
  },
  methods: {
    togglePassword() {
      this.showPassword = !this.showPassword
    }
  }
}
</script>