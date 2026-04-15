<template>
  <div class="item-image">
    <ImagePreviewModal
        :image-preview-modal-is-open="imagePreviewModalIsOpen"
        :image-data="imageData"
        @event-close-modal="imagePreviewModalIsOpen = false"
    />

    <button
        v-if="hasImage"
        type="button"
        class="item-image__frame item-image__frame--interactive"
        aria-label="Open receipt image"
        @click="openPreview"
    >
      <img
          :src="imageData"
          class="item-image__img"
          alt="Receipt image"
      />
    </button>

    <div v-else class="item-image__frame item-image__frame--placeholder">
      <img
          src="../assets/images/placeholder_receipt.webp"
          class="item-image__img"
          alt="Placeholder image for a receipt"
      />
    </div>
  </div>
</template>

<script>
import ImagePreviewModal from "@/modal/ImagePreviewModal.vue";

export default {
  name: "ItemImage",
  components: { ImagePreviewModal },
  props: {
    imageData: String
  },
  data() {
    return {
      imagePreviewModalIsOpen: false
    };
  },
  computed: {
    hasImage() {
      return !!this.imageData;
    }
  },
  methods: {
    openPreview() {
      if (!this.hasImage) return;
      this.imagePreviewModalIsOpen = true;
    }
  }
};
</script>