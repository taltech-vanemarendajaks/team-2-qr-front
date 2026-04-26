<template>
  <Modal
      :modal-is-open="deleteItemModalIsOpen"
      variant="confirm"
      @event-close-modal="$emit('event-close-modal')"
  >
    <template #body>
      Are you sure you want to delete this item?
    </template>

    <template #buttons>
      <button
          @click="$emit('event-close-modal')"
          type="button"
          class="modal-button"
      >
        No, keep my item
      </button>

      <button
          @click="confirmDelete"
          type="button"
          class="modal-button modal-button--delete"
      >
        Yes, delete forever
      </button>
    </template>
  </Modal>
</template>

<script>
import Modal from "@/modal/Modal.vue";

export default {
  name: "DeleteItemModal",
  components: { Modal },
  emits: ['event-close-modal', 'event-confirm-delete'],
  props: {
    deleteItemModalIsOpen: Boolean
  },
  methods: {
    confirmDelete() {
      this.$emit("event-confirm-delete");
    }
  }
};
</script>