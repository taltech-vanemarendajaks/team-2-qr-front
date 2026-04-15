<template>
  <div v-if="alertMessage" class="app-alert app-alert--danger" role="alert">
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
  name: "AlertDanger",
  props: {
    alertMessage: String
  }
};
</script>