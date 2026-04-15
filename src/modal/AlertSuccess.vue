<template>
  <div v-if="alertMessage" class="app-alert app-alert--success" role="alert">
    <span class="app-alert__text">
      {{ alertMessage }}
    </span>

    <button
        type="button"
        class="app-alert__close"
        aria-label="Close alert"
        @click="$emit('event-close')"
    >
      ×
    </button>
  </div>
</template>

<script>
export default {
  name: "AlertSuccess",
  props: {
    alertMessage: String
  }
};
</script>