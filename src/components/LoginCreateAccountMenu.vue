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
export default {
  name: 'LoginCreateAccountMenu'
}
</script>

<style scoped>
.auth-menu {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: nowrap;
  white-space: nowrap;
}

.auth-menu__link {
  color: var(--primary);
  text-decoration: none;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.2;
  transition:
      color 0.2s ease,
      transform 0.2s ease,
      text-decoration-color 0.2s ease;
}

.auth-menu__link:hover {
  color: var(--text);
  text-decoration: underline;
  text-underline-offset: 0.18em;
  transform: translateY(-1px);
}

.auth-menu__separator {
  color: var(--muted);
  font-size: 0.95rem;
  line-height: 1;
}

@media (min-width: 860px) {
  .auth-menu__link {
    font-size: 1.5rem;
  }
  .auth-menu__separator{
    font-size: 1.5rem;
  }
}
</style>