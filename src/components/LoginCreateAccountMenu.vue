<template>
  <nav class="auth-menu" aria-label="Authentication">
    <router-link class="auth-menu__link" to="/login">
      Log in
    </router-link>

    <span class="auth-menu__separator" aria-hidden="true">|</span>

    <router-link class="auth-menu__link" to="/new-account">
      Create account
    </router-link>
  </nav>
</template>

<script>
import "@/assets/css/components/auth-menu.css";
export default {
  name: 'LoginCreateAccountMenu'
}
</script>

