<template>
  <teleport to="body">
    <div
        v-if="modalIsOpen"
        class="app-modal-overlay"
        @click="handleBackdropClick"
    >
      <div
          class="app-modal"
          :class="[
          variantClass,
          { 'app-modal--with-title': hasTitle }
        ]"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="hasTitle ? titleId : undefined"
          @click.stop
      >
        <div v-if="hasTitle || showCloseButton" class="app-modal__header">
          <h2 v-if="hasTitle" :id="titleId" class="app-modal__title">
            <slot name="title"></slot>
          </h2>

          <button
              v-if="showCloseButton"
              type="button"
              class="app-modal__close"
              aria-label="Close modal"
              @click="$emit('event-close-modal')"
          >
            ×
          </button>
        </div>

        <div class="app-modal__body">
          <slot name="body"></slot>
        </div>

        <div v-if="hasButtons" class="app-modal__actions">
          <slot name="buttons"></slot>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script>
export default {
  name: "Modal",
  props: {
    modalIsOpen: Boolean,
    variant: {
      type: String,
      default: "confirm",
      validator(value) {
        return ["confirm", "preview"].includes(value);
      }
    },
    showCloseButton: {
      type: Boolean,
      default: true
    }
  },
  emits: ["event-close-modal"],
  data() {
    return {
      titleId: `modal-title-${Math.random().toString(36).slice(2, 10)}`
    };
  },
  computed: {
    variantClass() {
      return this.variant === "preview"
          ? "app-modal--preview"
          : "app-modal--confirm";
    },
    hasTitle() {
      return !!this.$slots.title;
    },
    hasButtons() {
      return !!this.$slots.buttons;
    }
  },
  watch: {
    modalIsOpen(isOpen) {
      if (isOpen) {
        this.lockBodyScroll();
        document.addEventListener("keydown", this.handleKeydown);
      } else {
        this.unlockBodyScroll();
        document.removeEventListener("keydown", this.handleKeydown);
      }
    }
  },
  mounted() {
    if (this.modalIsOpen) {
      this.lockBodyScroll();
      document.addEventListener("keydown", this.handleKeydown);
    }
  },
  beforeUnmount() {
    this.unlockBodyScroll();
    document.removeEventListener("keydown", this.handleKeydown);
  },
  methods: {
    handleBackdropClick() {
      this.$emit("event-close-modal");
    },
    handleKeydown(event) {
      if (event.key === "Escape") {
        this.$emit("event-close-modal");
      }
    },
    lockBodyScroll() {
      document.body.style.overflow = "hidden";
    },
    unlockBodyScroll() {
      document.body.style.overflow = "";
    }
  }
};
</script>

