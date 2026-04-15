<template>
  <div class="item-details">
    <div class="item-details-form">
      <div class="detail-row">
        <label class="detail-label" for="item-name">Item</label>
        <input
            id="item-name"
            :value="item.itemName"
            type="text"
            class="detail-input"
            :readonly="isView"
            @input="$emit('event-item-name-updated', $event.target.value)"
        />
      </div>

      <div class="detail-row">
        <label class="detail-label" for="item-date">Date of purchase</label>
        <input
            id="item-date"
            :value="item.itemDate"
            type="date"
            class="detail-input"
            :readonly="isView"
            @input="$emit('event-item-date-updated', $event.target.value)"
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
      <ItemImage :image-data="item.imageData" />

      <ImageInput
          v-if="!isView"
          @event-new-image-selected="onNewImageSelected"
          @event-chosen-image-cleared="onImageCleared"
      />
    </div>
  </div>
</template>

<script>
import ItemImage from "@/components/ItemImage.vue";
import ImageInput from "@/components/inputs/ImageInput.vue";

export default {
  name: "ItemDetails",
  components: { ItemImage, ImageInput },
  props: {
    isView: Boolean,
    item: Object
  },
  methods: {
    onNewImageSelected(base64) {
      this.$emit("event-new-image-selected", base64);
    },
    onImageCleared() {
      this.$emit("event-chosen-image-cleared");
    }
  }
};
</script>