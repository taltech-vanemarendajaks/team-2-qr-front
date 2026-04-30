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
        <label class="detail-label" for="item-warranty-end-date">Warranty Until</label>
        <VueDatePicker
            v-model="localWarrantyEndDate"
            :class="['detail-datepicker', { 'detail-datepicker--clearable': !isView }]"
            :time-config="{ enableTimePicker: false }"
            :locale="enGB"
            auto-apply
            :week-start="1"
            :disabled="isView"
            :clearable="!isView"
            :formats="{ input: 'dd/MM/yyyy' }"
        />
      </div>

      <div class="detail-row" v-if="item.warrantyEndDate && !isView && warrantyIsFuture">
        <label class="detail-label">Warranty Notification</label>
        <label class="notify-toggle">
          <input type="checkbox" v-model="notifyEnabled" @change="onNotifyToggled" />
          <span class="notify-toggle-track"><span class="notify-toggle-thumb"></span></span>
          <span class="notify-label">Notify me before warranty expires</span>
        </label>
      </div>

      <div class="detail-row" v-if="item.warrantyEndDate && !isView && notifyEnabled && warrantyIsFuture">
        <div class="notify-row">
          <input
              type="number"
              class="detail-input notify-days-input"
              :class="{ 'detail-input--error': notifyError }"
              v-model.number="notifyDaysBefore"
              min="1"
              :max="daysUntilWarrantyExpiry"
              placeholder="Days"
              @input="onNotifyInputChanged"
          />
          <span class="notify-label">days before at</span>
          <select
              class="detail-input notify-hour-select"
              v-model.number="notifyHour"
              @change="onNotifyInputChanged"
          >
            <option :value="null" disabled>Hour</option>
            <option v-for="h in 24" :key="h - 1" :value="h - 1">
              {{ String(h - 1).padStart(2, '0') + ':00' }}
            </option>
          </select>
        </div>
        <p v-if="notifyError" class="notify-error">{{ notifyError }}</p>
        <p v-else class="notify-hint">Up to {{ daysUntilWarrantyExpiry }} day{{ daysUntilWarrantyExpiry !== 1 ? 's' : '' }} before expiry</p>
      </div>

      <div class="detail-row" v-if="item.warrantyEndDate && isView && item.warrantyNotifyAt">
        <label class="detail-label">Warranty Notification</label>
        <p class="detail-notify-text">{{ notifyDisplayText }}</p>
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
          :existing-image-data="item.imageData"
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

  data() {
    return {
      notifyDaysBefore: null,
      notifyHour: null,
      notifyEnabled: false,
      notifyError: ''
    };
  },

  watch: {
    'item.warrantyNotifyAt': {
      immediate: true,
      handler(val) {
        if (val && this.item.warrantyEndDate) {
          const notifyDate = new Date(val);
          const [y, m, d] = this.item.warrantyEndDate.split('-').map(Number);
          const endDate = new Date(y, m - 1, d);
          const notifyMidnight = new Date(notifyDate.getFullYear(), notifyDate.getMonth(), notifyDate.getDate());
          this.notifyDaysBefore = Math.round((endDate - notifyMidnight) / 86400000);
          this.notifyHour = notifyDate.getHours();
          this.notifyEnabled = true;
        } else if (!val) {
          this.notifyDaysBefore = null;
          this.notifyHour = null;
          this.notifyEnabled = false;
        }
      }
    },
    'item.warrantyEndDate'(val) {
      if (!val) {
        this.notifyDaysBefore = null;
        this.notifyHour = null;
        this.notifyEnabled = false;
        this.notifyError = '';
        this.$emit('event-warranty-notify-at-updated', null);
      } else if (this.notifyEnabled && this.notifyDaysBefore > this.daysUntilWarrantyExpiry) {
        this.onNotifyInputChanged();
      }
    }
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
    },

    notifyDisplayText() {
      if (!this.item.warrantyNotifyAt || !this.item.warrantyEndDate) return '';
      const notifyDate = new Date(this.item.warrantyNotifyAt);
      const [y, m, d] = this.item.warrantyEndDate.split('-').map(Number);
      const endDate = new Date(y, m - 1, d);
      const notifyMidnight = new Date(notifyDate.getFullYear(), notifyDate.getMonth(), notifyDate.getDate());
      const days = Math.round((endDate - notifyMidnight) / 86400000);
      const hour = notifyDate.getHours();
      return `${days} day${days !== 1 ? 's' : ''} before at ${String(hour).padStart(2, '0')}:00`;
    },

    daysUntilWarrantyExpiry() {
      if (!this.item.warrantyEndDate) return 90;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const [y, m, d] = this.item.warrantyEndDate.split('-').map(Number);
      const expiry = new Date(y, m - 1, d);
      return Math.round((expiry - today) / 86400000);
    },

    warrantyIsFuture() {
      return this.daysUntilWarrantyExpiry > 0;
    },

    localWarrantyEndDate: {
      get() {
        return this.item.warrantyEndDate ? new Date(this.item.warrantyEndDate) : null;
      },
      set(value) {
        if (!value) {
          this.$emit("event-item-warranty-end-date-updated", null);
          return;
        }
        const d = new Date(value);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const dateStr = `${yyyy}-${mm}-${dd}`;
        this.$emit("event-item-warranty-end-date-updated", dateStr);
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

    onNotifyToggled() {
      if (!this.notifyEnabled) {
        this.notifyDaysBefore = null;
        this.notifyHour = null;
        this.notifyError = '';
        this.$emit('event-warranty-notify-at-updated', null);
      }
    },

    onNotifyInputChanged() {
      this.notifyError = '';

      if (!this.item.warrantyEndDate || !this.notifyDaysBefore || this.notifyHour === null) {
        this.$emit('event-warranty-notify-at-updated', null);
        return;
      }

      if (this.notifyDaysBefore < 1) {
        this.notifyError = 'Must be at least 1 day before expiry';
        this.$emit('event-warranty-notify-at-updated', null);
        return;
      }

      if (this.notifyDaysBefore > this.daysUntilWarrantyExpiry) {
        this.notifyError = `Cannot exceed ${this.daysUntilWarrantyExpiry} day${this.daysUntilWarrantyExpiry !== 1 ? 's' : ''} before expiry`;
        this.$emit('event-warranty-notify-at-updated', null);
        return;
      }

      const days = this.notifyDaysBefore;
      const [y, m, day] = this.item.warrantyEndDate.split('-').map(Number);
      const d = new Date(y, m - 1, day);
      d.setDate(d.getDate() - days);
      d.setHours(this.notifyHour, 0, 0, 0);
      this.$emit('event-warranty-notify-at-updated', d.toISOString());
    },

    validateNotification() {
      if (!this.notifyEnabled) return true;

      if (!this.notifyDaysBefore || this.notifyHour === null) {
        this.notifyError = 'Please enter days and select an hour';
        return false;
      }

      if (this.notifyDaysBefore < 1) {
        this.notifyError = 'Must be at least 1 day before expiry';
        return false;
      }

      if (this.notifyDaysBefore > this.daysUntilWarrantyExpiry) {
        this.notifyError = `Cannot exceed ${this.daysUntilWarrantyExpiry} day${this.daysUntilWarrantyExpiry !== 1 ? 's' : ''} before expiry`;
        return false;
      }

      this.notifyError = '';
      return true;
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