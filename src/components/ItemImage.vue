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

    <button
        v-else
        type="button"
        class="item-image__frame item-image__frame--interactive item-image__frame--placeholder"
        :disabled="isView"
        :aria-label="isView ? 'Receipt placeholder image' : 'Add receipt image'"
        @click="handlePlaceholderClick"
    >
      <img
          src="../assets/images/placeholder_receipt.webp"
          class="item-image__img"
          alt="Placeholder image for a receipt"
      />
    </button>
  </div>
</template>

<script>
import ImagePreviewModal from "@/modal/ImagePreviewModal.vue";

export default {
  name: "ItemImage",
  components: { ImagePreviewModal },
  props: {
    imageData: String,
    isView: Boolean
  },
  emits: ["event-placeholder-clicked"],
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
    },

    handlePlaceholderClick() {
      if (this.isView) return;
      this.$emit("event-placeholder-clicked");
    }
  }
};
</script>