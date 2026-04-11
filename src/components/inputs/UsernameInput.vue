<template>
  <div class="auth-field">
    <div class="auth-field__control">
      <input
          :value="username"
          type="text"
          class="auth-field__input"
          :class="{ 'auth-field__input--invalid': usernameError }"
          placeholder="Username"
          @input="$emit('event-username-updated', $event.target.value)"
      >
      <label class="auth-field__label">Username</label>
    </div>

    <div class="auth-field__error">
      {{ usernameError }}
    </div>
  </div>
</template>

<script>
import "@/assets/css/components/auth-input.css";

export default {
  name: "UsernameInput",
  props: {
    username: String,
    usernameError: {
      type: String,
      default: ""
    }
  }
}
</script>