<template>
  <div class="image-input">
    <div class="image-input__row">
      <label class="image-input__select modal-button" for="receipt-image-input">
        Choose image
      </label>

      <input
          id="receipt-image-input"
          ref="fileInput"
          class="image-input__native"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          @change="handleImage"
      />

      <button
          type="button"
          class="modal-button modal-button--delete image-input__clear"
          @click="clearFileInput"
      >
        Remove
      </button>
    </div>

    <p class="image-input__hint">
      Accepted formats: PNG, JPG, WEBP
    </p>

    <p v-if="fileName" class="image-input__file-name">
      Selected: {{ fileName }}
    </p>
  </div>
</template>

<script>
export default {
  name: "ImageInput",
  props: {
    resetImageInput: Boolean
  },
  emits: ["event-new-image-selected", "event-chosen-image-cleared"],
  data() {
    return {
      fileName: ""
    };
  },
  watch: {
    resetImageInput(newValue) {
      if (newValue) {
        this.clearFileInput();
      }
    }
  },
  methods: {
    handleImage(event) {
      const selectedImage = event.target.files?.[0];

      if (!selectedImage) {
        this.fileName = "";
        return;
      }

      this.fileName = selectedImage.name;
      this.emitBase64(selectedImage);
    },

    emitBase64(fileObject) {
      const reader = new FileReader();

      reader.onload = () => {
        const imageDataBase64 = reader.result;
        this.$emit("event-new-image-selected", imageDataBase64);
      };

      reader.onerror = () => {
        this.fileName = "";
      };

      reader.readAsDataURL(fileObject);
    },

    clearFileInput() {
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = "";
      }

      this.fileName = "";
      this.$emit("event-chosen-image-cleared");
    }
  }
};
</script>