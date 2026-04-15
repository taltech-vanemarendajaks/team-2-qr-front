<template>
  <div class="qr-image">
    <QrCodeModal
        :qr-code-modal-is-open="qrCodeModalIsOpen"
        :qr-code="qrCode"
        :level="level"
        @event-close-modal="qrCodeModalIsOpen = false"
    />

    <button
        v-if="qrCode"
        type="button"
        class="qr-wrapper"
        aria-label="Open QR code"
        @click="handleClick"
    >
      <QrcodeSvg
          :value="qrCode"
          :size="100"
          :level="level"
      />
    </button>
  </div>
</template>

<script>
import { QrcodeSvg } from "qrcode.vue";
import QrCodeModal from "@/modal/QrCodeModal.vue";

export default {
  name: "QrImage",
  components: {
    QrCodeModal,
    QrcodeSvg
  },
  props: {
    qrCode: String,
    size: {
      type: [Number, String],
      default: 100
    },
    level: {
      type: String,
      default: "H"
    }
  },
  data() {
    return {
      qrCodeModalIsOpen: false,
      screenWidth: window.innerWidth
    };
  },
  computed: {
    computedPreviewSize() {
      if (this.size) {
        return this.size;
      }

      const width = this.screenWidth;

      if (width < 480) {
        return 88;
      }

      if (width < 860) {
        return 96;
      }

      return 112;
    }
  },
  mounted() {
    window.addEventListener("resize", this.updateScreenWidth);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.updateScreenWidth);
  },
  methods: {
    handleClick() {
      this.qrCodeModalIsOpen = true;
    },
    updateScreenWidth() {
      this.screenWidth = window.innerWidth;
    }
  }
};
</script>