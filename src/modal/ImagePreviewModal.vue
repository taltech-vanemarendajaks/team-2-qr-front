<template>
  <Modal
      :modal-is-open="imagePreviewModalIsOpen"
      variant="preview"
      @event-close-modal="$emit('event-close-modal')"
  >
    <template #body>
      <div class="image-preview-modal__content">
        <img
            :src="imageData"
            alt="Receipt preview"
            class="image-preview-modal__image"
        />
      </div>
    </template>

    <template #buttons>
      <button
          type="button"
          class="modal-button"
          @click="$emit('event-close-modal')"
      >
        Close
      </button>

      <button
          type="button"
          class="modal-button"
          @click="downloadImage"
      >
        Save image
      </button>
    </template>
  </Modal>
</template>

<script>
import Modal from "@/modal/Modal.vue";

export default {
  name: "ImagePreviewModal",
  components: { Modal },
  props: {
    imagePreviewModalIsOpen: Boolean,
    imageData: String
  },
  emits: ["event-close-modal"],
  methods: {
    downloadImage() {
      if (!this.imageData) return;

      const link = document.createElement("a");
      link.href = this.imageData;

      const isPng = this.imageData.startsWith("data:image/png");
      const isJpeg = this.imageData.startsWith("data:image/jpeg");
      const isWebp = this.imageData.startsWith("data:image/webp");

      if (isPng) {
        link.download = "receipt.png";
      } else if (isJpeg) {
        link.download = "receipt.jpg";
      } else if (isWebp) {
        link.download = "receipt.webp";
      } else {
        link.download = "receipt-image";
      }

      link.click();
    }
  }
};
</script>