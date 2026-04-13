<template>
  <div class="auth-field">
    <div class="auth-field__control">
      <input
          :value="email"
          type="email"
          class="auth-field__input"
          :class="{ 'auth-field__input--invalid': emailError }"
          placeholder="Email"
          @input="$emit('event-email-updated', $event.target.value)"
      >
      <label class="auth-field__label">Email</label>
    </div>

    <div class="auth-field__error">
      {{ emailError }}
    </div>
  </div>
</template>

<script>
import "@/assets/css/components/auth-input.css";

export default {
  name: "EmailInput",
  props: {
    email: String,
    emailError: {
      type: String,
      default: ""
    }
  }
}
</script>