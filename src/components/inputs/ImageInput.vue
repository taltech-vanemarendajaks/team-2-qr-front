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
          accept="image/png,image/jpeg"
          @change="handleImage"
      />

      <button
          v-if="imageData"
          type="button"
          class="modal-button image-input__rotate"
          @click="rotateImage"
      >
        Rotate
      </button>

      <button
          v-if="hasImage || fileName || imageData"
          type="button"
          class="modal-button modal-button--delete image-input__clear"
          @click="clearFileInput"
          >

        Remove
      </button>
    </div>

    <p class="image-input__hint">
      Accepted formats: PNG, JPG, JPEG. Max size: 10 MB.
    </p>

    <p v-if="fileName" class="image-input__file-name">
      Selected: {{ fileName }}
    </p>
  </div>
</template>

<script>
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg"];

export default {
  name: "ImageInput",
  props: {
    resetImageInput: Boolean,
    hasImage: Boolean,
    existingImageData: String
  },

  emits: [
    "event-new-image-selected",
    "event-chosen-image-cleared",
    "event-image-error"
  ],
  data() {
    return {
      fileName: "",
      imageData: ""
    };
  },
  watch: {
    resetImageInput(newValue) {
      if (newValue) {
        this.clearFileInput();
      }
    },

    existingImageData: {
      immediate: true,
      handler(newValue) {
        this.imageData = newValue || "";
      }
    }
  },
  methods: {

    openFilePicker() { this.$refs.fileInput?.click(); },

    handleImage(event) {
      const selectedImage = event.target.files?.[0];

      this.$emit("event-image-error", "");

      if (!selectedImage) {
        this.fileName = "";
        return;
      }

      if (!ALLOWED_TYPES.includes(selectedImage.type)) {
        this.clearFileInput();
        this.$emit("event-image-error", "Only PNG and JPG/JPEG images are allowed.");
        return;
      }

      if (selectedImage.size > MAX_FILE_SIZE_BYTES) {
        this.clearFileInput();
        this.$emit("event-image-error", "Image is too large. Maximum allowed size is 10 MB.");
        return;
      }

      this.fileName = selectedImage.name;
      this.emitBase64(selectedImage);
    },

    emitBase64(fileObject) {
      const reader = new FileReader();

      reader.onload = () => {
        this.imageData = reader.result;
        this.$emit("event-new-image-selected", this.imageData);
      };

      reader.onerror = () => {
        this.fileName = "";
        this.imageData = "";
        this.$emit("event-image-error", "Could not read the selected image.");
      };

      reader.readAsDataURL(fileObject);
    },

    rotateImage() {
      if (!this.imageData) {
        return;
      }

      const image = new Image();

      image.onload = () => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = image.height;
        canvas.height = image.width;

        context.translate(canvas.width / 2, canvas.height / 2);
        context.rotate(90 * Math.PI / 180);
        context.drawImage(image, -image.width / 2, -image.height / 2);

        this.imageData = canvas.toDataURL("image/jpeg", 0.9);
        this.$emit("event-new-image-selected", this.imageData);
      };

      image.onerror = () => {
        this.$emit("event-image-error", "Could not rotate the image.");
      };

      image.src = this.imageData;
    },


    clearFileInput() {
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = "";
      }

      this.fileName = ""
      this.imageData = "";
      this.$emit("event-chosen-image-cleared");
    }
  }
};
</script>