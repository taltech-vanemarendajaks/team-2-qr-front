<template>
  <div class="item-details">
    <div class="item-details-form">
      <div class="detail-row">
        <label class="detail-label" for="item-name">Item*</label>
        <input
            id="item-name"
            ref="itemNameInput"
            :value="item.itemName"
            type="text"
            class="detail-input"
            :class="{ 'detail-input--error': validationErrors?.itemName }"
            :readonly="isView"
            @input="$emit('event-item-name-updated', $event.target.value)"
        />
      </div>

      <div class="detail-row" ref="itemDateRow">
        <label class="detail-label" for="item-date">Purchase Date*</label>
        <VueDatePicker
            v-model="localDate"
            class="detail-datepicker"
            :class="{ 'detail-datepicker--error': validationErrors?.itemDate }"
            :time-config="{ enableTimePicker: false }"
            :locale="enGB"
            auto-apply
            :max-date="today"
            :week-start="1"
            :disabled="isView"
            :formats="{ input: 'dd/MM/yyyy' }"
        />
      </div>

      <div class="detail-row">
        <label class="detail-label" for="item-model">Model</label>
        <input
            id="item-model"
            :value="item.model"
            type="text"
            class="detail-input"
            :readonly="isView"
            @input="$emit('event-item-model-updated', $event.target.value)"
        />
      </div>

      <div class="detail-row">
        <label class="detail-label" for="item-comment">Comment</label>
        <textarea
            id="item-comment"
            :value="item.comment"
            class="detail-input detail-input--textarea"
            :readonly="isView"
            rows="4"
            @input="$emit('event-item-comment-updated', $event.target.value)"
        ></textarea>
      </div>
    </div>

    <div class="details-image-panel">
      <ItemImage
          :image-data="item.imageData"
          :is-view="isView"
          @event-placeholder-clicked="openImagePicker"
      />

      <ImageInput
          v-if="!isView"
          ref="imageInput"
          :reset-image-input="resetImageInput"
          :has-image="!!item.imageData"
          @event-new-image-selected="onNewImageSelected"
          @event-chosen-image-cleared="onImageCleared"
      />
    </div>
  </div>
</template>

<script>
import ItemImage from "@/components/ItemImage.vue";
import ImageInput from "@/components/inputs/ImageInput.vue";
import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { enGB } from 'date-fns/locale';

export default {
  name: "ItemDetails",
  components: { ItemImage, ImageInput, VueDatePicker },
  props: {
    isView: Boolean,
    item: Object,
    resetImageInput: Boolean,
    validationErrors: Object
  },

  computed: {
    today() {
      return new Date();
    },
    enGB() {
      return enGB;
    },

    localDate: {
      get() {
        return this.item.itemDate ? new Date(this.item.itemDate) : null;
      },
      set(value) {
        if (!value) {
          this.$emit("event-item-date-updated", "");
          return;
        }
        const d = new Date(value);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        this.$emit("event-item-date-updated", `${yyyy}-${mm}-${dd}`);
      }
    }
  },

  methods: {
    onNewImageSelected(base64) {
      this.$emit("event-new-image-selected", base64);
    },
    onImageCleared() {
      this.$emit("event-chosen-image-cleared");
    },
    openImagePicker() {
      this.$refs.imageInput?.openFilePicker?.();
    },

    scrollToFirstInvalidField() {
      if (this.validationErrors?.itemName) {
        this.$refs.itemNameInput?.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
        return;
      }

      if (this.validationErrors?.itemDate) {
        this.$refs.itemDateRow?.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }
    },

  }
};
</script>